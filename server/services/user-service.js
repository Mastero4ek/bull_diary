const UserModel = require('../models/user-model')
const KeysModel = require('../models/keys-model')
const TokenModel = require('../models/token-model')
const LevelModel = require('../models/level-model')
const TournamentUserModel = require('../models/tournament_user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const tokenService = require('./token-service')
const mailService = require('./mail-service')
const UserDto = require('../dtos/user-dto')
const KeysDto = require('../dtos/keys-dto')
const { ApiError } = require('../exceptions/api-error')
const OrderModel = require('../models/order-model')
const i18next = require('i18next')
const path = require('path')
const Helpers = require('../helpers/helpers')
const { logError } = require('../config/logger')

class UserService {
	async signUp(name, email, password, lng = 'en', source = 'self') {
		try {
			const normalizedEmail = email.toLowerCase()
			const existingUser = await UserModel.findOne({
				email: normalizedEmail,
				inactive: { $ne: true },
			})

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

			const maskedKeys = await KeysDto.createMaskedKeys(
				keys,
				user._id.toString()
			)

			return {
				...tokens,
				user: { ...user_dto, keys: maskedKeys.keys, level: level.level },
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
			const normalizedEmail = email.toLowerCase()
			const user = await UserModel.findOne({ email: normalizedEmail })

			if (!user || user.inactive) {
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

			const maskedKeys = await KeysDto.createMaskedKeys(
				keys,
				user._id.toString()
			)
			return {
				...tokens,
				user: { ...user_dto, keys: maskedKeys.keys, level: level.level },
			}
		} catch (error) {
			Helpers.handleDatabaseError(error, lng, 'signIn', 'errors.failed_sign_in')
		}
	}

	async checkSourceAuth(email, lng = 'en') {
		try {
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

			const maskedKeys = await KeysDto.createMaskedKeys(
				keys,
				user._id.toString()
			)
			return {
				...tokens,
				user: { ...user_dto, keys: maskedKeys.keys, level: level.level },
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
			return await tokenService.removeToken(refresh_token, lng)
		} catch (error) {
			Helpers.handleTokenError(error, lng, 'logout', 'errors.failed_logout')
		}
	}

	async refresh(refresh_token, lng = 'en') {
		try {
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

			const maskedKeys = await KeysDto.createMaskedKeys(
				keys,
				user._id.toString()
			)
			return {
				...tokens,
				user: { ...user_dto, keys: maskedKeys.keys, level: level.level },
			}
		} catch (error) {
			Helpers.handleTokenError(error, lng, 'refresh', 'errors.failed_refresh')
		}
	}

	async activate(activation_link, lng = 'en') {
		try {
			const user = await UserModel.findOne({ activation_link })

			if (!user) {
				throw ApiError.BadRequest(
					i18next.t('errors.invalid_activation_link', { lng })
				)
			}

			if (user.is_activated) {
				throw ApiError.BadRequest(
					i18next.t('errors.user_already_activated', { lng })
				)
			}

			user.is_activated = true
			user.activation_link = null
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

			const maskedKeys = await KeysDto.createMaskedKeys(
				keys,
				user._id.toString()
			)
			return {
				...tokens,
				user: { ...user_dto, keys: maskedKeys.keys, level: level.level },
			}
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'activate',
				'errors.failed_activate'
			)
		}
	}

	async editUser(
		userId,
		name,
		last_name,
		email,
		password,
		phone,
		cover = null,
		lng = 'en'
	) {
		try {
			const user = await UserModel.findById(userId)

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			const updateData = {
				name,
				last_name,
				email: email.toLowerCase(),
				phone,
				updated_at: new Date(),
			}

			if (password) {
				const salt = await bcrypt.genSalt(10)
				updateData.password = await bcrypt.hash(password, salt)
			}

			if (cover) {
				const fileService = require('./file-service')
				await fileService.uploadCover(cover, userId, lng)

				updateData.cover =
					process.env.API_URL + '/uploads/' + path.basename(cover.path)
			}

			const updatedUser = await UserModel.findByIdAndUpdate(
				userId,
				updateData,
				{ returnDocument: 'after' }
			)

			if (!updatedUser) {
				throw ApiError.InternalError(
					i18next.t('errors.failed_update_user', { lng })
				)
			}

			const keys = await KeysModel.findOne({ user: userId })
			const level = await LevelModel.findOne({ user: userId })

			if (!keys || !level) {
				throw ApiError.InternalError(
					i18next.t('errors.user_data_incomplete', { lng })
				)
			}

			const user_dto = new UserDto(updatedUser)
			const maskedKeys = await KeysDto.createMaskedKeys(keys, userId)

			return {
				user: { ...user_dto, keys: maskedKeys.keys, level: level.level },
			}
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'editUser',
				'errors.failed_update_user'
			)
		}
	}

	async removeCover(userId, filename, lng = 'en') {
		try {
			const user = await UserModel.findById(userId)

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			if (!user.cover) {
				throw ApiError.BadRequest(
					i18next.t('errors.no_cover_to_remove', { lng })
				)
			}

			const fileService = require('./file-service')
			await fileService.removeCover(filename, lng)

			user.cover = null
			user.updated_at = new Date()
			await user.save()

			return {
				message: i18next.t('success.cover_removed', { lng }),
			}
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'removeCover',
				'errors.failed_remove_cover'
			)
		}
	}

	async removeUser(current_email, fill_email, lng = 'en') {
		try {
			const user = await UserModel.findOne({ email: current_email })

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			// Update user data to fill email
			user.email = fill_email
			user.inactive = true
			user.updated_at = new Date()

			await user.save()

			// Remove related data
			await Promise.all([
				KeysModel.deleteOne({ user: user._id }),
				LevelModel.deleteOne({ user: user._id }),
				TokenModel.deleteMany({ user: user._id }),
				TournamentUserModel.deleteMany({ user: user._id }),
				OrderModel.deleteMany({ user: user._id }),
			])

			// Remove user files
			try {
				const fileService = require('./file-service')
				await fileService.removeUserFiles(user._id, lng)
			} catch (fileError) {
				logError(fileError, {
					context: 'removeUser - file cleanup',
					userId: user._id,
				})
			}

			return {
				message: i18next.t('success.user_removed', { lng }),
			}
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'removeUser',
				'errors.failed_remove_user'
			)
		}
	}

	async getUser(userId, lng = 'en') {
		try {
			const user = await UserModel.findById(userId)

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			const keys = await KeysModel.findOne({ user: userId })
			const level = await LevelModel.findOne({ user: userId })

			if (!keys || !level) {
				throw ApiError.InternalError(
					i18next.t('errors.user_data_incomplete', { lng })
				)
			}

			const user_dto = new UserDto(user)
			const maskedKeys = await KeysDto.createMaskedKeys(keys, userId)

			return { ...user_dto, keys: maskedKeys.keys, level: level.level }
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

	async createUser(
		name,
		last_name,
		email,
		password,
		phone,
		role,
		cover = null,
		lng = 'en'
	) {
		try {
			const normalizedEmail = email.toLowerCase()
			const existingUser = await UserModel.findOne({
				email: normalizedEmail,
				inactive: { $ne: true },
			})

			if (existingUser) {
				throw ApiError.BadRequest(i18next.t('errors.email_exists', { lng }))
			}

			const salt = await bcrypt.genSalt(10)
			const hashedPassword = await bcrypt.hash(password, salt)

			const userData = {
				name,
				last_name,
				email: normalizedEmail,
				password: hashedPassword,
				phone,
				role,
				source: 'self',
				updated_at: new Date(),
				created_at: new Date(),
			}

			const user = await UserModel.create(userData)

			// Handle cover upload if provided
			if (cover) {
				const fileService = require('./file-service')
				await fileService.uploadCover(cover, user._id, lng)

				// Update user with cover path
				const updatedUser = await UserModel.findByIdAndUpdate(
					user._id,
					{
						$set: {
							cover:
								process.env.API_URL + '/uploads/' + path.basename(cover.path),
						},
					},
					{ returnDocument: 'after' }
				)

				if (updatedUser) {
					user.cover = updatedUser.cover
				}
			}

			const keys = await KeysModel.create({ user: user._id })
			const level = await LevelModel.create({ user: user._id })

			const user_dto = new UserDto(user)
			const maskedKeys = await KeysDto.createMaskedKeys(
				keys,
				user._id.toString()
			)

			return {
				user: { ...user_dto, keys: maskedKeys.keys, level: level.level },
			}
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'createUser',
				'errors.failed_create_user'
			)
		}
	}
}

module.exports = new UserService()
