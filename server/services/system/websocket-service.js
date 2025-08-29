const { t } = require('i18next')
const { Server } = require('socket.io')

const { logError } = require('@configs/logger-config')
const SyncExecutor = require('@services/core/sync-executor')
const TournamentService = require('@services/core/tournament-service')
const BybitWebSocketService = require('@services/exchange/bybit/bybit-websocket')

class WebSocketService {
	constructor() {
		this.io = null
		this.clientConnections = new Map()
		this.userSockets = new Map()
		this.syncProgressCallbacks = new Map()
		this.keysService = null
	}

	/**
	 * Устанавливает сервис для работы с API ключами
	 * @param {Object} keysService - Сервис для работы с API ключами
	 */
	setKeysService(keysService) {
		this.keysService = keysService
	}

	/**
	 * Инициализирует WebSocket сервер и настраивает обработчики событий
	 * @param {import('http').Server} server - HTTP сервер для привязки WebSocket
	 */
	initialize(server) {
		this.io = new Server(server, {
			path: '/api/v1/socket.io',
			cors: {
				origin: process.env.CLIENT_URL,
				methods: ['GET', 'POST'],
			},
		})

		this.io.on('connection', socket => {
			socket.on('subscribe_positions', async data => {
				try {
					const { userId, exchange } = data

					if (!userId || !exchange) {
						logError(
							`Missing userId or exchange: userId=${userId}, exchange=${exchange}`
						)
						socket.emit('error', { message: 'Missing userId or exchange' })
						return
					}

					this.clientConnections.set(socket.id, userId)
					this.userSockets.set(userId, socket)

					if (!this.keysService) {
						logError('KeysService not initialized')
						socket.emit('error', { message: 'Service not initialized' })
						return
					}

					const keys = await this.keysService.findDecryptedKeys(userId, 'en')

					if (!keys || keys.message) {
						logError(`Keys not found for user ${userId}:`, keys)
						socket.emit('error', { message: t('error.keys.not_found') })
						return
					}

					const current_keys = keys.keys.find(item => item.name === exchange)

					if (!current_keys || !current_keys.api || !current_keys.secret) {
						logError(
							`Keys not configured for user ${userId}, exchange ${exchange}`
						)
						socket.emit('error', {
							message: t('error.keys.not_configured', { exchange }),
						})
						return
					}

					BybitWebSocketService.disconnectClient(userId)

					BybitWebSocketService.createClient(
						userId,
						current_keys,
						positions => {
							socket.emit('positions_update', { positions })
						}
					)

					socket.emit('connection_status', {
						connected: true,
						message: 'Connected to Bybit WebSocket',
					})
				} catch (error) {
					logError('Error in subscribe_positions:', error)
					socket.emit('error', { message: 'Internal server error' })
				}
			})

			socket.on('start_sync', async data => {
				try {
					const {
						userId,
						exchange,
						start_time,
						end_time,
						language = 'en',
					} = data

					if (!userId || !exchange || !start_time || !end_time) {
						socket.emit('sync_error', {
							message: 'Missing required parameters',
						})
						return
					}

					if (!this.keysService) {
						logError('KeysService not initialized')
						socket.emit('sync_error', { message: 'Service not initialized' })
						return
					}

					const keys = await this.keysService.findDecryptedKeys(
						userId,
						language
					)

					if (!keys || keys.message) {
						socket.emit('sync_error', { message: t('error.keys.not_found') })
						return
					}

					const current_keys = keys.keys.find(item => item.name === exchange)

					if (!current_keys || !current_keys.api || !current_keys.secret) {
						socket.emit('sync_error', {
							message: t('error.keys.not_configured', { exchange }),
						})
						return
					}

					this.userSockets.set(userId, socket)

					this.syncProgressCallbacks.set(
						userId,
						(progress, status, message) => {
							socket.emit('sync_progress', { progress, status, message })
						}
					)

					this.startBackgroundSync(
						userId,
						exchange,
						current_keys,
						start_time,
						end_time,
						language
					)
				} catch (error) {
					logError('Error in start_sync:', error)
					socket.emit('sync_error', { message: 'Internal server error' })
				}
			})

			socket.on('get_sync_progress', data => {
				const { userId } = data
				if (userId) {
					const progress = SyncExecutor.getSyncProgress(userId)
					socket.emit('sync_progress', {
						progress: progress.progress,
						status: progress.status,
						message: progress.message,
					})
				}
			})

			socket.on('cancel_sync', data => {
				try {
					const { userId, exchange } = data

					SyncExecutor.clearSyncProgress(userId)

					if (exchange) {
						if (this.keysService) {
							this.keysService
								.updateSyncStatus(userId, exchange, false, 'en')
								.catch(error =>
									logError('Error updating sync status on cancel:', error)
								)

							this.keysService
								.clearKeysForExchange(userId, exchange, 'en')
								.catch(error =>
									logError('Error clearing keys on cancel:', error)
								)
						}
					}

					this.syncProgressCallbacks.delete(userId)
					socket.emit('sync_cancelled', { message: 'Sync cancelled' })
				} catch (error) {
					logError('Error in cancel_sync:', error)
				}
			})

			socket.on('unsubscribe_positions', data => {
				const { userId } = data

				if (userId) {
					BybitWebSocketService.disconnectClient(userId)

					this.userSockets.delete(userId)
					this.clientConnections.delete(socket.id)
				}
			})

			socket.on('subscribe_tournaments', async data => {
				try {
					const {
						userId,
						exchange,
						page = 1,
						size = 5,
						search = null,
						sort = null,
						language = 'en',
					} = data

					if (!userId || !exchange) {
						logError('Missing userId or exchange for tournaments subscription')
						socket.emit('error', { message: 'Missing userId or exchange' })
						return
					}

					this.tournamentSubscriptions =
						this.tournamentSubscriptions || new Map()
					this.tournamentSubscriptions.set(userId, {
						exchange,
						page,
						size,
						search,
						sort,
						language,
					})

					const tournaments = await TournamentService.getTournaments(
						exchange,
						language,
						page,
						size,
						search,
						sort
					)

					socket.emit('tournaments_update', { tournaments })

					this.startTournamentUpdates(userId, socket)
				} catch (error) {
					logError('Error in subscribe_tournaments:', error)
					socket.emit('error', {
						message: 'Failed to subscribe to tournaments',
					})
				}
			})

			socket.on('unsubscribe_tournaments', data => {
				const { userId } = data
				if (userId) {
					this.stopTournamentUpdates(userId)
					this.tournamentSubscriptions?.delete(userId)
				}
			})

			socket.on('update_tournament_subscription', data => {
				const { userId, page, size, search, sort, language } = data
				if (userId) {
					this.updateTournamentSubscription(userId, {
						page,
						size,
						search,
						sort,
						language,
					})
				}
			})

			socket.on('get_connection_status', data => {
				const { userId } = data
				if (userId) {
					const isConnected = BybitWebSocketService.getConnectionStatus(userId)
					socket.emit('connection_status', {
						connected: isConnected,
						message: isConnected ? 'Connected' : 'Disconnected',
					})
				}
			})

			socket.on('disconnect', () => {
				const userId = this.clientConnections.get(socket.id)
				if (userId) {
					this.clientConnections.delete(socket.id)
					this.userSockets.delete(userId)
					this.syncProgressCallbacks.delete(userId)
					this.stopTournamentUpdates(userId)
					this.tournamentSubscriptions?.delete(userId)
					BybitWebSocketService.disconnectClient(userId)
				}
			})

			socket.on('auto_sync_completed', async data => {
				try {
					const { userId, exchange, language = 'en' } = data
					if (userId && exchange && this.keysService) {
						await this.keysService.updateSyncStatus(
							userId,
							exchange,
							true,
							language
						)
					}
				} catch (error) {
					logError('Error updating auto sync status:', error)
				}
			})

			socket.on('auto_sync_error', async data => {
				try {
					const { userId, exchange, language = 'en' } = data
					if (userId && exchange && this.keysService) {
						await this.keysService.updateSyncStatus(
							userId,
							exchange,
							false,
							language
						)
					}
				} catch (error) {
					logError('Error updating auto sync error status:', error)
				}
			})
		})
	}

