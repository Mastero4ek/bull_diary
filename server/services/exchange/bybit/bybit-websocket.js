const { WebsocketClient } = require('bybit-api')

const { logError } = require('@configs/logger-config')
const DataService = require('@services/exchange/data-service')

class BybitWebSocketService {
	constructor() {
		this.clients = new Map()
		this.connections = new Map()
		this.positionCallbacks = new Map()
	}

	/**
	 * Создает WebSocket клиент для пользователя
	 * @param {string} userId - ID пользователя
	 * @param {Object} keys - API ключи {api, secret}
	 * @param {Function} onPositionsUpdate - Callback для обновления позиций
	 */
	createClient(userId, keys, onPositionsUpdate) {
		try {
			const wsClient = new WebsocketClient({
				key: keys.api,
				secret: keys.secret,
				testnet: false,
			})

			this.positionCallbacks.set(userId, onPositionsUpdate)

			wsClient.on('open', () => {
				this.connections.set(userId, true)
			})

			wsClient.on('close', () => {
				this.connections.set(userId, false)
			})

			wsClient.on('error', error => {
				logError(`WebSocket error for user ${userId}:`, error)
				this.connections.set(userId, false)
			})

			wsClient.on('update', data => {
				if (data.topic === 'position') {
					this.handlePositionUpdate(userId, data)
				}
			})

			try {
				wsClient.subscribeV5(['position'], 'linear', true)
			} catch (error) {
				logError(
					`Failed to subscribe to position updates for user ${userId}:`,
					error
				)
			}

			this.clients.set(userId, wsClient)

			return wsClient
		} catch (error) {
			logError(`Failed to create WebSocket client for user ${userId}:`, error)
			throw error
		}
	}

	/**
	 * Обрабатывает обновления позиций
	 * @param {string} userId - ID пользователя
	 * @param {Object} data - Данные позиций
	 */
	handlePositionUpdate(userId, data) {
		try {
			const callback = this.positionCallbacks.get(userId)
			if (callback && data.data) {
				const positions = data.data.map(position => ({
					id: `${position.symbol}_${position.side}`,
					symbol: position.symbol,
					direction: position.side === 'Buy' ? 'long' : 'short',
					leverage: Number(position.leverage),
					quality: Number(position.size),
					margin: Number(position.positionValue),
					unrealisedPnl: Number(position.unrealisedPnl),
					roi: DataService.calculateUnrealisedRoi(position),
					markPrice: Number(position.markPrice),
					entryPrice: Number(position.entryPrice),
					updatedTime: Number(position.updatedTime),
					positionStatus: position.positionStatus,
					liqPrice: Number(position.liqPrice),
					takeProfit: Number(position.takeProfit),
					stopLoss: Number(position.stopLoss),
				}))

				callback(positions)
			}
		} catch (error) {
			logError(`Error handling position update for user ${userId}:`, error)
		}
	}

	/**
	 * Отключает клиента для пользователя
	 * @param {string} userId - ID пользователя
	 */
	disconnectClient(userId) {
		try {
			const client = this.clients.get(userId)
			if (client) {
				client.close()
				this.clients.delete(userId)
				this.connections.delete(userId)
				this.positionCallbacks.delete(userId)
			}
		} catch (error) {
			logError(
				`Error disconnecting WebSocket client for user ${userId}:`,
				error
			)
		}
	}

	/**
	 * Получает статус соединения для пользователя
	 * @param {string} userId - ID пользователя
	 * @returns {boolean} Статус соединения
	 */
	getConnectionStatus(userId) {
		return this.connections.get(userId) || false
	}

	/**
	 * Получает количество активных соединений
	 * @returns {number} Количество соединений
	 */
	getActiveConnectionsCount() {
		return this.clients.size
	}

	/**
	 * Получает список всех пользователей с активными соединениями
	 * @returns {Array} Массив ID пользователей
	 */
	getConnectedUsers() {
		return Array.from(this.clients.keys())
	}
}

module.exports = new BybitWebSocketService()
