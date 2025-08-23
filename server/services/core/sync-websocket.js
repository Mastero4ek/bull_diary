const moment = require('moment')
const i18next = require('i18next')
const { logError } = require('@configs/logger-config')
const { delayApi } = require('@helpers/utility-helpers')
const ClientService = require('@services/integration/client-service')
const DataService = require('@services/exchange/data-service')

const syncProgressMap = new Map()
const cancelledSyncs = new Set()

class SyncWebSocketService {
	/**
	 * Получает данные от API с отображением прогресса синхронизации
	 * @param {Object} client - API клиент
	 * @param {Date|string} startTime - Время начала периода
	 * @param {Date|string} endTime - Время окончания периода
	 * @param {string} lng - Язык для локализации
	 * @param {string} userId - ID пользователя
	 * @param {string} apiMethod - Название метода API
	 * @param {Object} apiParams - Параметры для API метода
	 * @param {Function} transformData - Функция трансформации данных
	 * @param {Object} progressConfig - Конфигурация прогресса
	 * @param {string} exchangeName - Название биржи
	 * @param {string} dataType - Тип данных ('orders' или 'transactions')
	 * @returns {Promise<Array>} - Массив полученных данных
	 */
	async fetchDataWithProgress({
		client,
		startTime,
		endTime,
		lng,
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

			const localizedDataType = i18next.t(`sync.${dataType}`, { lng })

			this.setSyncProgress(
				userId,
				initialProgress,
				'loading',
				i18next.t('sync.starting_sync', {
					lng,
					days: diffDays,
					dataType: localizedDataType,
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
					lng,
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
						lng,
						current: i + 1,
						total: totalChunks,
						dataType: localizedDataType,
					}),
					progressCallback
				)
			}

			allData = chunkResults.flat()
		} else {
			const localizedDataType = i18next.t(`sync.${dataType}`, { lng })

			this.setSyncProgress(
				userId,
				initialProgress,
				'loading',
				i18next.t('sync.fetching_data', { lng, dataType: localizedDataType }),
				progressCallback
			)

			allData = await this.fetchDataForChunk({
				client,
				chunk: {
					start: new Date(startTime).getTime(),
					end: new Date(endTime).getTime(),
				},
				lng,
				apiMethod,
				apiParams,
				exchangeName,
			})

			this.setSyncProgress(
				userId,
				finalProgress,
				'loading',
				i18next.t('sync.data_fetched', { lng, dataType: localizedDataType }),
				progressCallback
			)
		}

		return transformData ? transformData(allData) : allData
	}

	/**
	 * Получает данные для одного временного чанка
	 * @param {Object} client - API клиент
	 * @param {Object} chunk - Временной чанк {start, end}
	 * @param {string} lng - Язык для локализации
	 * @param {string} apiMethod - Название метода API
	 * @param {Object} apiParams - Параметры для API метода
	 * @param {string} exchangeName - Название биржи
	 * @returns {Promise<Array>} - Массив данных для чанка
	 */
	async fetchDataForChunk({
		client,
		chunk,
		lng,
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
				lng
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
	 * Синхронизирует данные с отображением прогресса
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {string} exchange - Название биржи
	 * @param {Object} keys - API ключи
	 * @param {Date|string} start_time - Время начала периода
	 * @param {Date|string} end_time - Время окончания периода
	 * @param {Object} config - Конфигурация синхронизации
	 * @param {Function} progressCallback - Callback для отправки прогресса
	 * @returns {Promise<Object>} - Результат синхронизации
	 */
	async syncDataWithProgress(
		userId,
		lng = 'en',
		exchange,
		keys,
		start_time,
		end_time,
		config = {},
		progressCallback = null
	) {
		this.resetCancellation(userId)

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
			const startTime = moment(start_time)
			const endTime = moment(end_time)

			const allData = await this.fetchDataWithProgress({
				client,
				startTime,
				endTime,
				lng,
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
				: DataService.transformTransactionsToDbFormat(allData, userId, exchange)

			let savedData = []
			if (transformedData.length > 0) {
				try {
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
				} catch (error) {
					throw error
				}
			}

			const localizedDataType = i18next.t(`sync.${dataType}`, { lng })

			this.setSyncProgress(
				userId,
				finalProgress,
				'success',
				i18next.t('sync.completed', { lng, dataType: localizedDataType }),
				progressCallback
			)

			return {
				success: true,
				dataCount: savedData.length,
				totalDataFromApi: allData.length,
				dataType: dataType,
			}
		} catch (error) {
			const localizedDataType = i18next.t(`sync.${dataType}`, { lng })

			this.setSyncProgress(
				userId,
				0,
				'error',
				i18next.t('sync.failed', { lng, dataType: localizedDataType }),
				progressCallback
			)
			throw error
		}
	}

	/**
	 * Устанавливает прогресс синхронизации для пользователя
	 * @param {string} userId - ID пользователя
	 * @param {number} progress - Процент выполнения (0-100)
	 * @param {string} status - Статус синхронизации ('loading', 'success', 'error')
	 * @param {string} message - Сообщение о прогрессе
	 * @param {Function} progressCallback - Callback для отправки прогресса через WebSocket
	 */
	setSyncProgress(userId, progress, status, message, progressCallback = null) {
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
	 * Синхронизирует ордера с WebSocket callback
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации
	 * @param {string} exchange - Название биржи
	 * @param {Object} keys - API ключи
	 * @param {Date|string} start_time - Время начала периода
	 * @param {Date|string} end_time - Время окончания периода
	 * @param {Function} progressCallback - Callback для отправки прогресса
	 * @returns {Promise<Object>} - Результат синхронизации
	 */
	async syncOrdersWithCallback(
		userId,
		lng,
		exchange,
		keys,
		start_time,
		end_time,
		progressCallback
	) {
		return await this.syncDataWithProgress(
			userId,
			lng,
			exchange,
			keys,
			start_time,
			end_time,
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
	 * Синхронизирует транзакции с WebSocket callback
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации
	 * @param {string} exchange - Название биржи
	 * @param {Object} keys - API ключи
	 * @param {Date|string} start_time - Время начала периода
	 * @param {Date|string} end_time - Время окончания периода
	 * @param {Function} progressCallback - Callback для отправки прогресса
	 * @returns {Promise<Object>} - Результат синхронизации
	 */
	async syncTransactionsWithCallback(
		userId,
		lng,
		exchange,
		keys,
		start_time,
		end_time,
		progressCallback
	) {
		return await this.syncDataWithProgress(
			userId,
			lng,
			exchange,
			keys,
			start_time,
			end_time,
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
}

module.exports = new SyncWebSocketService()
