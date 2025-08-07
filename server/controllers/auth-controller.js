const userService = require('../services/user-service')
const Helpers = require('../helpers/helpers')

class AuthController {
	async signUp(req, res, next) {
		try {
			Helpers.validationError(req, next)

			const { name, email, password, source } = req.body

			const user_data = await userService.signUp(
				name,
				email,
				password,
				req.lng,
				source || 'self'
			)

			res.cookie('refresh_token', user_data.refresh_token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				path: '/',
			})

			return res.json(user_data)
		} catch (e) {
			next(e)
		}
	}

	async signIn(req, res, next) {
		try {
			Helpers.validationError(req, next)

			const { email, password } = req.body

			const user_data = await userService.signIn(email, password, req.lng)

			res.cookie('refresh_token', user_data.refresh_token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				path: '/',
			})

			return res.json(user_data)
		} catch (e) {
			next(e)
		}
	}

	async logout(req, res, next) {
		try {
			Helpers.validationError(req, next)

			const { refresh_token } = req.cookies

			await userService.logout(refresh_token, req.lng)

			req.session.destroy(err => {
				if (err) {
					return next(err)
				}

				res.clearCookie('refresh_token')
				res.clearCookie('access_token')

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
				user_data = await userService.checkSourceAuth(user.email, req.lng)
			} else if (existing_refresh_token && !user) {
				user_data = await userService.refresh(existing_refresh_token, req.lng)
			} else {
				return res.json({})
			}

			res.cookie('refresh_token', user_data.refresh_token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				path: '/',
			})
			res.cookie('access_token', user_data.access_token, {
				maxAge: parseInt(process.env.ACCESS_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
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
