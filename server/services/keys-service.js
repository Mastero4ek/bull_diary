const KeysModel = require('../models/keys-model')
const UserModel = require('../models/user-model')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')
const { handleDatabaseError } = require('../helpers/error-helpers')
const EncryptionService = require('./encryption-service')
const KeysDto = require('../dtos/keys-dto')

class KeysService {
	/**
	 * Находит зашифрованные ключи пользователя
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Объект с зашифрованными ключами
	 */
	async findKeys(userId, lng = 'en') {
		try {
			const keys = await KeysModel.findOne({ user: userId })

			if (!keys) {
				throw ApiError.BadRequest(i18next.t('errors.keys_not_found', { lng }))
			}

			return keys
		} catch (error) {
			handleDatabaseError(error, lng, 'findKeys', 'errors.keys_not_found')
		}
	}

	/**
	 * Находит расшифрованные ключи пользователя
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Объект с расшифрованными ключами
	 */
	async findDecryptedKeys(userId, lng = 'en') {
		try {
			const keys = await KeysModel.findOne({ user: userId })

			if (!keys) {
				throw ApiError.BadRequest(i18next.t('errors.keys_not_found', { lng }))
			}

			const decryptedKeys = {
				...keys.toObject(),
				keys: await EncryptionService.decryptKeys(keys.keys, userId),
			}

			return decryptedKeys
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'findDecryptedKeys',
				'errors.keys_not_found'
			)
		}
	}

	/**
	 * Обновляет ключи пользователя для конкретной биржи
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи
	 * @param {string} api - API ключ
	 * @param {string} secret - Секретный ключ
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Объект с замаскированными ключами
	 */
	async updateKeys(userId, exchange, api, secret, lng = 'en') {
		try {
			const keys = await KeysModel.findOne({ user: userId })

			if (!keys) {
				throw ApiError.BadRequest(i18next.t('errors.keys_not_found', { lng }))
			}

			const exchangeExists = keys.keys.some(key => key.name === exchange)

			if (!exchangeExists) {
				throw ApiError.BadRequest(
					i18next.t('errors.exchange_not_found_in_keys', { lng, exchange })
				)
			}

			const updatedKeys = []

			for (const key of keys.keys) {
				if (key.name === exchange) {
					const currentApi = key.api
						? await EncryptionService.decrypt(key.api, userId)
						: ''
					const currentSecret = key.secret
						? await EncryptionService.decrypt(key.secret, userId)
						: ''

					updatedKeys.push({
						...key,
						api:
							api !== currentApi
								? await EncryptionService.encrypt(api, userId)
								: key.api,
						secret:
							secret !== currentSecret
								? await EncryptionService.encrypt(secret, userId)
								: key.secret,
					})
				} else {
					updatedKeys.push(key)
				}
			}

			keys.keys = updatedKeys

			await keys.save()

			return await KeysDto.createMaskedKeys(keys, userId)
		} catch (error) {
			handleDatabaseError(error, lng, 'updateKeys', 'errors.keys_update_failed')
		}
	}

	/**
	 * Удаляет ключи пользователя по email
	 * @param {string} email - Email пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Объект с сообщением об успехе
	 */
	async removeKeys(email, lng = 'en') {
		try {
			const user = await UserModel.findOne({ email })

			if (!user) {
				throw ApiError.BadRequest(i18next.t('errors.user_not_found', { lng }))
			}

			const keys = await KeysModel.findOneAndDelete({ user: user._id })

			return {
				message: keys
					? i18next.t('success.keys_deleted', { lng })
					: i18next.t('success.keys_already_deleted', { lng }),
			}
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'removeKeys',
				'errors.keys_deletion_failed'
			)
		}
	}
}

module.exports = new KeysService()
