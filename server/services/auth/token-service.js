const jwt = require('jsonwebtoken')

const { logError } = require('@configs/logger-config')
const { handleTokenError } = require('@helpers/error-helpers')
const TokenModel = require('@models/auth/token-model')

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
				'Failed to generate tokens'
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
				refresh_token,
			})

			return token
		} catch (error) {
			handleTokenError(error, lng, 'saveToken', 'Failed to save token')
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
			handleTokenError(error, lng, 'removeToken', 'Failed to remove token')
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
			handleTokenError(error, lng, 'findToken', 'Failed to find token')
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
