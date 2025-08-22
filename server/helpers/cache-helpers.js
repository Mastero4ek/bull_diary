const redis = require('@configs/redis-config')
const { logError } = require('@configs/logger-config')

class HelpersCache {
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
	 * Удаляет данные из Redis кеша
	 * @param {string} cacheKey - Ключ кеша
	 * @param {string} methodName - Название метода для логирования ошибок
	 * @returns {Promise<void>}
	 */
	async deleteFromCache(cacheKey, methodName = 'unknown') {
		if (!redis) return

		try {
			await redis.del(cacheKey)
		} catch (error) {
			logError(error, { methodName, cacheKey, operation: 'cache_delete' })
		}
	}

	/**
	 * Очищает все кэши, связанные с ордерами пользователя
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи
	 * @param {string} methodName - Название метода для логирования ошибок
	 * @returns {Promise<void>}
	 */
	async clearOrdersCache(userId, exchange, methodName = 'unknown') {
		if (!redis) return

		try {
			const pattern = `${exchange}_pnl:${userId}:*`
			const keys = await redis.keys(pattern)

			if (keys.length > 0) {
				await redis.del(...keys)
			}
		} catch (error) {
			logError(error, {
				methodName,
				userId,
				exchange,
				operation: 'cache_clear_orders',
			})
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
}

module.exports = new HelpersCache()
