const userService = require('../services/user-service')
const { validationResult } = require('express-validator')
const { ApiError } = require('../exceptions/api-error')
const UserModel = require('../models/user-model')
const TokenModel = require('../models/token-model')
const fileService = require('../services/file-service')
const keysService = require('../services/keys-service')
const i18next = require('i18next')

class UserController {
	async createUser(req, res, next) {
		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						i18next.t('errors.validation', { lng: req.lng }),
						errors.array()
					)
				)
			}

			const { name, last_name, email, password, phone, role } = req.body
			const cover = req.file

			const user = await userService.createUser(
				name,
				last_name,
				email,
				password,
				phone,
				role,
				cover
			)

			return res.json(user)
		} catch (e) {
			next(e)
		}
	}

	async editUser(req, res, next) {
		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						i18next.t('errors.validation', { lng: req.lng }),
						errors.array()
					)
				)
			}

			const { name, last_name, email, password, phone } = req.body
			const cover = req.file
			const user = req.user
			const targetUserId = req.params.id

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

			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						i18next.t('errors.validation', { lng: req.lng }),
						errors.array()
					)
				)
			}

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
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						i18next.t('errors.validation', { lng: req.lng }),
						errors.array()
					)
				)
			}

			const { id } = req.params
			const user = await userService.getUser(id, req.lng)

			return res.json({ user })
		} catch (e) {
			next(e)
		}
	}

	async getUsers(req, res, next) {
		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						i18next.t('errors.validation', { lng: req.lng }),
						errors.array()
					)
				)
			}

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
