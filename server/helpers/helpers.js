const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')
const redis = require('../config/redis')
const { logError, logWarn } = require('../config/logger')
const { validationResult } = require('express-validator')

class Helpers {
	/**
	 * Получает данные из Redis кеша
	 * @param {string} cacheKey - Ключ кеша
	 * @param {string} methodName - Название метода для логирования ошибок
	 * @returns {Promise<Object|null>} - Данные из кеша или null
	 */
	async getFromCache(cacheKey, methodName = 'unknown') {
		if (!redis) return null

		try {
			const cachedData = await redis.get(cacheKey)

			return cachedData ? JSON.parse(cachedData) : null
		} catch (error) {
			logError(error, { methodName, cacheKey, operation: 'cache_read' })

			return null
		}
	}

	/**
	 * Сохраняет данные в Redis кеш
	 * @param {string} cacheKey - Ключ кеша
	 * @param {any} data - Данные для сохранения
	 * @param {number} ttl - Время жизни кеша в секундах
	 * @param {string} methodName - Название метода для логирования ошибок
	 * @returns {Promise<void>}
	 */
	async setToCache(cacheKey, data, ttl = 300, methodName = 'unknown') {
		if (!redis) return

		try {
			await redis.setex(cacheKey, ttl, JSON.stringify(data))
		} catch (error) {
			logError(error, { methodName, cacheKey, operation: 'cache_write', ttl })
		}
	}

	/**
	 * Генерирует ключ кеша для API запросов
	 * @param {string} exchange - Название биржи
	 * @param {string} method - Название метода
	 * @param {...any} params - Параметры для ключа
	 * @returns {string} - Сгенерированный ключ кеша
	 */
	generateCacheKey(exchange, method, ...params) {
		const paramString = params
			.map(param =>
				typeof param === 'object' ? JSON.stringify(param) : String(param)
			)
			.join(':')

		return `${exchange}_${method}:${paramString}`
	}

	/**
	 * Создает задержку для API запросов
	 * @param {number} ms - Время задержки в миллисекундах
	 * @returns {Promise<void>}
	 */
	async delayApi(ms = 100) {
		return new Promise(resolve => setTimeout(resolve, ms))
	}

	/**
	 * Обрабатывает ошибки API бирж и возвращает соответствующие ApiError
	 * @param {Error} error - Ошибка для обработки
	 * @param {string} language - Язык для сообщений об ошибках
	 * @param {string} methodName - Название метода для логирования
	 * @param {string} errorType - Тип ошибки для перевода
	 * @param {string} exchange - Название биржи (Bybit, OKX, MEXC, etc.)
	 */
	handleApiError(error, language, methodName, errorType, exchange) {
		logError(error, { methodName, exchange, errorType, language })

		if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
			throw ApiError.BadRequest(
				i18next.t('errors.connection_error', {
					lng: language,
					exchange: exchange,
				})
			)
		}

		if (error.message && error.message.includes('timeout')) {
			throw ApiError.BadRequest(
				i18next.t('errors.timeout_error', {
					lng: language,
					exchange: exchange,
				})
			)
		}

		if (error instanceof ApiError) {
			throw error
		}

