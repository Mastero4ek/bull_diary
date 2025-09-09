const { logError } = require('@configs/logger-config')
const TournamentModel = require('@models/core/tournament-model')
const TournamentUserModel = require('@models/core/tournament_user-model')

const TournamentService = require('./tournament-service')

class TournamentChangeStreamService {
	constructor() {
		this.changeStreams = new Map()
		this.subscribers = new Map()
		this.isInitialized = false
	}

	/**
	 * Инициализирует Change Streams для отслеживания изменений в турнирах
	 */
	async initialize() {
		if (this.isInitialized) return

		try {
			this.tournamentChangeStream = TournamentModel.watch([
				{
					$match: {
						$or: [
							{ operationType: 'insert' },
							{ operationType: 'update' },
							{ operationType: 'delete' },
						],
					},
				},
			])

			this.tournamentUserChangeStream = TournamentUserModel.watch([
				{
					$match: {
						$or: [
							{ operationType: 'insert' },
							{ operationType: 'update' },
							{ operationType: 'delete' },
						],
					},
				},
			])

			this.tournamentChangeStream.on('change', async change => {
				await this.handleTournamentChange(change)
			})

			this.tournamentUserChangeStream.on('change', async change => {
				await this.handleTournamentUserChange(change)
			})

			this.tournamentChangeStream.on('error', error => {
				logError('Tournament Change Stream error:', error)
			})

			this.tournamentUserChangeStream.on('error', error => {
				logError('Tournament User Change Stream error:', error)
			})

			this.isInitialized = true
		} catch (error) {
			logError('Failed to initialize Tournament Change Streams:', error)
			throw error
		}
	}

	/**
	 * Обрабатывает изменения в коллекции турниров
	 * @param {Object} change - Изменение
	 */
	async handleTournamentChange(change) {
		try {
			const { operationType, fullDocument, documentKey } = change

			let exchange = null

			if (fullDocument) {
				exchange = fullDocument.exchange
			} else if (operationType === 'delete') {
				const tournament = await TournamentModel.findById(documentKey._id)

				if (tournament) {
					exchange = tournament.exchange
				}
			}

			if (!exchange) return

			await this.notifySubscribers(exchange, operationType)
		} catch (error) {
			logError('Error handling tournament change:', error)
		}
	}

	/**
	 * Обрабатывает изменения в коллекции участников турниров
	 * @param {Object} change - Изменение
	 */
	async handleTournamentUserChange(change) {
		try {
			const { operationType, fullDocument, documentKey } = change

			let tournamentId = null
			if (fullDocument) {
				tournamentId = fullDocument.tournament
			} else if (operationType === 'delete') {
				logError('Delete operation detected for tournament user:', {
					documentId: documentKey._id,
				})

				await this.notifyAllSubscribers(operationType)
				return
			}

			if (!tournamentId) {
				logError('No tournamentId found for change:', change)
				return
			}

			const tournament = await TournamentModel.findById(tournamentId)
			if (!tournament) {
				logError('Tournament not found for ID:', { tournamentId })
				return
			}

			await this.notifySubscribers(tournament.exchange, operationType)
		} catch (error) {
			logError('Error handling tournament user change:', error)
		}
	}

	/**
	 * Уведомляет всех подписчиков об изменениях
	 * @param {string} exchange - Биржа
	 * @param {string} operationType - Тип операции
	 */
	async notifySubscribers(exchange, operationType) {
		try {
			const subscribers = Array.from(this.subscribers.values()).filter(
				sub => sub.exchange === exchange
			)

			for (const subscriber of subscribers) {
				const { socket, params } = subscriber

				const tournaments = await TournamentService.getTournaments(
					exchange,
					params.language || 'en',
					params.page || 1,
					params.size || 5,
					params.search,
					params.sort || null
				)

				socket.emit('tournaments_update', {
					tournaments,
					changeType: operationType,
				})
			}
		} catch (error) {
			logError('Error notifying subscribers:', error)
		}
	}

	/**
	 * Уведомляет всех подписчиков всех exchange об изменениях
	 * Используется когда не можем определить конкретный exchange
	 * @param {string} operationType - Тип операции
	 */
	async notifyAllSubscribers(operationType) {
		try {
			const subscribers = Array.from(this.subscribers.values())

			for (const subscriber of subscribers) {
				const { socket, params, exchange } = subscriber

				const tournaments = await TournamentService.getTournaments(
					exchange,
					params.language || 'en',
					params.page || 1,
					params.size || 5,
					params.search,
					params.sort || null
				)

				socket.emit('tournaments_update', {
					tournaments,
					changeType: operationType,
				})
			}
		} catch (error) {
			logError('Error notifying all subscribers:', error)
		}
	}

	/**
	 * Добавляет подписчика на изменения турниров
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Биржа
	 * @param {Object} socket - WebSocket соединение
	 * @param {Object} params - Параметры подписки
	 */
	addSubscriber(userId, exchange, socket, params) {
		this.subscribers.set(userId, {
			exchange: exchange.toLowerCase(),
			socket,
			params: {
				page: params.page || 1,
				size: params.size || 5,
				search: params.search || null,
				sort: params.sort || null,
				language: params.language || 'en',
			},
		})
	}

	/**
	 * Удаляет подписчика
	 * @param {string} userId - ID пользователя
	 */
	removeSubscriber(userId) {
		this.subscribers.delete(userId)
	}

	/**
	 * Обновляет параметры подписки
	 * @param {string} userId - ID пользователя
	 * @param {Object} params - Параметры подписки
	 */
	updateSubscriber(userId, params) {
		const subscriber = this.subscribers.get(userId)
		if (subscriber) {
			subscriber.params = {
				...subscriber.params,
				...params,
			}
		}
	}

	/**
	 * Получает количество активных подписчиков
	 */
	getSubscribersCount() {
		return this.subscribers.size
	}

	/**
	 * Получает конкретного подписчика по userId
	 * @param {string} userId - ID пользователя
	 * @returns {Object|null} Данные подписчика или null
	 */
	getSubscriber(userId) {
		const subscriber = this.subscribers.get(userId)
		return subscriber ? { ...subscriber, userId } : null
	}

	/**
	 * Получает список активных подписчиков
	 */
	getSubscribers() {
		return Array.from(this.subscribers.entries()).map(([userId, data]) => ({
			userId,
			exchange: data.exchange,
			params: data.params,
		}))
	}

	/**
	 * Закрывает Change Streams
	 */
	async close() {
		try {
			if (this.tournamentChangeStream) {
				await this.tournamentChangeStream.close()
			}
			if (this.tournamentUserChangeStream) {
				await this.tournamentUserChangeStream.close()
			}
			this.subscribers.clear()
			this.isInitialized = false
		} catch (error) {
			logError('Error closing Tournament Change Streams:', error)
		}
	}
}

module.exports = new TournamentChangeStreamService()
