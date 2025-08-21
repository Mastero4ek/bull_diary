const { ApiError } = require('../exceptions/api-error')
const { validationResult } = require('express-validator')

class HelpersValidation {
	/**
	 * Проверяет результаты валидации Express
	 * @param {Object} req - Объект запроса
	 * @param {Function} next - Функция next
	 * @returns {boolean|void} - true если валидация прошла успешно, иначе вызывает next с ошибкой
	 */
	validationError(req, next) {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			return next(ApiError.BadRequest('Validation error', errors.array()))
		}

		return true
	}
}

module.exports = new HelpersValidation()
