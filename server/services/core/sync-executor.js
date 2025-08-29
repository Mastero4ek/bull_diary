const i18next = require('i18next')
const moment = require('moment')
const cron = require('node-cron')

const { logError } = require('@configs/logger-config')
const { delayApi } = require('@helpers/utility-helpers')
const DataService = require('@services/exchange/data-service')
const ClientService = require('@services/integration/client-service')

const syncProgressMap = new Map()
const cancelledSyncs = new Set()
const pendingSyncs = new Map()

class SyncExecutor {
	constructor() {
		this.webSocketService = null
		this.keysService = null
		this.initCronJob()
	}

	/**
	 * Устанавливает зависимости для работы с WebSocket и ключами
	 * @param {Object} webSocketService - Сервис WebSocket
	 * @param {Object} keysService - Сервис для работы с ключами
	 */
	setDependencies(webSocketService, keysService) {
		this.webSocketService = webSocketService
		this.keysService = keysService
	}

	initCronJob() {
		cron.schedule('* * * * * *', async () => {
			await this.processPendingSyncs()
		})
	}

	/**
	 * Выполняет полный процесс синхронизации (ордера + транзакции)
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи
	 * @param {Object} keys - API ключи
	 * @param {Date|string} startTime - Время начала периода
	 * @param {Date|string} endTime - Время окончания периода
	 * @param {string} language - Язык для локализации
	 * @param {Object} options - Дополнительные опции
	 * @param {boolean} options.isAutoSync - Флаг автоматической синхронизации
	 * @param {Function} options.socketEmitter - Функция для отправки WebSocket событий
	 * @param {Function} options.keysService - Сервис для работы с ключами
	 * @returns {Promise<Object>} - Результат синхронизации
	 */
	async executeSyncProcess(
		userId,
		exchange,
		keys,
		startTime,
		endTime,
		language = 'en',
		options = {}
	) {
		const {
			isAutoSync = false,
			socketEmitter = null,
			keysService = null,
		} = options

		this.resetCancellation(userId)

		try {
			const progressCallback = (progress, status, message) => {
				if (this.isSyncCancelled(userId)) {
					return
				}

				if (socketEmitter) {
					const eventName = isAutoSync ? 'auto_sync_progress' : 'sync_progress'
					socketEmitter(eventName, { progress, status, message })
				}
			}

			const startingMessage = i18next.t('sync.starting_sync', {
				lng: language,
				exchange,
			})

			this.setSyncProgress(
				userId,
				0,
				'loading',
				startingMessage,
				progressCallback
			)

			if (socketEmitter) {
				const eventName = isAutoSync ? 'auto_sync_started' : 'sync_started'

				socketEmitter(eventName, {
					message: isAutoSync
						? 'Auto sync started (current year)'
						: 'Sync started',
					exchange,
					startTime: moment(startTime).toISOString(),
					endTime: moment(endTime).toISOString(),
					period: isAutoSync ? 'current_year' : 'custom',
				})
			}

			const ordersResult = await this.syncOrders(
				userId,
				language,
				exchange,
				keys,
				startTime,
				endTime,
				progressCallback
			)

			if (this.isSyncCancelled(userId)) {
				return { cancelled: true }
			}

			const transactionsResult = await this.syncTransactions(
				userId,
				language,
				exchange,
				keys,
				startTime,
				endTime,
				progressCallback
			)

			if (this.isSyncCancelled(userId)) {
				return { cancelled: true }
			}

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
						(ordersResult.dataCount || 0) + (transactionsResult.dataCount || 0),
				},
			}

			if (socketEmitter) {
				const eventName = isAutoSync ? 'auto_sync_completed' : 'sync_completed'

				socketEmitter(eventName, result)

				if (isAutoSync && keysService) {
					socketEmitter('auto_sync_completed', {
						userId,
						exchange,
						language,
						...result,
					})
				}
			}

			if (keysService) {
				try {
					await keysService.updateSyncStatus(userId, exchange, true, language)
				} catch (error) {
					logError('Error updating sync status:', error)
				}
			}