		throw ApiError.BadRequest(
			i18next.t(errorType, {
				lng: language,
				exchange: exchange,
			})
		)
	}

	/**
	 * Обрабатывает ошибки файловых операций и возвращает соответствующие ApiError
	 * @param {Error} error - Ошибка для обработки
	 * @param {string} language - Язык для сообщений об ошибках
	 * @param {string} methodName - Название метода для логирования
	 * @param {string} defaultErrorType - Тип ошибки по умолчанию для перевода
	 */
	handleFileError(error, language, methodName, defaultErrorType) {
		logError(error, { methodName, errorType: defaultErrorType, language })

		if (error instanceof ApiError) {
			throw error
		}

		if (error.code === 'ENOSPC') {
			throw ApiError.BadRequest(
				i18next.t('errors.disk_space_full', { lng: language })
			)
		}

		if (error.code === 'EACCES') {
			throw ApiError.BadRequest(
				i18next.t('errors.file_permission_denied', { lng: language })
			)
		}

		if (error.code === 'ENOENT') {
			throw ApiError.BadRequest(
				i18next.t('errors.file_path_not_found', { lng: language })
			)
		}

		if (error.code === 'EBUSY') {
			throw ApiError.BadRequest(
				i18next.t('errors.file_busy', { lng: language })
			)
		}

		throw ApiError.InternalError(i18next.t(defaultErrorType, { lng: language }))
	}

	/**
	 * Обрабатывает ошибки операций с базой данных и возвращает соответствующие ApiError
	 * @param {Error} error - Ошибка для обработки
	 * @param {string} language - Язык для сообщений об ошибках
	 * @param {string} methodName - Название метода для логирования
	 * @param {string} defaultErrorType - Тип ошибки по умолчанию для перевода
	 */
	handleDatabaseError(error, language, methodName, defaultErrorType) {
		logError(error, { methodName, errorType: defaultErrorType, language })

		if (error instanceof ApiError) {
			throw error
		}

		if (error.name === 'ValidationError') {
			throw ApiError.BadRequest(
				i18next.t('errors.validation_error', { lng: language })
			)
		}

		if (error.name === 'CastError') {
			throw ApiError.BadRequest(
				i18next.t('errors.invalid_id_format', { lng: language })
			)
		}

		if (error.code === 11000) {
			throw ApiError.BadRequest(
				i18next.t('errors.duplicate_key_error', { lng: language })
			)
		}

		if (
			error.name === 'MongoNetworkError' ||
			error.name === 'MongoTimeoutError'
		) {
			throw ApiError.InternalError(
				i18next.t('errors.database_connection_error', { lng: language })
			)
		}

		throw ApiError.InternalError(i18next.t(defaultErrorType, { lng: language }))
	}

	/**
	 * Обрабатывает ошибки почтовых операций и возвращает соответствующие ApiError
	 * @param {Error} error - Ошибка для обработки
	 * @param {string} language - Язык для сообщений об ошибках
	 * @param {string} methodName - Название метода для логирования
	 * @param {string} defaultErrorType - Тип ошибки по умолчанию для перевода
	 */
	handleMailError(error, language, methodName, defaultErrorType) {
		logError(error, { methodName, errorType: defaultErrorType, language })

		if (error instanceof ApiError) {
			throw error
		}

		if (error.code === 'EAUTH') {
			throw ApiError.InternalError(
				i18next.t('errors.smtp_auth_error', { lng: language })
			)
		}

		if (error.code === 'ECONNECTION') {
			throw ApiError.InternalError(
				i18next.t('errors.smtp_connection_error', { lng: language })
			)
		}

		if (error.code === 'ETIMEDOUT') {
			throw ApiError.InternalError(
				i18next.t('errors.smtp_timeout_error', { lng: language })
			)
		}

		if (error.code === 'ENOTFOUND') {
			throw ApiError.InternalError(
				i18next.t('errors.smtp_host_not_found', { lng: language })
			)
		}

		if (error.code === 'EENVELOPE') {
			throw ApiError.InternalError(
				i18next.t('errors.smtp_envelope_error', { lng: language })
			)
		}

		if (error.code === 'ENOENT') {
			throw ApiError.InternalError(
				i18next.t('errors.mail_template_not_found', { lng: language })
			)
		}

		throw ApiError.InternalError(i18next.t(defaultErrorType, { lng: language }))
	}

	/**
	 * Обрабатывает ошибки операций с токенами и возвращает соответствующие ApiError
	 * @param {Error} error - Ошибка для обработки
	 * @param {string} language - Язык для сообщений об ошибках
	 * @param {string} methodName - Название метода для логирования
	 * @param {string} defaultErrorType - Тип ошибки по умолчанию для перевода
	 */
	handleTokenError(error, language, methodName, defaultErrorType) {
		logError(error, { methodName, errorType: defaultErrorType, language })

		if (error instanceof ApiError) {
			throw error
		}

		if (error.name === 'JsonWebTokenError') {
			throw ApiError.BadRequest(
				i18next.t('errors.invalid_token_format', { lng: language })
			)
		}

		if (error.name === 'TokenExpiredError') {
			throw ApiError.BadRequest(
				i18next.t('errors.token_expired', { lng: language })
			)
		}

		if (error.name === 'NotBeforeError') {
			throw ApiError.BadRequest(
				i18next.t('errors.token_not_active', { lng: language })
			)
		}

		if (error.name === 'ValidationError') {
			throw ApiError.BadRequest(
				i18next.t('errors.token_validation_error', { lng: language })
			)
		}

		if (error.name === 'CastError') {
			throw ApiError.BadRequest(
				i18next.t('errors.invalid_token_id_format', { lng: language })
			)
		}

		if (
			error.name === 'MongoNetworkError' ||
			error.name === 'MongoTimeoutError'
		) {
			throw ApiError.InternalError(
				i18next.t('errors.database_connection_error', { lng: language })
			)
		}

		throw ApiError.InternalError(i18next.t(defaultErrorType, { lng: language }))
	}

	/**
	 * Преобразует первую букву строки в заглавную
	 * @param {string} str - Строка для преобразования
	 * @returns {string} - Преобразованная строка
	 */
	capitalize = str => {
		if (!str) return ''

		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	/**
	 * Пагинация массива
	 * @param {Array} array - Массив для пагинации
	 * @param {number} page - Номер страницы
	 * @param {number} limit - Количество элементов на странице
	 * @param {Object} sort - Сортировка
	 * @param {string} search - Поиск
	 * @param {Array} searchFields - Поля для поиска
	 * @returns {Object} - Объект с пагинированными данными
	 */
	async paginate(
		array,
		page = 1,
		limit = 5,
		sort = { type: 'closed_time', value: 'desc' },
		search = '',
		searchFields = null
	) {
		if (!Array.isArray(array)) {
			throw new Error('Pagination error: array is not an array!')
		}

		const validPage = page && page >= 1 ? page : 1
		const validLimit = limit && limit > 0 ? limit : 5
		let filteredArray = [...array]

		if (search && search.trim() !== '') {
			const searchLower = search.toLowerCase().trim()

			if (searchFields && Array.isArray(searchFields)) {
				filteredArray = filteredArray.filter(item => {
					return searchFields.some(field => {
						const value = item[field]
						return (
							value &&
							typeof value === 'string' &&
							value.toLowerCase().includes(searchLower)
						)
					})
				})
			} else {
				filteredArray = filteredArray.filter(item => {
					return Object.values(item).some(
						value =>
							typeof value === 'string' &&
							value.toLowerCase().includes(searchLower)
					)
				})
			}
		}

		if (sort && sort.type) {
			filteredArray.sort((a, b) => {
				const aValue = a[sort.type]
				const bValue = b[sort.type]

				if (
					sort.type === 'closed_time' ||
					sort.type === 'date' ||
					sort.type === 'transactionTime' ||
					sort.type === 'open_time'
				) {
					const aNum =
						typeof aValue === 'number' ? aValue : new Date(aValue).getTime()
					const bNum =
						typeof bValue === 'number' ? bValue : new Date(bValue).getTime()
					return sort.value === 'asc' ? aNum - bNum : bNum - aNum
				}

				if (typeof aValue === 'number' && typeof bValue === 'number') {
					return sort.value === 'asc' ? aValue - bValue : bValue - aValue
				}

				if (typeof aValue === 'string' && typeof bValue === 'string') {
					return sort.value === 'asc'
						? aValue.localeCompare(bValue)
						: bValue.localeCompare(aValue)
				}

				const aStr = String(aValue || '')
				const bStr = String(bValue || '')

				return sort.value === 'asc'
					? aStr.localeCompare(bStr)
					: bStr.localeCompare(aStr)
			})
		}

		const totalItems = filteredArray.length
		const totalPages = Math.ceil(totalItems / validLimit)
		const startIndex = (validPage - 1) * validLimit
		const endIndex = Math.min(startIndex + validLimit, totalItems)
		const itemsOnPage = filteredArray.slice(startIndex, endIndex)

		return {
			items: itemsOnPage,
			total: totalItems,
			totalPages,
		}
	}

	/**
	 * Расчет общего PNL
	 * @param {Array} array - Массив для расчета
	 * @returns {Object} - Объект с рассчитанным PNL
	 */
	async calculateTotalPnl(array) {
		let totalLoss = 0
		let totalProfit = 0

		array.forEach(order => {
			if (order.roe < 0) {
				totalLoss += order.roe
			} else {
				totalProfit += order.roe
			}
		})

		return {
			loss: parseFloat(Number(totalLoss)).toFixed(2),
			profit: parseFloat(Number(totalProfit)).toFixed(2),
		}
	}

	/**
	 * Расчет общей прибыли и убытков
	 * @param {Array} array - Массив для расчета
	 * @returns {Object} - Объект с рассчитанной прибылью и убытками
	 */
	async calculateTotalProfit(array) {
		let totalLoss = 0
		let totalProfit = 0
		let lossCount = 0
		let profitCount = 0

		array.forEach(order => {
			if (order.roe < 0) {
				totalLoss += order.pnl
				lossCount++
			} else {
				totalProfit += order.pnl
				profitCount++
			}
		})

		return {
			loss: parseFloat(Number(totalLoss)).toFixed(2),
			profit: parseFloat(Number(totalProfit)).toFixed(2),
			lossCount: parseFloat(Number(lossCount)),
			profitCount: parseFloat(Number(profitCount)),
		}
	}

	validationError(req, next) {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			return next(ApiError.BadRequest('Validation error', errors.array()))
		}

		return true
	}
}

module.exports = new Helpers()
