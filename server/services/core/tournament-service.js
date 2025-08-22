const TournamentModel = require('@models/core/tournament-model')
const TournamentUserModel = require('@models/core/tournament_user-model')
const UserModel = require('@models/core/user-model')
const LevelModel = require('@models/core/level-model')
const { ApiError } = require('@exceptions/api-error')
const i18next = require('i18next')
const fileService = require('./file-service')
const mongoose = require('mongoose')
const FileModel = require('@models/core/file-model')
const fs = require('fs')
const path = require('path')
const { handleDatabaseError } = require('@helpers/error-helpers')
const { logError } = require('@configs/logger-config')

class TournamentService {
	/**
	 * Создает новый турнир
	 * @param {Object} data - Данные турнира
	 * @param {Object} file - Файл обложки турнира
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Созданный турнир с участниками
	 */
	async createTournament(data, file, lng = 'en') {
		try {
			let {
				name,
				description,
				start_date,
				end_date,
				registration_date,
				exchange,
			} = data

			exchange = exchange.toLowerCase()

			const existingTournament = await TournamentModel.findOne({ exchange })

			if (existingTournament) {
				throw ApiError.BadRequest(
					i18next.t('errors.tournament_already_exists', { lng, exchange })
				)
			}

			let coverUrl = null
			let fileDoc = null
			let tempTournament = null

			if (file) {
				tempTournament = await TournamentModel.create({
					name,
					description,
					cover: null,
					start_date,
					end_date,
					registration_date,
					exchange,
				})

				fileDoc = await fileService.uploadCover(
					file,
					null,
					lng,
					tempTournament._id
				)
				coverUrl = process.env.API_URL + '/uploads/' + file.filename
				tempTournament.cover = coverUrl

				await tempTournament.save()
			} else {
				tempTournament = await TournamentModel.create({
					name,
					description,
					cover: null,
					start_date,
					end_date,
					registration_date,
					exchange,
				})
			}

			const tournament = await this.getTournaments(exchange, lng, 1, 5)

			return tournament
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'createTournament',
				'errors.tournament_creation_failed'
			)
		}
	}

	/**
	 * Удаляет турнир и все связанные файлы
	 * @param {string} tournamentId - ID турнира
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Удаленный турнир
	 */
	async removeTournament(tournamentId, lng = 'en') {
		try {
			const tournament = await TournamentModel.findByIdAndDelete(tournamentId)

			if (!tournament) {
				throw ApiError.BadRequest(
					i18next.t('errors.tournament_not_found', { lng })
				)
			}

			const files = await FileModel.find({ tournament: tournament._id })

			for (const file of files) {
				const filePath = path.join(__dirname, '../uploads', file.name)

				if (fs.existsSync(filePath)) {
					try {
						fs.unlinkSync(filePath)
					} catch (err) {
						if (err.code !== 'ENOENT') {
							logError(err, {
								context: 'tournament file deletion',
								tournamentId: tournament._id,
								fileName: file.name,
							})
						}
					}
				}

				await file.deleteOne()
			}

			await TournamentUserModel.deleteMany({ tournament: tournament._id })

			await UserModel.updateMany(
				{ 'tournaments.id': tournament._id },
				{ $pull: { tournaments: { id: tournament._id } } }
			)

			return tournament
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'removeTournament',
				'errors.tournament_deletion_failed'
			)
		}
	}

	/**
	 * Добавляет пользователя в турнир
	 * @param {string} exchange - Название биржи
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {number} page - Номер страницы (по умолчанию 1)
	 * @param {number} limit - Количество записей на странице (по умолчанию 5)
	 * @returns {Promise<Object>} - Турнир с обновленным списком участников
	 */
	async addTournamentUser(exchange, userId, lng = 'en', page = 1, limit = 5) {
		try {
			exchange = exchange.toLowerCase()

			const user = await UserModel.findOne({ _id: userId })
			const tournament = await TournamentModel.findOne({ exchange })

			if (!tournament) {
				throw ApiError.BadRequest(
					i18next.t('errors.tournament_not_found', { lng, exchange })
				)
			}

			if (!user) {
				throw ApiError.BadRequest(
					i18next.t('errors.user_with_email_not_found', { lng })
				)
			}

			const alreadyJoined = await TournamentUserModel.findOne({
				tournament: tournament._id,
				id: user._id,
			})

			if (alreadyJoined) {
				throw ApiError.BadRequest(
					i18next.t('errors.already_joined', { lng, exchange })
				)
			}

			const level = await LevelModel.findOne({ user: user._id })

			if (!level) {
				throw ApiError.BadRequest(
					i18next.t('errors.user_level_not_found', { lng })
				)
			}

			await TournamentUserModel.create({
				tournament: tournament._id,
				id: user._id,
				name: user.name,
				cover: user.cover,
				level: {
					name: level.level.name || 'hamster',
					value: level.level.value || 0,
				},
				updated_at: user.updated_at,
			})

			if (!user.tournaments) user.tournaments = []

			if (!user.tournaments.some(t => t.id.equals(tournament._id))) {
				user.tournaments.push({ exchange, id: tournament._id })

				await user.save()
			}

			const users = await TournamentUserModel.find({
				tournament: tournament._id,
			})
				.skip((page - 1) * limit)
				.limit(limit)
				.exec()

			if (!users || users.length === 0) {
				return {
					tournament,
					users: [],
					total: 0,
					message: i18next.t('errors.no_members', { lng }),
				}
			}

			const total = await TournamentUserModel.countDocuments({
				tournament: tournament._id,
			})

			return { tournament, users, total }
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'addTournamentUser',
				'errors.tournament_user_add_failed'
			)
		}
	}

	/**
	 * Удаляет пользователя из турнира
	 * @param {string} tournamentId - ID турнира
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Сообщение об успешном удалении
	 */
	async removeTournamentUser(tournamentId, userId, lng = 'en') {
		try {
			const tournament = await TournamentModel.findById(tournamentId)

			if (!tournament) {
				throw ApiError.BadRequest(
					i18next.t('errors.tournament_not_found', { lng })
				)
			}

			const user = await UserModel.findById(userId)

			if (!user) {
				throw ApiError.BadRequest(i18next.t('errors.user_not_found', { lng }))
			}

			const tournamentUser = await TournamentUserModel.findOne({
				tournament: tournamentId,
				id: userId,
			})

			if (!tournamentUser) {
				throw ApiError.BadRequest(
					i18next.t('errors.user_not_in_tournament', { lng })
				)
			}

			await TournamentUserModel.deleteOne({
				tournament: tournamentId,
				id: userId,
			})

			await UserModel.updateOne(
				{ _id: userId },
				{ $pull: { tournaments: { id: tournamentId } } }
			)

			return {
				message: i18next.t('success.user_removed_from_tournament', { lng }),
			}
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'removeTournamentUser',
				'errors.tournament_user_removal_failed'
			)
		}
	}

	/**
	 * Получает турнир с участниками с пагинацией
	 * @param {string} exchange - Название биржи
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {number} page - Номер страницы (по умолчанию 1)
	 * @param {number} size - Количество записей на странице (по умолчанию 5)
	 * @param {string} cursor - Курсор для пагинации (по умолчанию null)
	 * @returns {Promise<Object>} - Турнир с участниками и метаданными пагинации
	 */
	async getTournaments(
		exchange,
		lng = 'en',
		page = 1,
		size = 5,
		cursor = null
	) {
		try {
			exchange = exchange.toLowerCase()

			const tournament = await TournamentModel.findOne({ exchange })

			if (!tournament) {
				return {
					tournament: {},
					users: [],
					hasMore: false,
					nextCursor: null,
					message: i18next.t('errors.tournament_not_found', { lng }),
				}
			}

			const skip = (parseInt(page) - 1) * parseInt(size)
			const limit = parseInt(size)
			let query = { tournament: tournament._id }

			if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
				query._id = { $gt: mongoose.Types.ObjectId(cursor) }
			}

			const participants = await TournamentUserModel.find(query)
				.skip(skip)
				.limit(limit)
				.sort({ _id: 1 })
				.exec()

			const hasMore = participants.length > limit
			const items = hasMore ? participants.slice(0, -1) : participants

			if (!items || items.length === 0) {
				return {
					tournament,
					users: [],
					hasMore: false,
					nextCursor: null,
					message: i18next.t('errors.no_members', { lng }),
				}
			}

			return {
				tournament,
				users: items,
				hasMore,
				nextCursor: hasMore ? items[items.length - 1]._id : null,
			}
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'getTournaments',
				'errors.tournament_fetch_failed'
			)
		}
	}
}

module.exports = new TournamentService()
