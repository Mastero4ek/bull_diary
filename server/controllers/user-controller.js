const userService = require('../service/user-service')
const { validationResult } = require('express-validator')
const { ApiError } = require('../exceptions/api-error')
const UserModel = require('../models/user-model')
const TokenModel = require('../models/token-model')
const fileService = require('../service/file-service')
const keysService = require('../service/keys-service')
const i18next = require('i18next')

class UserController {
	async signUp(req, res, next) {
		try {
			const errors = validationResult(req)
			const { name, email, password, source } = req.body

			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						i18next.t('errors.validation', { lng: req.lng }),
						errors.array()
					)
				)
			}

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
			})

			return res.json(user_data)
		} catch (e) {
			next(e)
		}
	}

	async signIn(req, res, next) {
		try {
			const errors = validationResult(req)
			const { email, password } = req.body

			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						i18next.t('errors.validation', { lng: req.lng }),
						errors.array()
					)
				)
			}

			const user_data = await userService.signIn(email, password, req.lng)

			res.cookie('refresh_token', user_data.refresh_token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
				httpOnly: true,
			})

			return res.json(user_data)
		} catch (e) {
			next(e)
		}
	}

	async logout(req, res, next) {
		try {
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
				secure: process.env.NODE_ENV === 'prod',
				sameSite: 'strict',
			})

			res.cookie('access_token', user_data.access_token, {
				maxAge: parseInt(process.env.ACCESS_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: process.env.NODE_ENV === 'prod',
				sameSite: 'strict',
			})

			const { access_token, refresh_token, ...user_data_safe } = user_data

			return res.json(user_data_safe)
		} catch (e) {
			next(e)
		}
	}

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

	async editUser(req, res, next) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					message: errors.array()[0].msg,
					errors: errors.array(),
				})
			}

			const { name, last_name, email, password, phone } = req.body
			const cover = req.file
			const user = req.user
			const targetUserId = req.params.id

			if (!user) {
				return next(ApiError.UnauthorizedError())
			}

			let targetUser

			if (targetUserId) {
				targetUser = await UserModel.findById(targetUserId)

				if (!targetUser) {
					return next(
						ApiError.NotFound(
							i18next.t('errors.user_not_found', { lng: req.lng })
						)
					)
				}
			} else {
				targetUser = await UserModel.findById(user.id)
			}

			if (cover) {
				if (targetUser.cover) {
					const last_slash_index = targetUser.cover.lastIndexOf('/')
					const file_name = targetUser.cover.substring(last_slash_index + 1)

					await fileService.removeCover(file_name, targetUser._id, req.lng)
				}

				await fileService.uploadCover(cover, targetUser._id, req.lng)

				const updatedUser = await UserModel.findById(targetUser._id)

				targetUser = updatedUser
			}

			const user_data = await userService.editUser(
				name || '',
				last_name || '',
				email || targetUser.email,
				password || '',
				phone || null,
				targetUser._id,
				req.lng
			)

			return res.json(user_data)
		} catch (e) {
			next(e)
		}
	}

	async removeUser(req, res, next) {
		try {
			const errors = validationResult(req)
			const { current_email, fill_email } = req.body
			const current_user = await UserModel.findOne({ email: current_email })

			if (!current_user) {
				return next(
					ApiError.NotFound(
						i18next.t('errors.user_not_found', { lng: req.lng })
					)
				)
			}

			if (current_user.email !== fill_email) {
				return next(
					ApiError.BadRequest(
						i18next.t('errors.email_mismatch', { lng: req.lng }),
						errors.array()
					)
				)
			}

			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						i18next.t('errors.validation', { lng: req.lng }),
						errors.array()
					)
				)
			}

			const tokenData = await TokenModel.findOne({ user: current_user._id })
			const refresh_token = tokenData ? tokenData.refresh_token : null
			const cookieToken = req.cookies.refresh_token
			const isCurrentSession = refresh_token && cookieToken === cookieToken

			if (current_user.cover) {
				const last_slash_index = current_user.cover.lastIndexOf('/')
				const file_name = current_user.cover.substring(last_slash_index + 1)

				await fileService.removeCover(file_name, current_user._id, req.lng)
			}

			await keysService.removeKeys(current_email, req.lng)
			await userService.removeUser(current_email, refresh_token, req.lng)

			if (isCurrentSession) {
				req.session.destroy(err => {
					if (err) {
						return next(err)
					}

					res.clearCookie('refresh_token')
					res.clearCookie('access_token')
				})
			}

			return res.json({ message: 'User removed out successfully' })
		} catch (e) {
			next(e)
		}
	}

	async getUser(req, res, next) {
		try {
			const { id } = req.params
			const user = await userService.getUser(id, req.lng)

			return res.json({ user })
		} catch (e) {
			next(e)
		}
	}

	async getUsers(req, res, next) {
		try {
			const { sort, search, page, limit, start_time, end_time } = req.query

			const users = await userService.getUsers(
				sort,
				search,
				page,
				limit,
				start_time,
				end_time,
				req.lng
			)

			return res.json({
				users: users.users,
				total_pages: users.total_pages,
			})
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new UserController()
