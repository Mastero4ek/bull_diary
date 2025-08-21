const vault = require('node-vault')
const { logError } = require('../config/logger')

class VaultSecretsService {
	constructor() {
		this.client = vault({
			apiVersion: 'v1',
			endpoint: process.env.VAULT_ENDPOINT,
			token: process.env.VAULT_TOKEN,
		})
	}

	/**
	 * Получает секрет из Vault
	 * @param {string} secretPath - путь к секрету
	 * @returns {Promise<Object>} - объект с секретом
	 */
	async getSecret(secretPath) {
		try {
			const result = await this.client.read(`secret/data/${secretPath}`)

			return result.data.data
		} catch (error) {
			logError('Error getting secret from Vault', {
				context: 'VaultSecretsService',
			})

			throw new Error('Error getting secret from Vault')
		}
	}

	/**
	 * Создает новый секрет в Vault
	 * @param {string} secretPath - путь к секрету
	 * @param {Object} secretValue - значение секрета
	 * @returns {Promise<Object>} - результат создания
	 */
	async createSecret(secretPath, secretValue) {
		try {
			const result = await this.client.write(`secret/data/${secretPath}`, {
				data: secretValue,
			})

			return result
		} catch (error) {
			logError('Error creating secret in Vault', {
				context: 'VaultSecretsService',
			})

			throw new Error('Error creating secret in Vault')
		}
	}

	/**
	 * Обновляет существующий секрет
	 * @param {string} secretPath - путь к секрету
	 * @param {Object} secretValue - новое значение секрета
	 * @returns {Promise<Object>} - результат обновления
	 */
	async updateSecret(secretPath, secretValue) {
		try {
			const result = await this.client.write(`secret/data/${secretPath}`, {
				data: secretValue,
			})
			return result
		} catch (error) {
			logError('Error updating secret in Vault', {
				context: 'VaultSecretsService',
			})

			throw new Error('Error updating secret in Vault')
		}
	}

	/**
	 * Удаляет секрет
	 * @param {string} secretPath - путь к секрету
	 * @returns {Promise<Object>} - результат удаления
	 */
	async deleteSecret(secretPath) {
		try {
			const result = await this.client.delete(`secret/data/${secretPath}`)

			return result
		} catch (error) {
			logError('Error deleting secret from Vault', {
				context: 'VaultSecretsService',
			})

			throw new Error('Error deleting secret from Vault')
		}
	}

	/**
	 * Получает список секретов
	 * @param {string} path - путь для поиска
	 * @returns {Promise<Array>} - список секретов
	 */
	async listSecrets(path = 'secret/metadata') {
		try {
			const result = await this.client.list(path)

			return result.data.keys || []
		} catch (error) {
			logError('Error listing secrets from Vault', {
				context: 'VaultSecretsService',
			})

			throw new Error('Error listing secrets from Vault')
		}
	}
}

module.exports = new VaultSecretsService()
