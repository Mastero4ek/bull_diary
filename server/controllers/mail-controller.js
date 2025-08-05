const userService = require('../service/user-service')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')

class MailController {
	async activate(req, res, next) {
		try {
			const activation_link = req.params.link
			const user_data = await userService.activate(activation_link, req.lng)

			if (!user_data || !user_data.user) {
				throw ApiError.InternalError(
					i18next.t('errors.failed_to_get_user_data_after_activation', {
						lng: req.lng,
					})
				)
			}

			res.cookie('refresh_token', user_data.refresh_token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: process.env.NODE_ENV === 'prod',
				sameSite: 'lax',
				path: '/',
				domain:
					process.env.NODE_ENV === 'prod' ? process.env.DOMAIN : 'localhost',
			})

			res.cookie('access_token', user_data.access_token, {
				maxAge: parseInt(process.env.ACCESS_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: process.env.NODE_ENV === 'prod',
				sameSite: 'lax',
				path: '/',
				domain:
					process.env.NODE_ENV === 'prod' ? process.env.DOMAIN : 'localhost',
			})

			const { access_token, refresh_token, ...user_data_safe } = user_data

			return res.redirect(
				`${process.env.CLIENT_URL}/wallet?user=${encodeURIComponent(
					JSON.stringify({ user: user_data_safe.user })
				)}`
			)
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new MailController()