	/**
	 * Запускает фоновую синхронизацию данных для пользователя
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи
	 * @param {Object} keys - API ключи для биржи
	 * @param {string|Date} start_time - Время начала периода синхронизации
	 * @param {string|Date} end_time - Время окончания периода синхронизации
	 * @param {string} language - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<void>}
	 */
	async startBackgroundSync(
		userId,
		exchange,
		keys,
		start_time,
		end_time,
		language = 'en'
	) {
		try {
			const startMs =
				typeof start_time === 'string'
					? new Date(start_time).getTime()
					: start_time
			const endMs =
				typeof end_time === 'string' ? new Date(end_time).getTime() : end_time

			const socketEmitter = (eventName, data) => {
				const socket = this.userSockets.get(userId)
				if (socket) {
					socket.emit(eventName, data)
				}
			}

			await SyncExecutor.executeSyncProcess(
				userId,
				exchange,
				keys,
				startMs,
				endMs,
				language,
				{
					isAutoSync: false,
					socketEmitter,
					keysService: this.keysService,
				}
			)

			setTimeout(() => {
				this.syncProgressCallbacks.delete(userId)
			}, 5000)
		} catch (error) {
			logError(`Error in background sync for user ${userId}:`, error)

			const socket = this.userSockets.get(userId)
			if (socket) {
				socket.emit('sync_error', {
					message: `Sync failed: ${error.message}`,
				})
			}

			this.syncProgressCallbacks.delete(userId)
		}
	}

