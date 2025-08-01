const i18next = require('i18next')

class ApiError extends Error {
	constructor(status, message, errors = []) {
		super(message)

		this.name = 'ApiError'
		this.status = status
		this.errors = errors
	}

	static UnauthorizedError(message = 'UNAUTHORIZED', errors = []) {
		return new ApiError(401, message, errors)
	}

	static BadRequest(message, errors = []) {
		return new ApiError(400, message, errors)
	}

	static NotFound(message = 'NOT_FOUND', errors = []) {
		return new ApiError(404, message, errors)
	}

	static InternalError(message = 'Internal Server Error', errors = []) {
		return new ApiError(500, message, errors)
	}

	static Forbidden(message = 'FORBIDDEN', errors = []) {
		return new ApiError(403, message, errors)
	}

	static Conflict(message = 'CONFLICT', errors = []) {
		return new ApiError(409, message, errors)
	}

	static TooManyRequests(message = 'TOO_MANY_REQUESTS', errors = []) {
		return new ApiError(429, message, errors)
	}
}

function localizedError(key, language = 'en', options = {}) {
	return i18next.t(key, { lng: language, ...options })
}

module.exports = { ApiError, localizedError }
