const FileModel = require('../models/file-model')
const UserModel = require('../models/user-model')
const TournamentUserModel = require('../models/tournament_user-model')
const fs = require('fs')
const path = require('path')
const i18next = require('i18next')
const { ApiError } = require('../exceptions/api-error')
const Helpers = require('../helpers/helpers')
const { logError } = require('../config/logger')

class FileService {
	async uploadCover(cover, userId, lng = 'en', tournamentId = null) {
		try {
			let file

			if (tournamentId) {
				file = await FileModel.create({
					user: null,
					tournament: tournamentId,
					name: cover.filename,
					size: cover.size,
					mimetype: cover.mimetype,
				})
			} else {
				const user = await UserModel.findById(userId)

				if (!user) {
					throw ApiError.BadRequest(i18next.t('errors.user_not_found', { lng }))
				}

				if (user.cover) {
					const filename = user.cover.split('/').pop()
					const oldFile = await FileModel.findOneAndDelete({
						user: user._id,
						name: filename,
					})

					if (oldFile) {
						const filePath = path.join(__dirname, '../uploads', oldFile.name)

						if (fs.existsSync(filePath)) {
							try {
								fs.unlinkSync(filePath)
							} catch (err) {
								if (err.code !== 'ENOENT') {
									logError(err, {
										context: 'delete old file',
										userId,
										fileName: oldFile.name,
									})
								}
							}
						}
					}
				}

				const updatedUser = await UserModel.findByIdAndUpdate(
					userId,
					{
						$set: {
							cover:
								process.env.API_URL + '/uploads/' + path.basename(cover.path),
						},
					},
					{ returnDocument: 'after' }
				)

				if (!updatedUser) {
					throw ApiError.BadRequest(
						i18next.t('errors.user_update_failed', { lng })
					)
				}

				file = await FileModel.create({
					user: updatedUser._id,
					tournament: null,
					name: cover.filename,
					size: cover.size,
					mimetype: cover.mimetype,
				})

				await updatedUser.save()

				try {
					await TournamentUserModel.updateMany(
						{ id: updatedUser._id },
						{ $set: { cover: updatedUser.cover } }
					)
				} catch (error) {
					logError(error, {
						context: 'update tournament users',
						userId: updatedUser._id,
					})
				}
			}

			await file.save()

			return {
				message: i18next.t('success.file_saved', { lng }),
			}
		} catch (error) {
			Helpers.handleFileError(
				error,
				lng,
				'uploadCover',
				'errors.file_upload_failed'
			)
		}
	}

	async removeCover(file_name, userId, lng = 'en') {
		try {
			const file = await FileModel.findOneAndDelete({
				user: userId,
				name: file_name,
			})

			if (!file) {
				throw ApiError.BadRequest(i18next.t('errors.file_not_found', { lng }))
			}

			const filePath = path.join(__dirname, '../uploads', file.name)

			if (fs.existsSync(filePath)) {
				try {
					fs.unlinkSync(filePath)
				} catch (error) {
					logError(error, {
						context: 'delete file from disk',
						userId,
						fileName: file.name,
					})
				}
			}

			const updatedUser = await UserModel.findOneAndUpdate(
				{ _id: userId },
				{
					$set: {
						cover: null,
						updated_at: new Date(),
					},
				},
				{ returnDocument: 'after' }
			)

			if (!updatedUser) {
				throw ApiError.BadRequest(i18next.t('errors.user_not_found', { lng }))
			}

			try {
				await TournamentUserModel.updateMany(
					{ id: userId },
					{ $set: { cover: null } }
				)
			} catch (error) {
				logError(error, {
					context: 'update tournament users after file removal',
					userId,
				})
			}

			return {
				message: i18next.t('success.file_deleted', { lng }),
			}
		} catch (error) {
			Helpers.handleFileError(
				error,
				lng,
				'removeCover',
				'errors.file_deletion_failed'
			)
		}
	}
}

module.exports = new FileService()