	/**
	 * Запускает периодические обновления турниров для пользователя
	 * @param {string} userId - ID пользователя
	 * @param {Object} socket - WebSocket сокет
	 */
	startTournamentUpdates(userId, socket) {
		this.stopTournamentUpdates(userId)

		const updateInterval = setInterval(async () => {
			try {
				const subscription = this.tournamentSubscriptions?.get(userId)
				if (!subscription) {
					this.stopTournamentUpdates(userId)
					return
				}

				const { exchange, page, size, search, sort, language } = subscription
				const tournaments = await TournamentService.getTournaments(
					exchange,
					language,
					page,
					size,
					search,
					sort
				)

				socket.emit('tournaments_update', { tournaments })
			} catch (error) {
				logError(`Error updating tournaments for user ${userId}:`, error)
			}
		}, 3000)

		this.tournamentUpdateIntervals = this.tournamentUpdateIntervals || new Map()
		this.tournamentUpdateIntervals.set(userId, updateInterval)
	}

	/**
	 * Останавливает периодические обновления турниров для пользователя
	 * @param {string} userId - ID пользователя
	 */
	stopTournamentUpdates(userId) {
		const interval = this.tournamentUpdateIntervals?.get(userId)
		if (interval) {
			clearInterval(interval)
			this.tournamentUpdateIntervals.delete(userId)
		}
	}

	/**
	 * Обновляет параметры подписки на турниры для пользователя
	 * @param {string} userId - ID пользователя
	 * @param {Object} params - Новые параметры подписки
	 */
	updateTournamentSubscription(userId, params) {
		const subscription = this.tournamentSubscriptions?.get(userId)
		if (subscription) {
			Object.assign(subscription, params)
		}
	}

	/**
	 * Получает количество подключенных клиентов
	 * @returns {number} Количество активных WebSocket подключений
	 */
	getConnectedClientsCount() {
		return this.clientConnections.size
	}

	/**
	 * Получает статистику подключений и состояния сервиса
	 * @returns {Object} Объект со статистикой:
	 * @returns {number} returns.clientConnections - Количество WebSocket подключений
	 * @returns {number} returns.bybitConnections - Количество активных подключений к Bybit
	 * @returns {Array} returns.connectedUsers - Список подключенных пользователей
	 */
	getStats() {
		return {
			clientConnections: this.clientConnections.size,
			bybitConnections: BybitWebSocketService.getActiveConnectionsCount(),
			connectedUsers: BybitWebSocketService.getConnectedUsers(),
		}
	}
}

module.exports = new WebSocketService()
