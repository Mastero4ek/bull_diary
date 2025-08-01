const jwt = require('jsonwebtoken')
const TokenModel = require('../models/token-model')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')
const Helpers = require('../helpers/helpers')
const { logError } = require('../config/logger')

class TokenService {
	async generateTokens(payload, lng = 'en') {
		try {
			if (!payload) {
				throw ApiError.BadRequest(i18next.t('errors.payload_required', { lng }))
			}

			if (!payload.id || !payload.email) {
				throw ApiError.BadRequest(
					i18next.t('errors.invalid_payload_format', { lng })
				)
			}

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
			Helpers.handleTokenError(
				error,
				lng,
				'generateTokens',
				'errors.token_generation_failed'
			)
		}
	}

	async saveToken(userId, refresh_token, lng = 'en') {
		try {
			if (!userId) {
				throw ApiError.BadRequest(i18next.t('errors.user_id_required', { lng }))
			}

			if (!refresh_token) {
				throw ApiError.BadRequest(
					i18next.t('errors.refresh_token_required', { lng })
				)
			}

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
			Helpers.handleTokenError(
				error,
				lng,
				'saveToken',
				'errors.token_save_failed'
			)
		}
	}

	async removeToken(refresh_token, lng = 'en') {
		try {
			if (!refresh_token) {
				throw ApiError.BadRequest(
					i18next.t('errors.refresh_token_required', { lng })
				)
			}

			const tokenData = await TokenModel.deleteOne({ refresh_token })

			return tokenData
		} catch (error) {
			Helpers.handleTokenError(
				error,
				lng,
				'removeToken',
				'errors.token_removal_failed'
			)
		}
	}

	async findToken(refresh_token, lng = 'en') {
		try {
			if (!refresh_token) {
				throw ApiError.BadRequest(
					i18next.t('errors.refresh_token_required', { lng })
				)
			}

			const tokenData = await TokenModel.findOne({ refresh_token })

			return tokenData
		} catch (error) {
			Helpers.handleTokenError(
				error,
				lng,
				'findToken',
				'errors.token_find_failed'
			)
		}
	}

	validateAccessToken(token) {
		try {
			if (!token) {
				return null
			}

			const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

			return userData
		} catch (error) {
			logError(error, { context: 'access token validation' })

			return null
		}
	}

	validateRefreshToken(token) {
		try {
			if (!token) {
				return null
			}

			const userData = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
			return userData
		} catch (error) {
			logError(error, { context: 'refresh token validation' })

			return null
		}
	}
}

module.exports = new TokenService()
