const CryptoJS = require('crypto-js')

class EncryptionService {
	constructor() {
		// get secret key from environment variables
		this.secretKey = process.env.ENCRYPTION_SECRET_KEY

		if (!this.secretKey) {
			throw new Error(
				'ENCRYPTION_SECRET_KEY is not defined in environment variables'
			)
		}
	}

	/**
	 * encrypt string
	 * @param {string} text - text to encrypt
	 * @returns {string} - encrypted text in base64 format
	 */
	encrypt(text) {
		if (!text) return text

		try {
			const encrypted = CryptoJS.AES.encrypt(text, this.secretKey).toString()

			return encrypted
		} catch (error) {
			throw new Error(`Encryption failed: ${error.message}`)
		}
	}

	/**
	 * decrypt string
	 * @param {string} encryptedText - encrypted text
	 * @returns {string} - decrypted text
	 */
	decrypt(encryptedText) {
		if (!encryptedText) return encryptedText

		try {
			const decrypted = CryptoJS.AES.decrypt(encryptedText, this.secretKey)

			return decrypted.toString(CryptoJS.enc.Utf8)
		} catch (error) {
			throw new Error(`Decryption failed: ${error.message}`)
		}
	}

	/**
	 * encrypt object with keys
	 * @param {Object} keys - object with keys
	 * @returns {Object} - object with encrypted keys
	 */
	encryptKeys(keys) {
		if (!keys || !Array.isArray(keys)) return keys

		return keys.map(key => ({
			...key,
			api: this.encrypt(key.api),
			secret: this.encrypt(key.secret),
		}))
	}

	/**
	 * decrypt object with keys
	 * @param {Object} keys - object with encrypted keys
	 * @returns {Object} - object with decrypted keys
	 */
	decryptKeys(keys) {
		if (!keys || !Array.isArray(keys)) return keys

		return keys.map(key => ({
			...key,
			api: this.decrypt(key.api),
			secret: this.decrypt(key.secret),
		}))
	}

	/**
	 * check if text is encrypted
	 * @param {string} text - text to check
	 * @returns {boolean} - true if text is encrypted
	 */
	isEncrypted(text) {
		if (!text) return false

		try {
			// try to decrypt - if it's successful, then it was encrypted
			const decrypted = CryptoJS.AES.decrypt(text, this.secretKey)
			const result = decrypted.toString(CryptoJS.enc.Utf8)

			return result.length > 0
		} catch (error) {
			return false
		}
	}
}

module.exports = new EncryptionService()
