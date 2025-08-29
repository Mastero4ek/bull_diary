const fs = require('fs')
const path = require('path')

const i18next = require('i18next')

const { logError } = require('@configs/logger-config')
const { ApiError } = require('@exceptions/api-error')
const { handleFileError } = require('@helpers/error-helpers')
const FileModel = require('@models/core/file-model')
const TournamentUserModel = require('@models/core/tournament_user-model')
const UserModel = require('@models/core/user-model')

class FileService {
	/**
	 * Загружает обложку для пользователя или турнира
	 * @param {Object} cover - Файл обложки
	 * @param {string} userId - ID пользователя (null для турнира)
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {string} tournamentId - ID турнира (по умолчанию null)
	 * @returns {Promise<Object>} - Сообщение об успешной загрузке
	 */
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
					throw ApiError.BadRequest(i18next.t('error.user.not_found', { lng }))
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
							cover: `${process.env.API_URL}/uploads/${path.basename(cover.path)}`,
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
				message: i18next.t('success.file.saved', { lng }),
			}
		} catch (error) {
			handleFileError(error, lng, 'uploadCover', 'Failed to upload cover')
		}
	}

	/**
	 * Удаляет обложку пользователя
	 * @param {string} file_name - Имя файла для удаления
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Сообщение об успешном удалении
	 */
	async removeCover(file_name, userId, lng = 'en') {
		try {
			const file = await FileModel.findOneAndDelete({
				user: userId,
				name: file_name,
			})

			if (!file) {
				throw ApiError.BadRequest(i18next.t('error.file.not_found', { lng }))
			}

			const filePath = path.join(__dirname, '../uploads', file.name)

			if (fs.existsSync(filePath)) {
				try {
					fs.unlinkSync(filePath)
				} catch (error) {
					logError(error, {
						context: 'Delete file from disk',
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
				throw ApiError.BadRequest(i18next.t('error.user.not_found', { lng }))
			}

			try {
				await TournamentUserModel.updateMany(
					{ id: userId },
					{ $set: { cover: null } }
				)
			} catch (error) {
				logError(error, {
					context: 'Update tournament users after file removal',
					userId,
				})
			}

			return {
				message: i18next.t('success.file.deleted', { lng }),
			}
		} catch (error) {
			handleFileError(error, lng, 'removeCover', 'Failed to remove cover')
		}
	}

	/**
	 * Удаляет все файлы пользователя
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Сообщение об успешном удалении
	 */
	async removeUserFiles(userId, lng = 'en') {
		try {
			const files = await FileModel.find({ user: userId })

			if (files.length === 0) {
				return {
					message: i18next.t('success.file.deleted', { lng }),
				}
			}

			for (const file of files) {
				const filePath = path.join(__dirname, '../uploads', file.name)

				if (fs.existsSync(filePath)) {
					try {
						fs.unlinkSync(filePath)
					} catch (error) {
						logError(error, {
							context: 'Delete user file from disk',
							userId,
							fileName: file.name,
						})
					}
				}
			}

			await FileModel.deleteMany({ user: userId })

			await UserModel.findOneAndUpdate(
				{ _id: userId },
				{
					$set: {
						cover: null,
						updated_at: new Date(),
					},
				}
			)

			try {
				await TournamentUserModel.updateMany(
					{ id: userId },
					{ $set: { cover: null } }
				)
			} catch (error) {
				logError(error, {
					context: 'Update tournament users after user files removal',
					userId,
				})
			}

			return {
				message: i18next.t('success.file.deleted', { lng }),
			}
		} catch (error) {
			handleFileError(
				error,
				lng,
				'removeUserFiles',
				'Failed to remove user files'
			)
		}
	}
}

module.exports = new FileService()
