const validator = require('validator')
const xss = require('xss')

/**
 * Sanitization helper class for cleaning user input
 */
class SanitizationHelper {
	/**
	 * Sanitize string input
	 * @param {string} input - input string to sanitize
	 * @param {Object} options - sanitization options
	 * @returns {string} - sanitized string
	 */
	static sanitizeString(input, options = {}) {
		if (!input || typeof input !== 'string') {
			return input
		}

		const {
			escapeHtml = true,
			removeXSS = true,
			trim = true,
			maxLength = 1000,
			allowHtml = false,
		} = options

		let sanitized = input

		// Trim whitespace
		if (trim) {
			sanitized = sanitized.trim()
		}

		// Remove XSS attacks
		if (removeXSS) {
			sanitized = xss(sanitized, {
				whiteList: allowHtml ? {} : undefined,
				stripIgnoreTag: true,
				stripIgnoreTagBody: ['script'],
			})
		}

		// Escape HTML entities
		if (escapeHtml && !allowHtml) {
			sanitized = validator.escape(sanitized)
		}

		// Limit length
		if (maxLength && sanitized.length > maxLength) {
			sanitized = sanitized.substring(0, maxLength)
		}

		return sanitized
	}

	/**
	 * Sanitize email address
	 * @param {string} email - email to sanitize
	 * @returns {string} - sanitized email or null if invalid
	 */
	static sanitizeEmail(email) {
		if (!email || typeof email !== 'string') {
			return null
		}

		const sanitized = email.toLowerCase().trim()

		if (!validator.isEmail(sanitized)) {
			return null
		}

		return sanitized
	}

	/**
	 * Sanitize URL
	 * @param {string} url - URL to sanitize
	 * @returns {string} - sanitized URL or null if invalid
	 */
	static sanitizeUrl(url) {
		if (!url || typeof url !== 'string') {
			return null
		}

		const sanitized = url.trim()

		if (
			!validator.isURL(sanitized, {
				protocols: ['http', 'https'],
				require_protocol: true,
			})
		) {
			return null
		}

		return sanitized
	}

	/**
	 * Sanitize object recursively
	 * @param {Object} obj - object to sanitize
	 * @param {Object} options - sanitization options
	 * @returns {Object} - sanitized object
	 */
	static sanitizeObject(obj, options = {}) {
		if (!obj || typeof obj !== 'object') {
			return obj
		}

		const sanitized = Array.isArray(obj) ? [] : {}

		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === 'string') {
				sanitized[key] = this.sanitizeString(value, options)
			} else if (typeof value === 'object' && value !== null) {
				sanitized[key] = this.sanitizeObject(value, options)
			} else {
				sanitized[key] = value
			}
		}

		return sanitized
	}

	/**
	 * Sanitize request body
	 * @param {Object} body - request body to sanitize
	 * @returns {Object} - sanitized request body
	 */
	static sanitizeRequestBody(body) {
		if (!body || typeof body !== 'object') {
			return body
		}

		const sanitized = {}

		for (const [key, value] of Object.entries(body)) {
			// Skip sensitive fields that shouldn't be sanitized
			if (
				['password', 'confirm_password', 'token', 'refresh_token'].includes(key)
			) {
				sanitized[key] = value
				continue
			}

			if (typeof value === 'string') {
				// Apply different sanitization rules based on field type
				switch (key) {
					case 'email':
						sanitized[key] = this.sanitizeEmail(value)
						break
					case 'name':
					case 'last_name':
						sanitized[key] = this.sanitizeString(value, {
							maxLength: 50,
							trim: true,
						})
						break
					case 'description':
						sanitized[key] = this.sanitizeString(value, {
							maxLength: 1000,
							trim: true,
							allowHtml: false,
						})
						break
					default:
						sanitized[key] = this.sanitizeString(value, {
							maxLength: 500,
							trim: true,
						})
				}
			} else if (typeof value === 'object' && value !== null) {
				sanitized[key] = this.sanitizeObject(value)
			} else {
				sanitized[key] = value
			}
		}

		return sanitized
	}

	/**
	 * Sanitize query parameters
	 * @param {Object} query - query parameters to sanitize
	 * @returns {Object} - sanitized query parameters
	 */
	static sanitizeQueryParams(query) {
		if (!query || typeof query !== 'object') {
			return query
		}

		const sanitized = {}

		for (const [key, value] of Object.entries(query)) {
			if (typeof value === 'string') {
				sanitized[key] = this.sanitizeString(value, {
					maxLength: 200,
					trim: true,
				})
			} else if (Array.isArray(value)) {
				sanitized[key] = value.map(item =>
					typeof item === 'string'
						? this.sanitizeString(item, { maxLength: 200, trim: true })
						: item
				)
			} else {
				sanitized[key] = value
			}
		}

		return sanitized
	}

	/**
	 * Check for suspicious patterns in input
	 * @param {string} input - input to check
	 * @returns {boolean} - true if suspicious patterns found
	 */
	static hasSuspiciousPatterns(input) {
		if (!input || typeof input !== 'string') {
			return false
		}

		const suspiciousPatterns = [
			/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
			/javascript:/gi,
			/on\w+\s*=/gi,
			/expression\s*\(/gi,
			/url\s*\(/gi,
			/eval\s*\(/gi,
			/alert\s*\(/gi,
			/confirm\s*\(/gi,
			/prompt\s*\(/gi,
			/document\./gi,
			/window\./gi,
			/location\./gi,
			/\.\.\/\.\./g, // Path traversal
			/%2e%2e%2f/gi, // URL encoded path traversal
			/union\s+select/gi,
			/insert\s+into/gi,
			/delete\s+from/gi,
			/drop\s+table/gi,
			/exec\s*\(/gi,
			/system\s*\(/gi,
		]

		return suspiciousPatterns.some(pattern => pattern.test(input))
	}

	/**
	 * Validate and sanitize file upload
	 * @param {Object} file - file object to validate
	 * @returns {Object|null} - sanitized file info or null if invalid
	 */
	static sanitizeFileUpload(file) {
		if (!file || typeof file !== 'object') {
			return null
		}

		// Check for suspicious file extensions
		const suspiciousExtensions = [
			'.exe',
			'.bat',
			'.cmd',
			'.com',
			'.pif',
			'.scr',
			'.vbs',
			'.js',
			'.jar',
			'.php',
			'.asp',
			'.aspx',
			'.jsp',
			'.jspx',
			'.pl',
			'.py',
			'.rb',
			'.sh',
		]

		const fileName = file.originalname || file.name || ''
		const fileExtension = fileName
			.toLowerCase()
			.substring(fileName.lastIndexOf('.'))

		if (suspiciousExtensions.includes(fileExtension)) {
			return null
		}

		// Check for suspicious MIME types
		const suspiciousMimeTypes = [
			'application/x-executable',
			'application/x-msdownload',
			'application/x-msi',
			'application/x-msdos-program',
			'application/x-msdos-windows',
		]

		if (suspiciousMimeTypes.includes(file.mimetype)) {
			return null
		}

		// Sanitize filename
		const sanitizedFileName = this.sanitizeString(fileName, {
			maxLength: 255,
			trim: true,
			escapeHtml: false,
		})

		return {
			...file,
			originalname: sanitizedFileName,
			name: sanitizedFileName,
		}
	}
}

module.exports = SanitizationHelper
