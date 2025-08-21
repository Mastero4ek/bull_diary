const jwt = require('jsonwebtoken')
const TokenModel = require('../models/token-model')
const { handleTokenError } = require('../helpers/error-helpers')
const i18next = require('i18next')
const { logError } = require('../config/logger')

class TokenService {
	/**
	 * Генерирует access и refresh токены для пользователя
	 * @param {Object} payload - Данные для включения в токен
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Объект с access и refresh токенами
	 */
	async generateTokens(payload, lng = 'en') {
		try {
			const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: '30m',
			})
			const refresh_token = jwt.sign(
				payload,
				process.env.REFRESH_TOKEN_SECRET,
				{
					expiresIn: '30d',
				}
			)

			return {
				access_token,
				refresh_token,
			}
		} catch (error) {
			handleTokenError(
				error,
				lng,
				'generateTokens',
				'errors.token_generation_failed'
			)
		}
	}

	/**
	 * Сохраняет refresh токен в базу данных
	 * @param {string} userId - ID пользователя
	 * @param {string} refresh_token - Refresh токен
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Сохраненный токен
	 */
	async saveToken(userId, refresh_token, lng = 'en') {
		try {
			const tokenData = await TokenModel.findOne({ user: userId })

			if (tokenData) {
				tokenData.refresh_token = refresh_token

				return await tokenData.save()
			}

			const token = await TokenModel.create({
				user: userId,
				refresh_token: refresh_token,
			})

			return token
		} catch (error) {
			handleTokenError(error, lng, 'saveToken', 'errors.token_save_failed')
		}
	}

	/**
	 * Удаляет refresh токен из базы данных
	 * @param {string} refresh_token - Refresh токен для удаления
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Результат удаления
	 */
	async removeToken(refresh_token, lng = 'en') {
		try {
			const tokenData = await TokenModel.deleteOne({ refresh_token })

			return tokenData
		} catch (error) {
			handleTokenError(error, lng, 'removeToken', 'errors.token_removal_failed')
		}
	}

	/**
	 * Находит refresh токен в базе данных
	 * @param {string} refresh_token - Refresh токен для поиска
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Найденный токен
	 */
	async findToken(refresh_token, lng = 'en') {
		try {
			const tokenData = await TokenModel.findOne({ refresh_token })

			return tokenData
		} catch (error) {
			handleTokenError(error, lng, 'findToken', 'errors.token_find_failed')
		}
	}

	/**
	 * Валидирует access токен
	 * @param {string} token - Access токен для валидации
	 * @returns {Object|null} - Данные пользователя или null при ошибке
	 */
	validateAccessToken(token) {
		try {
			const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

			return userData
		} catch (error) {
			logError(error, { context: 'access token validation' })

			return null
		}
	}

	/**
	 * Валидирует refresh токен
	 * @param {string} token - Refresh токен для валидации
	 * @returns {Object|null} - Данные пользователя или null при ошибке
	 */
	validateRefreshToken(token) {
		try {
			const userData = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

			return userData
		} catch (error) {
			logError(error, { context: 'refresh token validation' })

			return null
		}
	}
}

module.exports = new TokenService()
