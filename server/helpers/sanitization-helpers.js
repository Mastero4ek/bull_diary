const validator = require('validator')
const xss = require('xss')

class HelpersSanitization {
	/**
	 * Санитизация строкового ввода
	 * @param {string} input - строка для санитизации
	 * @param {Object} options - опции санитизации
	 * @returns {string} - санитизированная строка
	 */
	sanitizeString(input, options = {}) {
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

		if (trim) {
			sanitized = sanitized.trim()
		}

		if (removeXSS) {
			sanitized = xss(sanitized, {
				whiteList: allowHtml ? {} : undefined,
				stripIgnoreTag: true,
				stripIgnoreTagBody: ['script'],
			})
		}

		if (escapeHtml && !allowHtml) {
			sanitized = validator.escape(sanitized)
		}

		if (maxLength && sanitized.length > maxLength) {
			sanitized = sanitized.substring(0, maxLength)
		}

		return sanitized
	}

	/**
	 * Санитизация email адреса
	 * @param {string} email - email для санитизации
	 * @returns {string} - санитизированный email или null если недействителен
	 */
	sanitizeEmail(email) {
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
	 * Санитизация URL
	 * @param {string} url - URL для санитизации
	 * @returns {string} - санитизированный URL или null если недействителен
	 */
	sanitizeUrl(url) {
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
	 * Рекурсивная санитизация объекта
	 * @param {Object} obj - объект для санитизации
	 * @param {Object} options - опции санитизации
	 * @returns {Object} - санитизированный объект
	 */
	sanitizeObject(obj, options = {}) {
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
	 * Санитизация тела запроса
	 * @param {Object} body - тело запроса для санитизации
	 * @returns {Object} - санитизированное тело запроса
	 */
	sanitizeRequestBody(body) {
		if (!body || typeof body !== 'object') {
			return body
		}

		const sanitized = {}

		for (const [key, value] of Object.entries(body)) {
			if (
				['password', 'confirm_password', 'token', 'refresh_token'].includes(key)
			) {
				sanitized[key] = value
				continue
			}

			if (typeof value === 'string') {
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
	 * Санитизация параметров запроса
	 * @param {Object} query - параметры запроса для санитизации
	 * @returns {Object} - санитизированные параметры запроса
	 */
	sanitizeQueryParams(query) {
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
	 * Проверка на подозрительные паттерны во вводе
	 * @param {string} input - ввод для проверки
	 * @returns {boolean} - true если найдены подозрительные паттерны
	 */
	hasSuspiciousPatterns(input) {
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
	 * Валидация и санитизация загружаемого файла
	 * @param {Object} file - объект файла для валидации
	 * @returns {Object|null} - санитизированная информация о файле или null если недействителен
	 */
	sanitizeFileUpload(file) {
		if (!file || typeof file !== 'object') {
			return null
		}

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

module.exports = new HelpersSanitization()
