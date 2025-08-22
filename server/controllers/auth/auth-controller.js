const UserService = require('@services/core/user-service')
const { validationError } = require('@helpers/sanitization-helpers')

class AuthController {
	async signUp(req, res, next) {
		try {
			validationError(req, next)

			const { name, email, password, source } = req.body

			const user_data = await UserService.signUp(
				name,
				email,
				password,
				req.lng,
				source || 'self'
			)

			res.cookie('refresh_token', user_data.refresh_token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: process.env.NODE_ENV === 'prod',
				sameSite: 'strict',
				path: '/',
			})

			return res.json(user_data)
		} catch (e) {
			next(e)
		}
	}

	async signIn(req, res, next) {
		try {
			validationError(req, next)

			const { email, password } = req.body

			const user_data = await UserService.signIn(email, password, req.lng)

			res.cookie('refresh_token', user_data.refresh_token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: process.env.NODE_ENV === 'prod',
				sameSite: 'strict',
				path: '/',
			})

			return res.json(user_data)
		} catch (e) {
			next(e)
		}
	}

	async logout(req, res, next) {
		try {
			validationError(req, next)

			const { refresh_token } = req.cookies

			await UserService.logout(refresh_token, req.lng)

			req.session.destroy(err => {
				if (err) {
					return next(err)
				}

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

				return res.json({ message: 'Logged out successfully' })
			})
		} catch (e) {
			next(e)
		}
	}

	async refresh(req, res, next) {
		try {
			const { refresh_token: existing_refresh_token } = req.cookies
			const user = req.user

			let user_data = {}

			if (user && (user.source === 'github' || user.source === 'google')) {
				user_data = await UserService.checkSourceAuth(user.email, req.lng)
			} else if (existing_refresh_token && !user) {
				try {
					user_data = await UserService.refresh(existing_refresh_token, req.lng)
				} catch (refreshError) {
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

					return res.json({})
				}
			} else {
				return res.json({})
			}

			res.cookie('refresh_token', user_data.refresh_token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: process.env.NODE_ENV === 'prod',
				sameSite: 'strict',
				path: '/',
			})
			res.cookie('access_token', user_data.access_token, {
				maxAge: parseInt(process.env.ACCESS_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: process.env.NODE_ENV === 'prod',
				sameSite: 'strict',
				path: '/',
			})

			const { access_token, refresh_token, ...user_data_safe } = user_data

			return res.json(user_data_safe)
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new AuthController()