			setTimeout(() => {
				this.clearSyncProgress(userId)
			}, 5000)

			return result
		} catch (error) {
			logError(
				`Sync process failed for user ${userId}, exchange ${exchange}:`,
				error
			)

			if (socketEmitter) {
				const eventName = isAutoSync ? 'auto_sync_error' : 'sync_error'
				const errorMessage = `Sync failed: ${error.message}`

				socketEmitter(eventName, {
					message: errorMessage,
					exchange,
				})

				if (isAutoSync && keysService) {
					socketEmitter('auto_sync_error', {
						userId,
						exchange,
						language,
						message: errorMessage,
					})
				}
			}

			if (keysService) {
				try {
					await keysService.updateSyncStatus(userId, exchange, false, language)
				} catch (updateError) {
					logError('Error updating sync status on error:', updateError)
				}
			}

			this.clearSyncProgress(userId)

			throw error
		}
	}

	/**
	 * Синхронизирует ордера
	 * @param {string} userId - ID пользователя
	 * @param {string} language - Язык для локализации
	 * @param {string} exchange - Название биржи
	 * @param {Object} keys - API ключи
	 * @param {Date|string} startTime - Время начала периода
	 * @param {Date|string} endTime - Время окончания периода
	 * @param {Function} progressCallback - Callback для прогресса
	 * @returns {Promise<Object>} - Результат синхронизации ордеров
	 */
	async syncOrders(
		userId,
		language,
		exchange,
		keys,
		startTime,
		endTime,
		progressCallback
	) {
		return await this.syncDataWithProgress(
			userId,
			language,
			exchange,
			keys,
			startTime,
			endTime,
			{
				apiMethod: 'getClosedPnL',
				apiParams: { category: 'linear' },
				dataType: 'orders',
				progressConfig: {
					initialProgress: 0,
					finalProgress: 49,
					chunkSize: 7,
				},
			},
			progressCallback
		)
	}

	/**
	 * Синхронизирует транзакции
	 * @param {string} userId - ID пользователя
	 * @param {string} language - Язык для локализации
	 * @param {string} exchange - Название биржи
	 * @param {Object} keys - API ключи
	 * @param {Date|string} startTime - Время начала периода
	 * @param {Date|string} endTime - Время окончания периода
	 * @param {Function} progressCallback - Callback для прогресса
	 * @returns {Promise<Object>} - Результат синхронизации транзакций
	 */
	async syncTransactions(
		userId,
		language,
		exchange,
		keys,
		startTime,
		endTime,
		progressCallback
	) {
		return await this.syncDataWithProgress(
			userId,
			language,
			exchange,
			keys,
			startTime,
			endTime,
			{
				apiMethod: 'getTransactionLog',
				apiParams: { accountType: 'UNIFIED' },
				dataType: 'transactions',
				progressConfig: {
					initialProgress: 50,
					finalProgress: 100,
					chunkSize: 7,
				},
			},
			progressCallback
		)
	}

	/**
	 * Синхронизирует данные с отображением прогресса
	 * @param {string} userId - ID пользователя
	 * @param {string} language - Язык для локализации
	 * @param {string} exchange - Название биржи
	 * @param {Object} keys - API ключи
	 * @param {Date|string} startTime - Время начала периода
	 * @param {Date|string} endTime - Время окончания периода
	 * @param {Object} config - Конфигурация синхронизации
	 * @param {Function} progressCallback - Callback для прогресса
	 * @returns {Promise<Object>} - Результат синхронизации
	 */
	async syncDataWithProgress(
		userId,
		language,
		exchange,
		keys,
		startTime,
		endTime,
		config = {},
		progressCallback = null
	) {
		const {
			apiMethod = 'getClosedPnL',
			apiParams = { category: 'linear' },
			transformData,
			dataType = 'orders',
			progressConfig = {
				initialProgress: 10,
				finalProgress: 75,
				chunkSize: 7,
			},
		} = config

		const { finalProgress } = progressConfig
		const client = ClientService.createClient(exchange, keys)

		try {
			const startTimeMoment = moment(startTime)
			const endTimeMoment = moment(endTime)

			const allData = await this.fetchDataWithProgress({
				client,
				startTime: startTimeMoment,
				endTime: endTimeMoment,
				language,
				userId,
				apiMethod,
				apiParams,
				transformData,
				progressConfig,
				exchangeName: exchange,
				dataType,
				progressCallback,
			})

			const transformedData = transformData
				? transformData(allData, userId)
				: dataType === 'orders'
					? DataService.transformOrdersToDbFormat(allData, userId, exchange)
					: DataService.transformTransactionsToDbFormat(
							allData,
							userId,
							exchange
						)

			let savedData = []
			if (transformedData.length > 0) {
				if (dataType === 'orders') {
					savedData = await DataService.saveOrdersToDatabase(
						transformedData,
						userId,
						exchange
					)
				} else if (dataType === 'transactions') {
					savedData = await DataService.saveTransactionsToDatabase(
						transformedData,
						userId,
						exchange
					)
				}
			}

			const localizedDataType = i18next.t(`sync.${dataType}`, { lng: language })

			this.setSyncProgress(
				userId,
				finalProgress,
				'success',
				i18next.t('sync.completed', {
					lng: language,
					dataType: localizedDataType,
					exchange,
				}),
				progressCallback
			)

			return {
				success: true,
				dataCount: savedData.length,
				totalDataFromApi: allData.length,
				dataType,
			}
		} catch (error) {
			const localizedDataType = i18next.t(`sync.${dataType}`, { lng: language })

			this.setSyncProgress(
				userId,
				0,
				'error',
				i18next.t('sync.failed', {
					lng: language,
					dataType: localizedDataType,
					exchange,
				}),
				progressCallback
			)
			throw error
		}
	}

	/**
	 * Получает данные от API с отображением прогресса синхронизации
	 * @param {Object} client - API клиент
	 * @param {Date|string} startTime - Время начала периода
	 * @param {Date|string} endTime - Время окончания периода
	 * @param {string} language - Язык для локализации
	 * @param {string} userId - ID пользователя
	 * @param {string} apiMethod - Название метода API
	 * @param {Object} apiParams - Параметры для API метода
	 * @param {Function} transformData - Функция трансформации данных
	 * @param {Object} progressConfig - Конфигурация прогресса
	 * @param {string} exchangeName - Название биржи
	 * @param {string} dataType - Тип данных ('orders' или 'transactions')
	 * @param {Function} progressCallback - Callback для прогресса
	 * @returns {Promise<Array>} - Массив полученных данных
	 */
	async fetchDataWithProgress({
		client,
		startTime,
		endTime,
		language,
		userId,
		apiMethod,
		apiParams = {},
		transformData,
		progressConfig = {},
		exchangeName = 'Bybit',
		dataType = 'data',
		progressCallback = null,
	}) {
		const {
			initialProgress = 0,
			finalProgress = 75,
			progressStep = 10,
			chunkSize = 7,
		} = progressConfig

		let allData = []
		const diffDays = moment(endTime).diff(moment(startTime), 'days')

		if (diffDays > chunkSize) {
			const timeChunks = DataService.createTimeChunks(
				startTime,
				endTime,
				chunkSize
			)
			const totalChunks = timeChunks.length

			const localizedDataType = i18next.t(`sync.${dataType}`, { lng: language })

			this.setSyncProgress(
				userId,
				initialProgress,
				'loading',
				i18next.t('sync.processing', {
					lng: language,
					dataType: localizedDataType,
					exchange: exchangeName,
				}),
				progressCallback
			)

			const chunkResults = []

			for (let i = 0; i < timeChunks.length; i++) {
				if (this.isSyncCancelled(userId)) {
					return []
				}

				const chunk = timeChunks[i]
				const chunkData = await this.fetchDataForChunk({
					client,
					chunk,
					language,
					apiMethod,
					apiParams,
					exchangeName,
				})

				chunkResults.push(chunkData)
				const progress = Math.round(
					((i + 1) / totalChunks) * (finalProgress - initialProgress) +
						initialProgress
				)

				this.setSyncProgress(
					userId,
					progress,
					'loading',
					i18next.t('sync.processing_chunk', {
						lng: language,
						current: i + 1,
						total: totalChunks,
						dataType: localizedDataType,
						exchange: exchangeName,
					}),
					progressCallback
				)
			}

			allData = chunkResults.flat()
		} else {
			const localizedDataType = i18next.t(`sync.${dataType}`, { lng: language })

			this.setSyncProgress(
				userId,
				initialProgress,
				'loading',
				i18next.t('sync.processing_data', {
					lng: language,
					dataType: localizedDataType,
					exchange: exchangeName,
				}),
				progressCallback
			)

			allData = await this.fetchDataForChunk({
				client,
				chunk: {
					start: new Date(startTime).getTime(),
					end: new Date(endTime).getTime(),
				},
				language,
				apiMethod,
				apiParams,
				exchangeName,
			})

			this.setSyncProgress(
				userId,
				finalProgress,
				'loading',
				i18next.t('sync.data_processed', {
					lng: language,
					dataType: localizedDataType,
					exchange: exchangeName,
				}),
				progressCallback
			)
		}

		return transformData ? transformData(allData) : allData
	}

	/**
	 * Получает данные для одного временного чанка
	 * @param {Object} client - API клиент
	 * @param {Object} chunk - Временной чанк {start, end}
	 * @param {string} language - Язык для локализации
	 * @param {string} apiMethod - Название метода API
	 * @param {Object} apiParams - Параметры для API метода
	 * @param {string} exchangeName - Название биржи
	 * @returns {Promise<Array>} - Массив данных для чанка
	 */
	async fetchDataForChunk({
		client,
		chunk,
		language,
		apiMethod,
		apiParams = {},
		exchangeName = 'Bybit',
	}) {
		const config = ClientService.getExchangeConfig(exchangeName)

		let chunkData = []
		let nextCursor = ''
		let requestCount = 0

		do {
			requestCount++

			const response = await client[apiMethod]({
				...apiParams,
				startTime: chunk.start,
				endTime: chunk.end,
				cursor: nextCursor || undefined,
				limit: 50,
			})

			const result = ClientService.validateApiResponse(
				response,
				exchangeName,
				language
			)

			if (result[config.listField] && result[config.listField].length > 0) {
				chunkData = [...chunkData, ...result[config.listField]]
			}

			nextCursor = result[config.cursorField]

			await delayApi(100)
		} while (nextCursor)

		return chunkData
	}

	/**
	 * Устанавливает прогресс синхронизации для пользователя
	 * @param {string} userId - ID пользователя
	 * @param {number} progress - Процент выполнения (0-100)
	 * @param {string} status - Статус синхронизации ('loading', 'success', 'error')
	 * @param {string} message - Сообщение о прогрессе
	 * @param {Function} progressCallback - Callback для отправки прогресса
	 */
	setSyncProgress(userId, progress, status, message, progressCallback = null) {
		if (this.isSyncCancelled(userId)) {
			return
		}

		const progressData = {
			progress,
			status,
			message,
			timestamp: Date.now(),
		}

		syncProgressMap.set(userId, progressData)

		if (progressCallback && typeof progressCallback === 'function') {
			try {
				progressCallback(progress, status, message)
			} catch (error) {
				logError(
					`Error sending sync progress via callback for user ${userId}:`,
					error
				)
			}
		}
	}

	/**
	 * Получает прогресс синхронизации для пользователя
	 * @param {string} userId - ID пользователя
	 * @returns {Object} - Объект с прогрессом, статусом и сообщением
	 */
	getSyncProgress(userId) {
		const progress = syncProgressMap.get(userId)

		if (!progress) {
			return {
				progress: 0,
				status: '',
				message: 'No sync in progress',
			}
		}

		if (Date.now() - progress.timestamp > 5 * 60 * 1000) {
			syncProgressMap.delete(userId)

			return {
				progress: 0,
				status: '',
				message: 'No sync in progress',
			}
		}

		return progress
	}

	/**
	 * Очищает прогресс синхронизации для пользователя
	 * @param {string} userId - ID пользователя
	 */
	clearSyncProgress(userId) {
		syncProgressMap.delete(userId)
		cancelledSyncs.add(userId)
	}

	/**
	 * Проверяет, была ли отменена синхронизация для пользователя
	 * @param {string} userId - ID пользователя
	 * @returns {boolean} - true если синхронизация отменена
	 */
	isSyncCancelled(userId) {
		return cancelledSyncs.has(userId)
	}

	/**
	 * Снимает флаг отмены синхронизации для пользователя
	 * @param {string} userId - ID пользователя
	 */
	resetCancellation(userId) {
		cancelledSyncs.delete(userId)
	}

	/**
	 * Добавляет синхронизацию в очередь для выполнения
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи
	 * @param {Object} keys - API ключи
	 * @param {string} language - Язык для локализации
	 * @param {Function} socketEmitter - Функция для отправки WebSocket событий
	 */
	async scheduleSync(
		userId,
		exchange,
		keys,
		language = 'en',
		socketEmitter = null
	) {
		try {
			const endTime = moment()
			const startTime = moment().startOf('year')

			const syncData = {
				userId,
				exchange,
				keys,
				startTime: startTime.toDate(),
				endTime: endTime.toDate(),
				language,
				timestamp: Date.now(),
			}

			pendingSyncs.set(userId, syncData)

			if (socketEmitter) {
				socketEmitter('sync_scheduled', {
					message: 'Sync scheduled for execution (current year)',
					exchange,
					startTime: startTime.toISOString(),
					endTime: endTime.toISOString(),
					period: 'current_year',
				})
			}
		} catch (error) {
			logError(`Error scheduling sync for user ${userId}:`, error)
		}
	}

	/**
	 * Обрабатывает отложенные синхронизации
	 */
	async processPendingSyncs() {
		const now = Date.now()
		const syncsToProcess = []

		for (const [userId, syncData] of pendingSyncs.entries()) {
			if (now - syncData.timestamp >= 1000) {
				syncsToProcess.push({ userId, syncData })
			}
		}

		for (const { userId, syncData } of syncsToProcess) {
			try {
				await this.executeAutoSync(syncData)
				pendingSyncs.delete(userId)
			} catch (error) {
				logError(`Error executing sync for user ${userId}:`, error)
				pendingSyncs.delete(userId)
			}
		}
	}

	/**
	 * Выполняет автоматическую синхронизацию
	 * @param {Object} syncData - Данные для синхронизации
	 */
	async executeAutoSync(syncData) {
		const { userId, exchange, keys, startTime, endTime, language } = syncData

		try {
			const socketEmitter = (eventName, data) => {
				if (this.webSocketService) {
					const socket = this.webSocketService.userSockets.get(userId)
					if (socket) {
						socket.emit(eventName, data)
					}
				}
			}

			await this.executeSyncProcess(
				userId,
				exchange,
				keys,
				startTime,
				endTime,
				language,
				{
					isAutoSync: true,
					socketEmitter,
					keysService: this.keysService,
				}
			)
		} catch (error) {
			logError(
				`Auto sync failed for user ${userId}, exchange ${exchange}:`,
				error
			)
			throw error
		}
	}

	/**
	 * Отменяет отложенную синхронизацию для пользователя
	 * @param {string} userId - ID пользователя
	 */
	cancelPendingSync(userId) {
		if (pendingSyncs.has(userId)) {
			pendingSyncs.delete(userId)
		}
	}

	/**
	 * Получает статус отложенных синхронизаций
	 * @returns {Object} - Статистика отложенных синхронизаций
	 */
	getPendingSyncsStats() {
		return {
			pendingCount: pendingSyncs.size,
			pendingSyncs: Array.from(pendingSyncs.entries()).map(
				([userId, data]) => ({
					userId,
					exchange: data.exchange,
					timestamp: data.timestamp,
					delay: Date.now() - data.timestamp,
				})
			),
		}
	}
}

module.exports = new SyncExecutor()
