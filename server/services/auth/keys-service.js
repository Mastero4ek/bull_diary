const { ApiError } = require('@exceptions/api-error')
const { logError, logInfo } = require('@configs/logger-config')
const KeysModel = require('@models/auth/keys-model')
const KeysDto = require('@dtos/keys-dto')
const EncryptionService = require('@services/system/encryption-service')
const UserModel = require('@models/core/user-model')
const SyncExecutor = require('@services/core/sync-executor')
const i18next = require('i18next')
const { handleDatabaseError } = require('@helpers/error-helpers')

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
				throw ApiError.BadRequest(i18next.t('error.keys.not_found', { lng }))
			}

			return keys
		} catch (error) {
			handleDatabaseError(error, lng, 'findKeys', 'Can not find keys')
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
				throw ApiError.BadRequest(i18next.t('error.keys.not_found', { lng }))
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
				'Can not find decrypted keys'
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
				throw ApiError.BadRequest(i18next.t('error.keys.not_found', { lng }))
			}

			const exchangeExists = keys.keys.some(key => key.name === exchange)

			if (!exchangeExists) {
				throw ApiError.BadRequest(
					i18next.t('error.api.exchange_not_found', { lng, exchange })
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
						sync: false,
					})
				} else {
					updatedKeys.push(key)
				}
			}

			keys.keys = updatedKeys

			await keys.save()

			try {
				const currentKey = updatedKeys.find(key => key.name === exchange)
				if (currentKey && currentKey.api && currentKey.secret) {
					const decryptedApi = await EncryptionService.decrypt(
						currentKey.api,
						userId
					)
					const decryptedSecret = await EncryptionService.decrypt(
						currentKey.secret,
						userId
					)

					if (decryptedApi !== api || decryptedSecret !== secret) {
						const syncKeys = {
							api: decryptedApi,
							secret: decryptedSecret,
						}

						await SyncExecutor.scheduleSync(userId, exchange, syncKeys, lng)
					}
				}
			} catch (syncError) {
				logError(
					`Error scheduling auto sync for user ${userId}, exchange ${exchange}:`,
					syncError
				)
			}

			return await KeysDto.createMaskedKeys(keys, userId)
		} catch (error) {
			handleDatabaseError(error, lng, 'updateKeys', 'Failed to update keys')
		}
	}

	/**
	 * Обновляет статус синхронизации для конкретной биржи
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи
	 * @param {boolean} syncStatus - Статус синхронизации
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Объект с замаскированными ключами
	 */
	async updateSyncStatus(userId, exchange, syncStatus, lng = 'en') {
		try {
			const keys = await KeysModel.findOne({ user: userId })

			if (!keys) {
				throw ApiError.BadRequest(i18next.t('error.keys.not_found', { lng }))
			}

			const exchangeExists = keys.keys.some(key => key.name === exchange)

			if (!exchangeExists) {
				throw ApiError.BadRequest(
					i18next.t('error.api.exchange_not_found', { lng, exchange })
				)
			}

			const updatedKeys = keys.keys.map(key => {
				if (key.name === exchange) {
					return {
						...key,
						sync: syncStatus,
					}
				}
				return key
			})

			keys.keys = updatedKeys
			await keys.save()

			return await KeysDto.createMaskedKeys(keys, userId)
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'updateSyncStatus',
				'Failed to update keys'
			)
		}
	}

	/**
	 * Очищает значения ключей для конкретной биржи (при отмене синхронизации)
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @returns {Promise<Object>} - Объект с замаскированными ключами
	 */
	async clearKeysForExchange(userId, exchange, lng = 'en') {
		try {
			const keys = await KeysModel.findOne({ user: userId })

			if (!keys) {
				throw ApiError.BadRequest(i18next.t('error.keys.not_found', { lng }))
			}

			const exchangeExists = keys.keys.some(key => key.name === exchange)

			if (!exchangeExists) {
				throw ApiError.BadRequest(
					i18next.t('error.api.exchange_not_found', { lng, exchange })
				)
			}

			const updatedKeys = keys.keys.map(key => {
				if (key.name === exchange) {
					return {
						...key,
						api: '',
						secret: '',
						sync: false,
					}
				}
				return key
			})

			keys.keys = updatedKeys
			await keys.save()

			return await KeysDto.createMaskedKeys(keys, userId)
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'clearKeysForExchange',
				'Failed to clear keys'
			)
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
				throw ApiError.BadRequest(i18next.t('error.user.not_found', { lng }))
			}

			const keys = await KeysModel.findOneAndDelete({ user: user._id })

			return {
				message: keys
					? i18next.t('success.keys.deleted', { lng })
					: i18next.t('error.keys_not_found', { lng }),
			}
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'removeKeys',
				'Failed to remove keys'
			)
		}
	}
}

module.exports = new KeysService()
