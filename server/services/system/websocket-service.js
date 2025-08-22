const { Server } = require('socket.io')
const BybitWebSocketService = require('@services/exchange/bybit/bybit-websocket')
const KeysService = require('@services/auth/keys-service')
const { logError } = require('@configs/logger-config')

class WebSocketService {
	constructor() {
		this.io = null
		this.clientConnections = new Map()
		this.userSockets = new Map()
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
						socket.emit('error', { message: 'Keys not found' })
						return
					}

					const current_keys = keys.keys.find(item => item.name === exchange)

					if (!current_keys || !current_keys.api || !current_keys.secret) {
						socket.emit('error', { message: 'Keys not configured' })
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
				}
			})
		})
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
