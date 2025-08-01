const UserModel = require('../models/user-model')
const KeysModel = require('../models/keys-model')
const FileModel = require('../models/file-model')
const TokenModel = require('../models/token-model')
const LevelModel = require('../models/level-model')
const TournamentUserModel = require('../models/tournament_user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const tokenService = require('./token-service')
const mailService = require('./mail-service')
const UserDto = require('../dtos/user-dto')
const KeysDto = require('../dtos/keys-dto')
const { ApiError, localizedError } = require('../exceptions/api-error')
const moment = require('moment')
const OrderModel = require('../models/order-model')
const i18next = require('i18next')
const fs = require('fs')
const path = require('path')
const redis = require('../config/redis')
const Helpers = require('../helpers/helpers')
const { logError, logInfo, logWarn } = require('../config/logger')

class UserService {
	async signUp(name, email, password, lng = 'en', source = 'self') {
		try {
			if (!name) {
				throw ApiError.BadRequest(i18next.t('errors.name_required', { lng }))
			}

			if (!email) {
				throw ApiError.BadRequest(i18next.t('errors.email_required', { lng }))
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

			if (!emailRegex.test(email)) {
				throw ApiError.BadRequest(
					i18next.t('errors.invalid_email_format', { lng })
				)
			}

			if (source === 'self' && !password) {
				throw ApiError.BadRequest(
					i18next.t('errors.password_required', { lng })
				)
			}

			if (source === 'self' && password && password.length < 6) {
				throw ApiError.BadRequest(
					i18next.t('errors.password_too_short', { lng })
				)
			}

			const normalizedEmail = email.toLowerCase()
			const existingUser = await UserModel.findOne({ email: normalizedEmail })

			if (existingUser) {
				throw ApiError.BadRequest(i18next.t('errors.email_exists', { lng }))
			}

			let hashedPassword = undefined

			if (source === 'self') {
				const salt = await bcrypt.genSalt(10)

				hashedPassword = await bcrypt.hash(password, salt)
			}

			const activation_link = uuid.v4()

			const user = await UserModel.create({
				name,
				email: normalizedEmail,
				...(source === 'self' ? { password: hashedPassword } : {}),
				activation_link,
				source,
				updated_at: new Date(),
				created_at: new Date(),
			})

			const keys = await KeysModel.create({ user: user._id })
			const level = await LevelModel.create({ user: user._id })

			await mailService.sendActivationMail(
				name,
				email,
				lng,
				`${process.env.API_URL}/api/activate/${activation_link}`
			)

			const user_dto = new UserDto(user)

			const tokens = await tokenService.generateTokens(
				{
					id: user._id.toString(),
					email: user.email,
				},
				lng
			)

			if (!tokens || !tokens.refresh_token) {
				throw ApiError.InternalError(
					i18next.t('errors.failed_generate_tokens', { lng })
				)
			}

			await tokenService.saveToken(user_dto.id, tokens.refresh_token, lng)

			return {
				...tokens,
				user: { ...user_dto, ...new KeysDto(keys), level: level.level },
			}
		} catch (error) {
			if (error.message.includes('token') && email) {
				try {
					const user = await UserModel.findOne({ email })

					if (user) {
						await Promise.all([
							UserModel.deleteOne({ _id: user._id }),
							KeysModel.deleteOne({ user: user._id }),
							LevelModel.deleteOne({ user: user._id }),
						])
					}
				} catch (cleanupError) {
					logError(cleanupError, {
						context: 'user cleanup after signup error',
						email,
					})
				}
			}

			Helpers.handleDatabaseError(
				error,
				lng,
				'signUp',
				'errors.failed_create_user'
			)
		}
	}

	async signIn(email, password, lng = 'en') {
		try {
			if (!email) {
				throw ApiError.BadRequest(i18next.t('errors.email_required', { lng }))
			}

			if (!password) {
				throw ApiError.BadRequest(
					i18next.t('errors.password_required', { lng })
				)
			}

			const normalizedEmail = email.toLowerCase()
			const user = await UserModel.findOne({ email: normalizedEmail })

			if (!user) {
				throw ApiError.UnauthorizedError(
					i18next.t('errors.user_not_found', { lng })
				)
			}

			if (!user.is_activated) {
				throw ApiError.UnauthorizedError(
					i18next.t('errors.activate_account_first', { lng })
				)
			}

			const isPasswordValid = await bcrypt.compare(password, user.password)

			if (!isPasswordValid) {
				throw ApiError.UnauthorizedError(
					i18next.t('errors.invalid_email_or_password', { lng })
				)
			}

			user.updated_at = new Date()
			await user.save()

			const keys = await KeysModel.findOne({ user: user._id })
			const level = await LevelModel.findOne({ user: user._id })

			if (!keys || !level) {
				throw ApiError.InternalError(
					i18next.t('errors.user_data_incomplete', { lng })
				)
			}

			const user_dto = new UserDto(user)
			const tokens = await tokenService.generateTokens(
				{
					id: user._id.toString(),
					email: user.email,
				},
				lng
			)

			if (!tokens || !tokens.refresh_token) {
				throw ApiError.InternalError(
					i18next.t('errors.failed_generate_tokens', { lng })
				)
			}

			await tokenService.saveToken(
				user._id.toString(),
				tokens.refresh_token,
				lng
			)

			return {
				...tokens,
				user: { ...user_dto, ...new KeysDto(keys), level: level.level },
			}
		} catch (error) {
			Helpers.handleDatabaseError(error, lng, 'signIn', 'errors.failed_sign_in')
		}
	}

	async checkSourceAuth(email, lng = 'en') {
		try {
			if (!email) {
				throw ApiError.BadRequest(i18next.t('errors.email_required', { lng }))
			}

			const normalizedEmail = email.toLowerCase()
			const user = await UserModel.findOne({ email: normalizedEmail })

			if (!user) {
				throw ApiError.UnauthorizedError(
					i18next.t('errors.user_not_found', { lng })
				)
			}

			user.updated_at = new Date()
			await user.save()

			const keys = await KeysModel.findOne({ user: user._id })
			const level = await LevelModel.findOne({ user: user._id })

			if (!keys || !level) {
				throw ApiError.InternalError(
					i18next.t('errors.user_data_incomplete', { lng })
				)
			}

			const user_dto = new UserDto(user)
			const tokens = await tokenService.generateTokens(
				{
					id: user._id.toString(),
					email: user.email,
				},
				lng
			)

			if (!tokens || !tokens.refresh_token) {
				throw ApiError.InternalError(
					i18next.t('errors.failed_generate_tokens', { lng })
				)
			}

			await tokenService.saveToken(
				user._id.toString(),
				tokens.refresh_token,
				lng
			)

			return {
				...tokens,
				user: { ...user_dto, ...new KeysDto(keys), level: level.level },
			}
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'checkSourceAuth',
				'errors.failed_source_auth'
			)
		}
	}

	async logout(refresh_token, lng = 'en') {
		try {
			if (!refresh_token) {
				throw ApiError.UnauthorizedError(
					i18next.t('errors.refresh_token_required', { lng })
				)
			}

			return await tokenService.removeToken(refresh_token, lng)
		} catch (error) {
			Helpers.handleTokenError(error, lng, 'logout', 'errors.failed_logout')
		}
	}

	async refresh(refresh_token, lng = 'en') {
		try {
			if (!refresh_token) {
				throw ApiError.UnauthorizedError(
					i18next.t('errors.refresh_token_required', { lng })
				)
			}

			const user_data = tokenService.validateRefreshToken(refresh_token, lng)

			if (!user_data || !user_data.id) {
				throw ApiError.UnauthorizedError(
					i18next.t('errors.invalid_refresh_token', { lng })
				)
			}

			const token_data = await tokenService.findToken(refresh_token, lng)

			if (!token_data) {
				throw ApiError.UnauthorizedError(
					i18next.t('errors.refresh_token_not_found', { lng })
				)
			}

			const user = await UserModel.findById(user_data.id)

			if (!user) {
				throw ApiError.UnauthorizedError(
					i18next.t('errors.user_not_found', { lng })
				)
			}

			user.updated_at = new Date()
			await user.save()

			const keys = await KeysModel.findOne({ user: user._id })
			const level = await LevelModel.findOne({ user: user._id })

			if (!keys || !level) {
				throw ApiError.InternalError(
					i18next.t('errors.user_data_incomplete', { lng })
				)
			}

			const user_dto = new UserDto(user)
			const tokens = await tokenService.generateTokens(
				{
					id: user._id.toString(),
					email: user.email,
				},
				lng
			)

			if (!tokens || !tokens.refresh_token) {
				throw ApiError.InternalError(
					i18next.t('errors.failed_generate_tokens', { lng })
				)
			}

			await tokenService.saveToken(
				user._id.toString(),
				tokens.refresh_token,
				lng
			)

			return {
				...tokens,
				user: { ...user_dto, ...new KeysDto(keys), level: level.level },
			}
		} catch (error) {
			Helpers.handleTokenError(
				error,
				lng,
				'refresh',
				'errors.failed_refresh_token'
			)
		}
	}

	async activate(activation_link, lng = 'en') {
		try {
			if (!activation_link) {
				throw ApiError.BadRequest(
					i18next.t('errors.activation_link_required', { lng })
				)
			}

			const user = await UserModel.findOne({ activation_link })

			if (!user) {
				throw ApiError.BadRequest(
					i18next.t('errors.invalid_activation_link', { lng })
				)
			}

			if (user.is_activated) {
				throw ApiError.BadRequest(
					i18next.t('errors.account_already_activated', { lng })
				)
			}

			const activationExpiry = moment(user.created_at).add(24, 'hours')

			if (moment().isAfter(activationExpiry)) {
				const new_activation_link = uuid.v4()

				user.activation_link = new_activation_link

				await user.save()

				await mailService.sendActivationMail(
					user.name,
					user.email,
					lng,
					`${process.env.API_URL}/api/activate/${new_activation_link}`
				)

				throw ApiError.BadRequest(
					i18next.t('errors.activation_link_expired', { lng })
				)
			}

			user.is_activated = true
			user.activation_link = undefined
			user.updated_at = new Date()

			await user.save()

			const [keys, level] = await Promise.all([
				KeysModel.findOne({ user: user._id }),
				LevelModel.findOne({ user: user._id }),
			])

			if (!keys || !level) {
				throw ApiError.InternalError(
					i18next.t('errors.user_data_incomplete', { lng })
				)
			}

			const user_dto = new UserDto(user)
			const tokens = await tokenService.generateTokens(
				{
					id: user._id.toString(),
					email: user.email,
				},
				lng
			)

			if (!tokens || !tokens.refresh_token) {
				throw ApiError.InternalError(
					i18next.t('errors.failed_generate_tokens', { lng })
				)
			}

			await tokenService.saveToken(
				user._id.toString(),
				tokens.refresh_token,
				lng
			)

			return {
				...tokens,
				user: { ...user_dto, ...new KeysDto(keys), level: level.level },
			}
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'activate',
				'errors.failed_activate_account'
			)
		}
	}

	async editUser(
		name,
		last_name,
		email,
		password,
		phone,
		userId = null,
		lng = 'en'
	) {
		try {
			if (!userId && !email) {
				throw ApiError.BadRequest(
					i18next.t('errors.user_id_or_email_required', { lng })
				)
			}

			if (email) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
				if (!emailRegex.test(email)) {
					throw ApiError.BadRequest(
						i18next.t('errors.invalid_email_format', { lng })
					)
				}
			}

			if (password && password.length < 6) {
				throw ApiError.BadRequest(
					i18next.t('errors.password_too_short', { lng })
				)
			}

			let user

			if (userId) {
				user = await UserModel.findById(userId)
			} else {
				user = await UserModel.findOne({ email })
			}

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			const hashPassword =
				password && password !== ''
					? await bcrypt.hash(password, 3)
					: user.password

			if (email && email !== user.email) {
				const existingUser = await UserModel.findOne({
					email: email.toLowerCase(),
				})

				if (
					existingUser &&
					existingUser._id.toString() !== user._id.toString()
				) {
					throw ApiError.BadRequest(
						i18next.t('errors.email_already_exists', { lng })
					)
				}

				logInfo('User email changed', {
					userId: user._id,
					oldEmail: user.email,
					newEmail: email,
				})
			}

			const new_user = await UserModel.findOneAndUpdate(
				{ _id: user._id },
				{
					$set: {
						name: name === '' ? user.name : name,
						last_name: last_name,
						email: email && email !== '' ? email.toLowerCase() : user.email,
						password: password === '' ? user.password : hashPassword,
						change_password: password === '' ? user.change_password : true,
						phone: phone === 'null' ? user.phone : phone,
						updated_at: new Date(),
					},
				},
				{ returnDocument: 'after' }
			)

			if (!new_user) {
				throw ApiError.InternalError(
					i18next.t('errors.user_update_failed', { lng })
				)
			}

			await TournamentUserModel.updateMany(
				{ id: user._id },
				{
					$set: {
						name: new_user.name,
						last_name: new_user.last_name,
						email: new_user.email,
						phone: new_user.phone,
						cover: new_user.cover,
						updated_at: new Date(),
					},
				}
			)

			const keys = await KeysModel.findOne({ user: user._id })
			const level = await LevelModel.findOne({ user: user._id })

			if (!keys || !level) {
				throw ApiError.InternalError(
					i18next.t('errors.user_data_incomplete', { lng })
				)
			}

			const keys_dto = new KeysDto(keys)
			const user_dto = new UserDto(new_user)

			return { user: { ...user_dto, ...keys_dto, level: level.level } }
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'editUser',
				'errors.user_edit_failed'
			)
		}
	}

	async removeUser(current_email, refresh_token, lng = 'en') {
		try {
			if (!current_email) {
				throw ApiError.BadRequest(i18next.t('errors.email_required', { lng }))
			}

			const user = await UserModel.findOneAndDelete({ email: current_email })

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			await KeysModel.findOneAndDelete({ user: user._id })
			await LevelModel.findOneAndDelete({ user: user._id })

			if (refresh_token) {
				await tokenService.removeToken(refresh_token, lng)
			} else {
				await TokenModel.deleteMany({ user: user._id })
			}

			const files = await FileModel.find({ user: user._id })

			for (const file of files) {
				const filePath = path.join(__dirname, '../uploads', file.name)

				if (fs.existsSync(filePath)) {
					try {
						fs.unlinkSync(filePath)
					} catch (err) {
						if (err.code !== 'ENOENT') {
							logError(err, {
								context: 'file deletion during user removal',
								userId: user._id,
								fileName: file.name,
							})
						}
					}
				}

				await file.deleteOne()
			}

			return { user }
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'removeUser',
				'errors.user_removal_failed'
			)
		}
	}

	async deleteInactiveUsers() {
		const twenty_four_hours_ago = moment().subtract(24, 'hours').toDate()

		try {
			const users = await UserModel.find({
				is_activated: false,
				created_at: { $lt: twenty_four_hours_ago },
			})

			let deletedCount = 0

			for (const user of users) {
				try {
					await Promise.all([
						FileModel.deleteMany({ user: user._id }),
						KeysModel.deleteMany({ user: user._id }),
						LevelModel.deleteMany({ user: user._id }),
						TokenModel.deleteMany({ user: user._id }),
						OrderModel.deleteMany({ user: user._id }),
						user.deleteOne(),
					])

					deletedCount++
				} catch (err) {
					logError(err, {
						context: 'delete inactive user',
						userEmail: user.email,
						userId: user._id,
					})
				}
			}

			const formatDate = date => {
				return moment(date).format('DD.MM.YYYY - HH:mm:ss')
			}

			logInfo('Inactive users cleanup completed', {
				deletedCount,
				timestamp: formatDate(new Date()),
			})

			return deletedCount
		} catch (err) {
			logError(err, { context: 'deleteInactiveUsers' })
			throw err
		}
	}

	async getUser(userId, lng = 'en') {
		try {
			if (!userId) {
				throw ApiError.BadRequest(i18next.t('errors.user_id_required', { lng }))
			}

			const user = await UserModel.findById(userId)

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			const keys = await KeysModel.findOne({ user: user._id })
			const level = await LevelModel.findOne({ user: user._id })

			if (!keys || !level) {
				throw ApiError.InternalError(
					i18next.t('errors.user_data_incomplete', { lng })
				)
			}

			const user_dto = new UserDto(user)

			return { ...user_dto, ...new KeysDto(keys), level: level.level }
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'getUser',
				'errors.failed_get_user_data'
			)
		}
	}

	async getUsers(
		sort,
		search,
		page = 1,
		limit = 5,
		start_time,
		end_time,
		lng = 'en'
	) {
		try {
			if (!page || page < 1) {
				throw ApiError.BadRequest(
					i18next.t('errors.invalid_page_number', { lng })
				)
			}

			if (!limit || limit < 1 || limit > 100) {
				throw ApiError.BadRequest(
					i18next.t('errors.invalid_limit_value', { lng })
				)
			}

			const filter = {}

			if (start_time && end_time) {
				filter.created_at = {
					$gte: new Date(start_time),
					$lte: new Date(end_time),
				}
			}

			if (search) {
				filter.$or = [
					{ name: { $regex: search, $options: 'i' } },
					{ email: { $regex: search, $options: 'i' } },
				]
			}

			const total = await UserModel.countDocuments(filter)
			const totalPages = Math.ceil(total / limit)

			let sortObj = {}
			if (sort && typeof sort === 'object') {
				sortObj[sort.type || 'created_at'] = sort.value === 'asc' ? 1 : -1
			} else {
				sortObj.created_at = -1
			}

			const users = await UserModel.find(filter)
				.sort(sortObj)
				.skip((page - 1) * limit)
				.limit(limit)

			if (!users) {
				throw ApiError.NotFound(i18next.t('errors.users_not_found', { lng }))
			}

			const result = { users, total_pages: totalPages }

			return result
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'getUsers',
				'errors.failed_get_users'
			)
		}
	}
}

module.exports = new UserService()
