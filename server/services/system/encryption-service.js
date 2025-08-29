const CryptoJS = require('crypto-js')

const { logError } = require('@configs/logger-config')

class EncryptionService {
	/**
	 * Конструктор сервиса шифрования
	 * Инициализирует провайдер секретов и ID секрета
	 */
	constructor() {
		this.masterKey = null
		this.provider = process.env.SECRETS_PROVIDER
		this.secretId = process.env.SECRET_ID
	}

	/**
	 * Инициализирует сервис шифрования
	 * Загружает мастер-ключ из выбранного провайдера
	 * @returns {Promise<void>}
	 */
	async initialize() {
		switch (this.provider) {
			case 'vault':
				await this.initializeVault()
				break

			case 'env':
			default:
				await this.initializeEnv()
				break
		}

		if (!this.masterKey) {
			logError('Master key not found in any provider', {
				context: 'EncryptionService',
			})

			throw new Error('Master key not found in any provider!')
		}
	}

	/**
	 * Инициализирует сервис с использованием HashiCorp Vault
	 * @returns {Promise<void>}
	 */
	async initializeVault() {
		try {
			const VaultService = require('./vault-service')
			const secret = await VaultService.getSecret(this.secretId)

			this.masterKey = secret.key
		} catch (error) {
			logError('Failed to get secret from Vault, falling back to env', {
				context: 'EncryptionService',
			})

			await this.initializeEnv()
		}
	}

	/**
	 * Инициализирует сервис с использованием переменных окружения
	 * @returns {Promise<void>}
	 */
	async initializeEnv() {
		this.masterKey = process.env.ENCRYPTION_SECRET_KEY
	}

	/**
	 * Генерирует уникальный ключ шифрования для пользователя
	 * @param {string} userId - ID пользователя
	 * @returns {string} - уникальный ключ для пользователя
	 */
	generateUserKey(userId) {
		if (!userId) {
			logError('User ID is required for key generation', {
				context: 'EncryptionService',
			})

			throw new Error('Failed to get secret from Vault, falling back to env')
		}

		if (!this.masterKey) {
			logError('Master key not initialized. Call initialize() first.', {
				context: 'EncryptionService',
			})

			throw new Error('Master key not initialized. Call initialize() first.')
		}

		return CryptoJS.HmacSHA256(userId, this.masterKey).toString()
	}

	/**
	 * Шифрует строку с ключом пользователя
	 * @param {string} text - текст для шифрования
	 * @param {string} userId - ID пользователя
	 * @returns {string} - зашифрованный текст
	 */
	async encrypt(text, userId = null) {
		if (!text) return text

		await this.ensureInitialized()

		try {
			const key = userId ? this.generateUserKey(userId) : this.masterKey
			const encrypted = CryptoJS.AES.encrypt(text, key).toString()

			return encrypted
		} catch (error) {
			logError(`Encryption failed: ${error.message}`, {
				context: 'EncryptionService',
			})

			throw new Error(`Encryption failed: ${error.message}`)
		}
	}

	/**
	 * Расшифровывает строку с ключом пользователя
	 * @param {string} encryptedText - зашифрованный текст
	 * @param {string} userId - ID пользователя
	 * @returns {string} - расшифрованный текст
	 */
	async decrypt(encryptedText, userId = null) {
		if (!encryptedText) return encryptedText

		await this.ensureInitialized()

		try {
			const key = userId ? this.generateUserKey(userId) : this.masterKey
			const decrypted = CryptoJS.AES.decrypt(encryptedText, key)

			return decrypted.toString(CryptoJS.enc.Utf8)
		} catch (error) {
			logError(`Decryption failed: ${error.message}`, {
				context: 'EncryptionService',
			})

			throw new Error(`Decryption failed: ${error.message}`)
		}
	}

	/**
	 * Шифрует объект с ключами для конкретного пользователя
	 * @param {Object} keys - объект с ключами
	 * @param {string} userId - ID пользователя
	 * @returns {Object} - объект с зашифрованными ключами
	 */
	async encryptKeys(keys, userId = null) {
		if (!keys || !Array.isArray(keys)) return keys

		const encryptedKeys = []

		for (const key of keys) {
			encryptedKeys.push({
				...key,
				api: await this.encrypt(key.api, userId),
				secret: await this.encrypt(key.secret, userId),
			})
		}

		return encryptedKeys
	}

	/**
	 * Расшифровывает объект с ключами для конкретного пользователя
	 * @param {Object} keys - объект с зашифрованными ключами
	 * @param {string} userId - ID пользователя
	 * @returns {Object} - объект с расшифрованными ключами
	 */
	async decryptKeys(keys, userId = null) {
		if (!keys || !Array.isArray(keys)) return keys

		const decryptedKeys = []

		for (const key of keys) {
			decryptedKeys.push({
				...key,
				api: await this.decrypt(key.api, userId),
				secret: await this.decrypt(key.secret, userId),
			})
		}

		return decryptedKeys
	}

	/**
	 * Проверяет, зашифрован ли текст
	 * @param {string} text - текст для проверки
	 * @param {string} userId - ID пользователя
	 * @returns {boolean} - true, если текст зашифрован
	 */
	async isEncrypted(text, userId = null) {
		if (!text) return false

		await this.ensureInitialized()

		try {
			const key = userId ? this.generateUserKey(userId) : this.masterKey
			const decrypted = CryptoJS.AES.decrypt(text, key)
			const result = decrypted.toString(CryptoJS.enc.Utf8)

			return result.length > 0
		} catch (error) {
			logError(`Error checking if text is encrypted: ${error.message}`, {
				context: 'EncryptionService',
			})

			return false
		}
	}

	/**
	 * Убеждается, что сервис инициализирован
	 * @returns {Promise<void>}
	 */
	async ensureInitialized() {
		if (!this.masterKey) {
			await this.initialize()
		}
	}

	/**
	 * Получает информацию о текущем провайдере
	 * @returns {Object} - информация о провайдере
	 */
	getProviderInfo() {
		return {
			provider: this.provider,
			secretId: this.secretId,
			initialized: !!this.masterKey,
		}
	}
}

module.exports = new EncryptionService()
