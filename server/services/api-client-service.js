const { RestClientV5 } = require('bybit-api')
const { ApiError } = require('../exceptions/api-error')
const moment = require('moment')
const i18next = require('i18next')
const { delayApi } = require('../helpers/utility-helpers')
const DataService = require('./data-service')

class ApiClientService {
	/**
	 * Создает клиент для работы с API биржи
	 * @param {string} exchange - Название биржи (bybit, binance, etc.)
	 * @param {Object} keys - Объект с API ключами {api, secret}
	 * @returns {Object} - Клиент для работы с API
	 * @throws {Error} - Если биржа не поддерживается
	 */
	createClient(exchange, keys) {
		switch (exchange.toLowerCase()) {
			case 'bybit':
				return new RestClientV5({
					testnet: false,
					key: keys.api,
					secret: keys.secret,
				})
			// case 'binance':
			//     return new BinanceClient({...})
			// case 'okx':
			//     return new OkxClient({...})
			default:
				throw new Error(`Unsupported exchange: ${exchange}`)
		}
	}

	/**
	 * Получает конфигурацию для конкретной биржи
	 * @param {string} exchange - Название биржи
	 * @returns {Object} - Конфигурация биржи с полями cursorField, listField, etc.
	 */
	getExchangeConfig(exchange) {
		const configs = {
			bybit: {
				cursorField: 'nextPageCursor',
				listField: 'list',
				errorCodeField: 'retCode',
				errorMessageField: 'retMsg',
				resultField: 'result',
				successCode: 0,
			},
			// binance: {
			//     cursorField: 'nextPageToken',
			//     listField: 'data',
			//     errorCodeField: 'code',
			//     errorMessageField: 'msg',
			//     resultField: 'data',
			//     successCode: 200
			// }
		}

		return configs[exchange.toLowerCase()] || configs.bybit
	}

	/**
	 * Валидирует ответ от API биржи
	 * @param {Object} response - Ответ от API
	 * @param {string} exchangeName - Название биржи
	 * @param {string} lng - Язык для локализации ошибок
	 * @returns {Object} - Валидный результат из ответа
	 * @throws {ApiError} - Если ответ содержит ошибку
	 */
	validateApiResponse(response, exchangeName, lng) {
		const config = this.getExchangeConfig(exchangeName)

		if (response[config.errorCodeField] !== config.successCode) {
			throw ApiError.BadRequest(
				i18next.t('errors.api_error', {
					lng,
					exchange: exchangeName,
					error: response[config.errorMessageField],
				})
			)
		}

		return response[config.resultField]
	}

	/**
	 * Получает пагинированные данные от API биржи
	 * @param {Object} client - API клиент
	 * @param {string} apiMethod - Название метода API
	 * @param {Object} apiParams - Параметры для API метода
	 * @param {string} lng - Язык для локализации
	 * @param {string} exchangeName - Название биржи
	 * @param {string} cursorField - Поле курсора для пагинации
	 * @param {string} listField - Поле со списком данных
	 * @returns {Promise<Array>} - Массив всех данных
	 */
	async fetchPaginatedData({
		client,
		apiMethod,
		apiParams = {},
		lng,
		exchangeName = 'Bybit',
		cursorField = 'nextPageCursor',
		listField = 'list',
	}) {
		let allData = []
		let nextCursor = ''

		do {
			const response = await client[apiMethod]({
				...apiParams,
				cursor: nextCursor || undefined,
				limit: 50,
			})

			if (response.retCode !== 0) {
				throw ApiError.BadRequest(
					i18next.t('errors.api_error', {
						lng,
						exchange: exchangeName,
						error: response.retMsg,
					})
				)
			}

			if (response.result[listField] && response.result[listField].length > 0) {
				allData = [...allData, ...response.result[listField]]
			}

			nextCursor = response.result[cursorField]

			await delayApi(100)
		} while (nextCursor)

		return allData
	}

	/**
	 * Получает данные от API биржи по временным чанкам
	 * @param {Object} client - API клиент
	 * @param {Date|string} startTime - Время начала
	 * @param {Date|string} endTime - Время окончания
	 * @param {string} apiMethod - Название метода API
	 * @param {Object} apiParams - Параметры для API метода
	 * @param {string} lng - Язык для локализации
	 * @param {string} exchangeName - Название биржи
	 * @param {number} maxDays - Максимальное количество дней в чанке
	 * @param {string} cursorField - Поле курсора для пагинации
	 * @param {string} listField - Поле со списком данных
	 * @returns {Promise<Array>} - Массив всех данных
	 */
	async fetchDataByTimeChunks({
		client,
		startTime,
		endTime,
		apiMethod,
		apiParams = {},
		lng,
		exchangeName = 'Bybit',
		maxDays = 7,
		cursorField = 'nextPageCursor',
		listField = 'list',
	}) {
		const diffDays = moment(endTime).diff(moment(startTime), 'days')

		if (diffDays <= maxDays) {
			return await this.fetchPaginatedData({
				client,
				apiMethod,
				apiParams: {
					...apiParams,
					startTime: new Date(startTime).getTime(),
					endTime: new Date(endTime).getTime(),
				},
				lng,
				exchangeName,
				cursorField,
				listField,
			})
		}

		const timeChunks = DataService.createTimeChunks(startTime, endTime, maxDays)

		const chunkResults = await Promise.all(
			timeChunks.map(async chunk => {
				return await this.fetchPaginatedData({
					client,
					apiMethod,
					apiParams: {
						...apiParams,
						startTime: chunk.start,
						endTime: chunk.end,
					},
					lng,
					exchangeName,
					cursorField,
					listField,
				})
			})
		)

		return chunkResults.flat()
	}

	/**
	 * Выполняет простой API запрос к бирже
	 * @param {Object} client - API клиент
	 * @param {string} apiMethod - Название метода API
	 * @param {Object} apiParams - Параметры для API метода
	 * @param {string} lng - Язык для локализации
	 * @param {string} exchangeName - Название биржи
	 * @returns {Promise<Object>} - Результат API запроса
	 * @throws {ApiError} - Если запрос завершился ошибкой
	 */
	async makeApiRequest({
		client,
		apiMethod,
		apiParams = {},
		lng,
		exchangeName = 'Bybit',
	}) {
		const response = await client[apiMethod](apiParams)

		if (response.retCode !== 0) {
			throw ApiError.BadRequest(
				i18next.t('errors.api_error', {
					lng,
					exchange: exchangeName,
					error: response.retMsg,
				})
			)
		}

		return response.result
	}
}

module.exports = new ApiClientService()
