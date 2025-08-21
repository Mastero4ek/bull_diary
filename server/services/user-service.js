const UserModel = require('../models/user-model')
const KeysModel = require('../models/keys-model')
const LevelModel = require('../models/level-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const tokenService = require('./token-service')
const mailService = require('./mail-service')
const UserDto = require('../dtos/user-dto')
const KeysDto = require('../dtos/keys-dto')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')
const path = require('path')
const moment = require('moment')
const {
	handleDatabaseError,
	handleTokenError,
} = require('../helpers/error-helpers')
const { logError, logInfo } = require('../config/logger')
const fileService = require('./file-service')

class UserService {
	/**
	 * Автоматически создает недостающие keys и level для пользователя
	 * @param {string} userId - ID пользователя
	 * @returns {Promise<Object>} - Объект с keys и level
	 */
	async ensureUserData(userId) {
		let keys = await KeysModel.findOne({ user: userId })
		let level = await LevelModel.findOne({ user: userId })

		if (!keys) {
			keys = await KeysModel.create({ user: userId })
			logInfo('Keys created automatically', { userId })
		}

		if (!level) {
			level = await LevelModel.create({
				user: userId,
				level: { name: 'hamster', value: 0 },
			})
			logInfo('Level created automatically', { userId })
		}

		return { keys, level }
	}

	/**
	 * Регистрирует нового пользователя
	 * @param {string} name - Имя пользователя
	 * @param {string} email - Email пользователя
	 * @param {string} password - Пароль пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {string} source - Источник регистрации (по умолчанию 'self')
	 * @returns {Promise<Object>} - Объект с токенами и данными пользователя
	 */
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

			handleDatabaseError(error, lng, 'signUp', 'errors.failed_create_user')
		}
	}

	/**
	 * Авторизует пользователя
	 * @param {string} email - Email пользователя
	 * @param {string} password - Пароль пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Объект с токенами и данными пользователя
	 */
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

			const { keys, level } = await this.ensureUserData(user._id)

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
			handleDatabaseError(error, lng, 'signIn', 'errors.failed_sign_in')
		}
	}

	/**
	 * Проверяет авторизацию пользователя из внешнего источника
	 * @param {string} email - Email пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Объект с токенами и данными пользователя
	 */
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

			const { keys, level } = await this.ensureUserData(user._id)

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
			handleDatabaseError(
				error,
				lng,
				'checkSourceAuth',
				'errors.failed_source_auth'
			)
		}
	}

	/**
	 * Выход пользователя из системы
	 * @param {string} refresh_token - Refresh токен для удаления
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Результат выхода
	 */
	async logout(refresh_token, lng = 'en') {
		try {
			return await tokenService.removeToken(refresh_token, lng)
		} catch (error) {
			handleTokenError(error, lng, 'logout', 'errors.failed_logout')
		}
	}

	/**
	 * Обновляет токены пользователя
	 * @param {string} refresh_token - Refresh токен для обновления
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Новые токены
	 */
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

			const { keys, level } = await this.ensureUserData(user._id)

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
			handleTokenError(error, lng, 'refresh', 'errors.failed_refresh')
		}
	}

	/**
	 * Активирует аккаунт пользователя по ссылке
	 * @param {string} activation_link - Ссылка активации
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Объект с токенами и данными пользователя
	 */
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

			const { keys, level } = await this.ensureUserData(user._id)

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
			handleDatabaseError(error, lng, 'activate', 'errors.failed_activate')
		}
	}

	/**
	 * Редактирует данные пользователя
	 * @param {string} userId - ID пользователя
	 * @param {string} name - Имя пользователя
	 * @param {string} last_name - Фамилия пользователя
	 * @param {string} email - Email пользователя
	 * @param {string} password - Новый пароль (опционально)
	 * @param {string} phone - Телефон пользователя
	 * @param {Object} cover - Файл обложки (опционально)
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Обновленные данные пользователя
	 */
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
			}

			if (password) {
				const salt = await bcrypt.genSalt(10)
				updateData.password = await bcrypt.hash(password, salt)
			}

			if (cover) {
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

			const user_dto = new UserDto(updatedUser)

			const result = { ...user_dto }

			if (keys) {
				const maskedKeys = await KeysDto.createMaskedKeys(keys, userId)
				result.keys = maskedKeys.keys
			} else {
				result.keys = null
			}

			if (level) {
				result.level = level.level
			} else {
				result.level = null
			}

			return {
				user: result,
			}
		} catch (error) {
			handleDatabaseError(error, lng, 'editUser', 'errors.failed_update_user')
		}
	}

	/**
	 * Удаляет обложку пользователя
	 * @param {string} userId - ID пользователя
	 * @param {string} filename - Имя файла для удаления
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Сообщение об успешном удалении
	 */
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

			await fileService.removeCover(filename, lng)

			user.cover = null
			await user.save()

			return {
				message: i18next.t('success.cover_removed', { lng }),
			}
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'removeCover',
				'errors.failed_remove_cover'
			)
		}
	}

	/**
	 * Полностью удаляет пользователя из системы
	 * @param {string} current_email - Текущий email пользователя
	 * @param {string} refresh_token - Refresh токен пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Сообщение об успешном удалении
	 */
	async removeUser(current_email, refresh_token, lng = 'en') {
		try {
			const user = await UserModel.findOne({ email: current_email })

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			try {
				await fileService.removeUserFiles(user._id, lng)
			} catch (fileError) {
				logError(fileError, {
					context: 'removeUser - file cleanup',
					userId: user._id,
				})
			}

			await UserModel.findByIdAndDelete(user._id)

			return {
				message: i18next.t('success.user_removed', { lng }),
			}
		} catch (error) {
			handleDatabaseError(error, lng, 'removeUser', 'errors.failed_remove_user')
		}
	}

	/**
	 * Активирует пользователя (убирает флаг inactive)
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Сообщение об успешной активации
	 */
	async activeUser(userId, lng = 'en') {
		try {
			const user = await UserModel.findByIdAndUpdate(
				userId,
				{ inactive: false, updated_at: new Date() },
				{ new: true }
			)

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			return {
				message: i18next.t('success.user_activated', { lng }),
			}
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'activeUser',
				'errors.failed_activate_user'
			)
		}
	}

	/**
	 * Деактивирует пользователя (устанавливает флаг inactive)
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Сообщение об успешной деактивации
	 */
	async inactiveUser(userId, lng = 'en') {
		try {
			const user = await UserModel.findByIdAndUpdate(
				userId,
				{ inactive: true, updated_at: new Date() },
				{ new: true }
			)

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			return {
				message: i18next.t('success.user_deactivated', { lng }),
			}
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'inactiveUser',
				'errors.failed_deactivate_user'
			)
		}
	}

	/**
	 * Получает данные пользователя
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Данные пользователя с ключами и уровнем
	 */
	async getUser(userId, lng = 'en') {
		try {
			const user = await UserModel.findById(userId)

			if (!user) {
				throw ApiError.NotFound(i18next.t('errors.user_not_found', { lng }))
			}

			const keys = await KeysModel.findOne({ user: userId })
			const level = await LevelModel.findOne({ user: userId })

			const user_dto = new UserDto(user)

			const result = { ...user_dto }

			if (keys) {
				const maskedKeys = await KeysDto.createMaskedKeys(keys, userId)
				result.keys = maskedKeys.keys
			} else {
				result.keys = null
			}

			if (level) {
				result.level = level.level
			} else {
				result.level = null
			}

			return result
		} catch (error) {
			handleDatabaseError(error, lng, 'getUser', 'errors.failed_get_user_data')
		}
	}

	/**
	 * Получает список пользователей с фильтрацией и пагинацией
	 * @param {Object} sort - Параметры сортировки
	 * @param {string} search - Поисковый запрос
	 * @param {number} page - Номер страницы (по умолчанию 1)
	 * @param {number} limit - Количество записей на странице (по умолчанию 5)
	 * @param {string} start_time - Начальное время фильтра
	 * @param {string} end_time - Конечное время фильтра
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Список пользователей с метаданными
	 */
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
			handleDatabaseError(error, lng, 'getUsers', 'errors.failed_get_users')
		}
	}

	/**
	 * Создает нового пользователя администратором
	 * @param {string} name - Имя пользователя
	 * @param {string} last_name - Фамилия пользователя
	 * @param {string} email - Email пользователя
	 * @param {string} password - Пароль пользователя
	 * @param {string} phone - Телефон пользователя
	 * @param {string} role - Роль пользователя
	 * @param {Object} cover - Файл обложки (опционально)
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Созданный пользователь
	 */
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

			if (cover) {
				await fileService.uploadCover(cover, user._id, lng)

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
			handleDatabaseError(error, lng, 'createUser', 'errors.failed_create_user')
		}
	}

	/**
	 * Проверяет активность пользователей
	 * @returns {Promise<Array>} - Список неактивных пользователей
	 */
	async checkUserActivity() {
		try {
			const inactiveThreshold = moment().subtract(170, 'days').toDate()

			const inactiveUsers = await UserModel.find({
				updated_at: { $lt: inactiveThreshold },
				inactive: { $ne: true },
			}).select('_id name email updated_at created_at')

			if (inactiveUsers.length > 0) {
				logInfo('Found inactive users (170+ days)', {
					count: inactiveUsers.length,
					users: inactiveUsers.map(user => ({
						id: user._id,
						name: user.name,
						email: user.email,
						lastActivity: user.updated_at,
						daysInactive: moment().diff(moment(user.updated_at), 'days'),
					})),
				})
			} else {
				logInfo('No inactive users found (170+ days)', { count: 0 })
			}

			return inactiveUsers
		} catch (error) {
			logError(error, { context: 'checkUserActivity' })
			throw error
		}
	}

	/**
	 * Помечает неактивных пользователей как неактивных
	 * @returns {Promise<number>} - Количество помеченных пользователей
	 */
	async markInactiveUsers() {
		try {
			const inactiveThreshold = moment().subtract(180, 'days').toDate()

			const result = await UserModel.updateMany(
				{
					updated_at: { $lt: inactiveThreshold },
					inactive: { $ne: true },
				},
				{
					$set: { inactive: true },
				}
			)

			if (result.modifiedCount > 0) {
				logInfo('Marked users as inactive (180+ days)', {
					modifiedCount: result.modifiedCount,
					threshold: inactiveThreshold,
				})

				const markedUsers = await UserModel.find({
					updated_at: { $lt: inactiveThreshold },
					inactive: true,
				}).select('_id name email updated_at created_at')

				logInfo('Users marked as inactive', {
					users: markedUsers.map(user => ({
						id: user._id,
						name: user.name,
						email: user.email,
						lastActivity: user.updated_at,
						daysInactive: moment().diff(moment(user.updated_at), 'days'),
					})),
				})
			} else {
				logInfo('No users marked as inactive (180+ days)', { modifiedCount: 0 })
			}

			return result.modifiedCount
		} catch (error) {
			logError(error, { context: 'markInactiveUsers' })
			throw error
		}
	}
}

module.exports = new UserService()
