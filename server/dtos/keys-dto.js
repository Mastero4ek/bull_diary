const EncryptionService = require('@services/system/encryption-service')

module.exports = class KeysDto {
	static async maskKey(key, userId = null) {
		if (!key) return ''

		try {
			const isEncrypted = await EncryptionService.isEncrypted(key, userId)

			let decryptedKey = key

			if (isEncrypted) {
				decryptedKey = await EncryptionService.decrypt(key, userId)
			}

			if (!decryptedKey) return ''

			const visible = decryptedKey.slice(0, 5)
			const maskedLength = Math.max(0, decryptedKey.length - 5)

			return visible + '*'.repeat(maskedLength)
		} catch (error) {
			const visible = key.slice(0, 5)
			const maskedLength = Math.max(0, key.length - 5)

			return visible + '*'.repeat(maskedLength)
		}
	}

	static async createMaskedKeys(keysModel, userId = null) {
		const maskedKeys = []

		for (const key of keysModel.keys) {
			const maskedApi = await KeysDto.maskKey(key.api, userId)
			const maskedSecret = await KeysDto.maskKey(key.secret, userId)

			maskedKeys.push({
				id: key.id,
				name: key.name,
				api: maskedApi,
				secret: maskedSecret,
				sync: key.sync || false,
			})
		}

		return { keys: maskedKeys }
	}

	static maskKeySync(key, userId = null) {
		if (!key) return ''

		const visible = key.slice(0, 5)
		const maskedLength = Math.max(0, key.length - 5)

		return visible + '*'.repeat(maskedLength)
	}

	static createMaskedKeysSync(keysModel, userId = null) {
		const maskedKeys = []

		for (const key of keysModel.keys) {
			const maskedApi = KeysDto.maskKeySync(key.api, userId)
			const maskedSecret = KeysDto.maskKeySync(key.secret, userId)

			maskedKeys.push({
				id: key.id,
				name: key.name,
				api: maskedApi,
				secret: maskedSecret,
				sync: key.sync || false,
			})
		}

		return { keys: maskedKeys }
	}
}
