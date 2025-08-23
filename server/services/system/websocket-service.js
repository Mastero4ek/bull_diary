const { Server } = require('socket.io')
const BybitWebSocketService = require('@services/exchange/bybit/bybit-websocket')
const KeysService = require('@services/auth/keys-service')
const SyncWebSocketService = require('@services/core/sync-websocket')
const { logError } = require('@configs/logger-config')
const { t } = require('i18next')

class WebSocketService {
	constructor() {
		this.io = null
		this.clientConnections = new Map()
		this.userSockets = new Map()
		this.syncProgressCallbacks = new Map()
	}

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
						socket.emit('error', { message: 'Missing userId or exchange' })
						return
					}

					this.clientConnections.set(socket.id, userId)
					this.userSockets.set(userId, socket)

					const keys = await KeysService.findDecryptedKeys(userId, 'en')

					if (!keys || keys.message) {
						socket.emit('error', { message: t('errors.keys_not_found') })
						return
					}

					const current_keys = keys.keys.find(item => item.name === exchange)

					if (!current_keys || !current_keys.api || !current_keys.secret) {
						socket.emit('error', {
							message: t('errors.keys_not_configured', { exchange }),
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

					const keys = await KeysService.findDecryptedKeys(userId, language)

					if (!keys || keys.message) {
						socket.emit('sync_error', { message: t('errors.keys_not_found') })
						return
					}

					const current_keys = keys.keys.find(item => item.name === exchange)

					if (!current_keys || !current_keys.api || !current_keys.secret) {
						socket.emit('sync_error', {
							message: t('errors.keys_not_configured', { exchange }),
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
					const progress = SyncWebSocketService.getSyncProgress(userId)
					socket.emit('sync_progress', {
						progress: progress.progress,
						status: progress.status,
						message: progress.message,
					})
				}
			})

			socket.on('cancel_sync', data => {
				const { userId, exchange } = data
				if (userId) {
					SyncWebSocketService.clearSyncProgress(userId)
					this.syncProgressCallbacks.delete(userId)

					if (exchange) {
						KeysService.updateSyncStatus(userId, exchange, false, 'en').catch(
							error => logError('Error updating sync status on cancel:', error)
						)
					}

					socket.emit('sync_cancelled', { message: 'Sync cancelled' })
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
					BybitWebSocketService.disconnectClient(userId)

					this.userSockets.delete(userId)
					this.clientConnections.delete(socket.id)
					this.syncProgressCallbacks.delete(userId)
				}
			})
		})
	}

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

			const progressCallback = (progress, status, message) => {
				const socket = this.userSockets.get(userId)
				if (socket) {
					socket.emit('sync_progress', { progress, status, message })
				}
			}

			const ordersResult = await SyncWebSocketService.syncOrdersWithCallback(
				userId,
				language,
				exchange,
				keys,
				startMs,
				endMs,
				progressCallback
			)

			if (SyncWebSocketService.isSyncCancelled(userId)) {
				return
			}

			const transactionsResult =
				await SyncWebSocketService.syncTransactionsWithCallback(
					userId,
					language,
					exchange,
					keys,
					startMs,
					endMs,
					progressCallback
				)

			if (SyncWebSocketService.isSyncCancelled(userId)) {
				return
			}

			const socket = this.userSockets.get(userId)
			if (socket) {
				const result = {
					success: true,
					orders: {
						success: ordersResult.success,
						dataCount: ordersResult.dataCount,
						totalDataFromApi: ordersResult.totalDataFromApi,
					},
					transactions: {
						success: transactionsResult.success,
						dataCount: transactionsResult.dataCount,
						totalDataFromApi: transactionsResult.totalDataFromApi,
					},
					summary: {
						totalOrders: ordersResult.dataCount || 0,
						totalTransactions: transactionsResult.dataCount || 0,
						totalSynced:
							(ordersResult.dataCount || 0) +
							(transactionsResult.dataCount || 0),
					},
				}

				socket.emit('sync_completed', result)

				try {
					await KeysService.updateSyncStatus(userId, exchange, true, language)
				} catch (error) {
					logError('Error updating sync status:', error)
				}
			}

			setTimeout(() => {
				SyncWebSocketService.clearSyncProgress(userId)
				this.syncProgressCallbacks.delete(userId)
			}, 5000)
		} catch (error) {
			logError(`Error in background sync for user ${userId}:`, error)

			const socket = this.userSockets.get(userId)
			if (socket) {
				socket.emit('sync_error', {
					message: 'Sync failed: ' + error.message,
				})
			}

			try {
				await KeysService.updateSyncStatus(userId, exchange, false, language)
			} catch (updateError) {
				logError('Error updating sync status on error:', updateError)
			}

			SyncWebSocketService.clearSyncProgress(userId)
			this.syncProgressCallbacks.delete(userId)
		}
	}

	sendPositionsUpdate(userId, positions) {
		const socket = this.userSockets.get(userId)
		if (socket) {
			socket.emit('positions_update', { positions })
		}
	}

	sendConnectionStatus(userId, status) {
		const socket = this.userSockets.get(userId)
		if (socket) {
			socket.emit('connection_status', status)
		}
	}

	getConnectedClientsCount() {
		return this.clientConnections.size
	}

	getStats() {
		return {
			clientConnections: this.clientConnections.size,
			bybitConnections: BybitWebSocketService.getActiveConnectionsCount(),
			connectedUsers: BybitWebSocketService.getConnectedUsers(),
		}
	}
}

module.exports = new WebSocketService()
