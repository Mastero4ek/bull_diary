const SanitizationHelper = require('../helpers/sanitization')
const { logWarn } = require('../config/logger')

/**
 * Middleware for sanitizing request data
 */
const sanitizationMiddleware = (req, res, next) => {
	try {
		// Skip sanitization for OAuth callback endpoints
		const oauthPaths = [
			'/auth/google/callback',
			'/auth/github/callback',
			'/auth/vkontakte/callback',
		]

		if (oauthPaths.some(path => req.path.includes(path))) {
			return next()
		}

		// Sanitize request body
		if (req.body && Object.keys(req.body).length > 0) {
			req.body = SanitizationHelper.sanitizeRequestBody(req.body)
		}

		// Sanitize query parameters (but preserve OAuth codes)
		if (req.query && Object.keys(req.query).length > 0) {
			// Don't sanitize OAuth-related query parameters
			const oauthParams = ['code', 'state', 'scope', 'authuser', 'prompt']
			const sanitizedQuery = {}

			for (const [key, value] of Object.entries(req.query)) {
				if (oauthParams.includes(key)) {
					sanitizedQuery[key] = value // Preserve OAuth parameters
				} else {
					sanitizedQuery[key] = SanitizationHelper.sanitizeString(value, {
						maxLength: 200,
						trim: true,
					})
				}
			}

			req.query = sanitizedQuery
		}

		// Sanitize URL parameters
		if (req.params && Object.keys(req.params).length > 0) {
			for (const [key, value] of Object.entries(req.params)) {
				if (typeof value === 'string') {
					req.params[key] = SanitizationHelper.sanitizeString(value, {
						maxLength: 100,
						trim: true,
					})
				}
			}
		}

		// Check for suspicious patterns in all input
		const allInput = JSON.stringify({
			body: req.body,
			query: req.query,
			params: req.params,
		})

		if (SanitizationHelper.hasSuspiciousPatterns(allInput)) {
			logWarn('Suspicious input detected', {
				ip: req.ip,
				userAgent: req.get('User-Agent'),
				path: req.path,
				method: req.method,
				userId: req.user?.id,
			})

			// Don't block the request, but log it for monitoring
		}

		// Sanitize file uploads if present
		if (req.file) {
			const sanitizedFile = SanitizationHelper.sanitizeFileUpload(req.file)
			if (!sanitizedFile) {
				return res.status(400).json({
					message: 'Invalid file type detected',
					code: 400,
				})
			}
			req.file = sanitizedFile
		}

		// Sanitize multiple files if present
		if (req.files && Array.isArray(req.files)) {
			req.files = req.files.map(file => {
				const sanitizedFile = SanitizationHelper.sanitizeFileUpload(file)
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
