const { ApiError } = require('../exceptions/api-error')
const { logError } = require('../config/logger')
const { v4: uuidv4 } = require('uuid')

/**
 * Middleware для обработки ошибок
 * Логирует ошибки и возвращает соответствующие HTTP ответы
 */
const errorMiddleware = (err, req, res, next) => {
	const requestId = uuidv4()

	const logData = {
		requestId,
		path: req.path,
		method: req.method,
		userId: req.user?.id || 'anonymous',
		ip: req.ip || req.connection.remoteAddress,
	}

	if (process.env.NODE_ENV === 'dev') {
		logData.body = req.body
		logData.query = req.query
	}

	logError(err, logData)

	if (err.status === 429) {
		return res.status(429).json({
			message:
				err.message ||
				'Too many requests from this IP, please try again after 15 minutes.',
			errors: null,
			code: 429,
			requestId,
		})
	}

	if (err instanceof ApiError) {
		return res.status(err.status).json({
			message: err.message,
			errors: err.errors,
			code: err.status,
			requestId,
		})
	}

	if (err.name === 'ValidationError') {
		return res.status(400).json({
			message: 'Validation Error',
			errors: Object.values(err.errors).map(e => e.message),
			code: 400,
			requestId,
		})
	}

	if (err.name === 'MongoError' || err.name === 'MongoServerError') {
		return res.status(500).json({
			message: 'Database Error',
			code: 500,
			requestId,
		})
	}

	if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
		return res.status(401).json({
			message: 'Authentication Error',
			code: 401,
			requestId,
		})
	}

	return res.status(500).json({
		message: 'Internal Server Error',
		code: 500,
		requestId,
	})
}

module.exports = errorMiddleware
