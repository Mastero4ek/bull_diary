const CryptoJS = require('crypto-js')
const { logError } = require('../config/logger')

class EncryptionService {
	constructor() {
		this.masterKey = null
		this.provider = process.env.SECRETS_PROVIDER
		this.secretId = process.env.SECRET_ID
	}

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

	async initializeVault() {
		try {
			const VaultSecretsService = require('./secrets/vault-secrets-service')
			const secret = await VaultSecretsService.getSecret(this.secretId)

			this.masterKey = secret.key
		} catch (error) {
			logError('Failed to get secret from Vault, falling back to env', {
				context: 'EncryptionService',
			})

			await this.initializeEnv()
		}
	}

	async initializeEnv() {
		this.masterKey = process.env.ENCRYPTION_SECRET_KEY
	}

	/**
	 * Generate unique encryption key for user
	 * @param {string} userId - user ID
	 * @returns {string} - unique key for user
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
	 * Encrypt string with user key
	 * @param {string} text - text to encrypt
	 * @param {string} userId - user ID
	 * @returns {string} - encrypted text
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
	 * Decrypt string with user key
	 * @param {string} encryptedText - encrypted text
	 * @param {string} userId - user ID
	 * @returns {string} - decrypted text
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
	 * Encrypt object with keys for specific user
	 * @param {Object} keys - object with keys
	 * @param {string} userId - user ID
	 * @returns {Object} - object with encrypted keys
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
	 * Decrypt object with keys for specific user
	 * @param {Object} keys - object with encrypted keys
	 * @param {string} userId - user ID
	 * @returns {Object} - object with decrypted keys
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
	 * Check if text is encrypted
	 * @param {string} text - text to check
	 * @param {string} userId - user ID
	 * @returns {boolean} - true if text is encrypted
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

	async ensureInitialized() {
		if (!this.masterKey) {
			await this.initialize()
		}
	}

	/**
	 * Get information about the current provider
	 * @returns {Object} - information about the provider
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
