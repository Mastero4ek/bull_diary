const { logWarn } = require('@configs/logger-config')
const sanitizationHelper = require('@helpers/sanitization-helpers')

/**
 * Middleware для санитизации входящих данных
 * Очищает и валидирует тело запроса, параметры и файлы
 */
const sanitizationMiddleware = (req, res, next) => {
	try {
		const oauthPaths = [
			'/auth/google/callback',
			'/auth/github/callback',
			'/auth/vkontakte/callback',
		]

		if (oauthPaths.some(path => req.path.includes(path))) {
			return next()
		}

		if (req.body && Object.keys(req.body).length > 0) {
			req.body = sanitizationHelper.sanitizeRequestBody(req.body)
		}

		if (req.query && Object.keys(req.query).length > 0) {
			const oauthParams = ['code', 'state', 'scope', 'authuser', 'prompt']
			const sanitizedQuery = {}

			for (const [key, value] of Object.entries(req.query)) {
				if (oauthParams.includes(key)) {
					sanitizedQuery[key] = value
				} else {
					sanitizedQuery[key] = sanitizationHelper.sanitizeString(value, {
						maxLength: 200,
						trim: true,
					})
				}
			}

			req.query = sanitizedQuery
		}

		if (req.params && Object.keys(req.params).length > 0) {
			for (const [key, value] of Object.entries(req.params)) {
				if (typeof value === 'string') {
					req.params[key] = sanitizationHelper.sanitizeString(value, {
						maxLength: 100,
						trim: true,
					})
				}
			}
		}

		const allInput = JSON.stringify({
			body: req.body,
			query: req.query,
			params: req.params,
		})

		if (sanitizationHelper.hasSuspiciousPatterns(allInput)) {
			logWarn('Suspicious input detected', {
				ip: req.ip,
				userAgent: req.get('User-Agent'),
				path: req.path,
				method: req.method,
				userId: req.user?.id,
			})
		}

		if (req.file) {
			const sanitizedFile = sanitizationHelper.sanitizeFileUpload(req.file)
			if (!sanitizedFile) {
				return res.status(400).json({
					message: 'Invalid file type detected',
					code: 400,
				})
			}
			req.file = sanitizedFile
		}

		if (req.files && Array.isArray(req.files)) {
			req.files = req.files.map(file => {
				const sanitizedFile = sanitizationHelper.sanitizeFileUpload(file)
				if (!sanitizedFile) {
					throw new Error('Invalid file type detected')
				}
				return sanitizedFile
			})
		}

		next()
	} catch (error) {
		logWarn('Sanitization error', {
			error: error.message,
			ip: req.ip,
			path: req.path,
			method: req.method,
		})

		return res.status(400).json({
			message: 'Invalid input detected',
			code: 400,
		})
	}
}

module.exports = sanitizationMiddleware
