const { ApiError } = require('../exceptions/api-error')
const tokenService = require('../services/token-service')
const UserModel = require('../models/user-model')
const { logError } = require('../config/logger')

module.exports = function (req, res, next) {
	try {
		// First try to get token from cookies
		let accessToken = req.cookies.access_token

		// If no access token in cookies, try refresh token
		if (!accessToken && req.cookies.refresh_token) {
			const userData = tokenService.validateRefreshToken(
				req.cookies.refresh_token,
				req.lng || 'en'
			)

			if (userData) {
				// If refresh token is valid, proceed with the request
				req.user = userData

				return next()
			} else {
				// Clear expired refresh token
				res.clearCookie('refresh_token', {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'prod',
					sameSite: 'strict',
					path: '/',
				})
				res.clearCookie('access_token', {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'prod',
					sameSite: 'strict',
					path: '/',
				})
			}
		}

		// Fallback to Authorization header if no valid cookies
		if (!accessToken) {
			const authorizationHeader = req.headers.authorization

			if (!authorizationHeader) {
				return next(ApiError.UnauthorizedError())
			}

			accessToken = authorizationHeader.split(' ')[1]

			if (!accessToken) {
				return next(ApiError.UnauthorizedError())
			}
		}

		const userData = tokenService.validateAccessToken(
			accessToken,
			req.lng || 'en'
		)

		if (!userData) {
			return next(ApiError.UnauthorizedError())
		}

		req.user = userData

		// Update user activity asynchronously
		if (userData && userData.id) {
			UserModel.findByIdAndUpdate(
				userData.id,
				{ updated_at: new Date() },
				{ new: false }
			).catch(error => {
				logError(error, {
					context: 'auth-middleware - update user activity',
					userId: userData.id,
					path: req.path,
					method: req.method,
				})
			})
		}

		next()
	} catch (e) {
		return next(ApiError.UnauthorizedError())
	}
}
