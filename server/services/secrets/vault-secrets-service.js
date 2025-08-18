const vault = require('node-vault')
const { logError } = require('../../config/logger')

class VaultSecretsService {
	constructor() {
		this.client = vault({
			apiVersion: 'v1',
			endpoint: process.env.VAULT_ENDPOINT,
			token: process.env.VAULT_TOKEN,
		})
	}

	/**
	 * Get secret from Vault
	 * @param {string} secretPath - path to secret
	 * @returns {Promise<Object>} - object with secret
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
	 * Create new secret in Vault
	 * @param {string} secretPath - path to secret
	 * @param {Object} secretValue - secret value
	 * @returns {Promise<Object>} - result of creation
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
	 * Update existing secret
	 * @param {string} secretPath - path to secret
	 * @param {Object} secretValue - new secret value
	 * @returns {Promise<Object>} - result of update
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
	 * Delete secret
	 * @param {string} secretPath - path to secret
	 * @returns {Promise<Object>} - result of deletion
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
	 * Get list of secrets
	 * @param {string} path - path to search
	 * @returns {Promise<Array>} - list of secrets
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
