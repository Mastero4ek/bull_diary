const { logError } = require('@configs/logger-config')
const { ApiError } = require('@exceptions/api-error')
const UserModel = require('@models/core/user-model')
const tokenService = require('@services/auth/token-service')
const userService = require('@services/core/user-service')

/**
 * Middleware для аутентификации пользователей
 * Проверяет токены доступа и обновления, обновляет активность пользователя
 */
const authMiddleware = (req, res, next) => {
	try {
		let accessToken = req.cookies.access_token

		if (!accessToken && req.cookies.refresh_token) {
			const userData = tokenService.validateRefreshToken(
				req.cookies.refresh_token,
				req.lng || 'en'
			)

			if (userData) {
				req.user = userData

				return next()
			} else {
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

			UserModel.findById(userData.id)
				.select('email name last_name')
				.lean()
				.then(user => {
					if (user) {
						userService
							.logUserActivity(
								userData.id,
								user.email,
								user.name,
								user.last_name,
								req.ip,
								req.get('User-Agent')
							)
							.catch(error => {
								logError(error, {
									context: 'auth-middleware - log user activity',
									userId: userData.id,
								})
							})
					}
				})
				.catch(error => {
					logError(error, {
						context: 'auth-middleware - get user data for logging',
						userId: userData.id,
					})
				})
		}

		next()
	} catch (e) {
		return next(ApiError.UnauthorizedError())
	}
}

module.exports = authMiddleware
