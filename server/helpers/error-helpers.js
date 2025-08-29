const i18next = require('i18next')

const { logError } = require('@configs/logger-config')
const { ApiError } = require('@exceptions/api-error')

class HelpersError {
	/**
	 * Обрабатывает ошибки API бирж и возвращает соответствующие ApiError
	 * @param {Error} error - Ошибка для обработки
	 * @param {string} language - Язык для сообщений об ошибках
	 * @param {string} methodName - Название метода для логирования
	 * @param {string} errorType - Тип ошибки для перевода
	 * @param {string} exchange - Название биржи (Bybit, OKX, MEXC, etc.)
	 */
	handleApiError(error, language, methodName, errorType, exchange) {
		logError(error, { methodName, exchange, errorType, language })

		if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
			throw ApiError.BadRequest(
				i18next.t('error.api.connection_error', {
					lng: language,
					exchange,
				})
			)
		}

		if (error.message && error.message.includes('timeout')) {
			throw ApiError.BadRequest(
				i18next.t('error.api.timeout_error', {
					lng: language,
					exchange,
				})
			)
		}

		if (error instanceof ApiError) {
			throw error
		}

		throw ApiError.BadRequest(
			i18next.t(errorType, {
				lng: language,
				exchange,
			})
		)
	}

	/**
	 * Обрабатывает ошибки файловых операций и возвращает соответствующие ApiError
	 * @param {Error} error - Ошибка для обработки
	 * @param {string} language - Язык для сообщений об ошибках
	 * @param {string} methodName - Название метода для логирования
	 * @param {string} defaultErrorType - Тип ошибки по умолчанию для перевода
	 */
	handleFileError(error, language, methodName, defaultErrorType) {
		logError(error, { methodName, errorType: defaultErrorType, language })

		if (error instanceof ApiError) {
			throw error
		}

		if (error.code === 'ENOSPC') {
			throw ApiError.BadRequest(
				i18next.t('error.file.disk_space_full', { lng: language })
			)
		}

		if (error.code === 'EACCES') {
			throw ApiError.BadRequest(
				i18next.t('error.file.permission_denied', { lng: language })
			)
		}

		if (error.code === 'ENOENT') {
			throw ApiError.BadRequest(
				i18next.t('error.file.path_not_found', { lng: language })
			)
		}

		if (error.code === 'EBUSY') {
			throw ApiError.BadRequest(i18next.t('error.file.busy', { lng: language }))
		}

		throw ApiError.InternalError(i18next.t(defaultErrorType, { lng: language }))
	}

	/**
	 * Обрабатывает ошибки операций с базой данных и возвращает соответствующие ApiError
	 * @param {Error} error - Ошибка для обработки
	 * @param {string} language - Язык для сообщений об ошибках
	 * @param {string} methodName - Название метода для логирования
	 * @param {string} defaultErrorType - Тип ошибки по умолчанию для перевода
	 */
	handleDatabaseError(error, language, methodName, defaultErrorType) {
		logError(error, { methodName, errorType: defaultErrorType, language })

		if (error instanceof ApiError) {
			throw error
		}

		if (error.name === 'ValidationError') {
			throw ApiError.BadRequest(
				i18next.t('error.validation.root', { lng: language })
			)
		}

		if (error.name === 'CastError') {
			throw ApiError.BadRequest(
				i18next.t('error.validation.id_format', { lng: language })
			)
		}

		if (error.code === 11000) {
			throw ApiError.BadRequest(
				i18next.t('error.database.duplicate_key', { lng: language })
			)
		}

		if (
			error.name === 'MongoNetworkError' ||
			error.name === 'MongoTimeoutError'
		) {
			throw ApiError.InternalError(
				i18next.t('error.database.connection_error', { lng: language })
			)
		}

		throw ApiError.InternalError(i18next.t(defaultErrorType, { lng: language }))
	}

	/**
	 * Обрабатывает ошибки почтовых операций и возвращает соответствующие ApiError
	 * @param {Error} error - Ошибка для обработки
	 * @param {string} language - Язык для сообщений об ошибках
	 * @param {string} methodName - Название метода для логирования
	 * @param {string} defaultErrorType - Тип ошибки по умолчанию для перевода
	 */
	handleMailError(error, language, methodName, defaultErrorType) {
		logError(error, { methodName, errorType: defaultErrorType, language })

		if (error instanceof ApiError) {
			throw error
		}

		if (error.code === 'EAUTH') {
			throw ApiError.InternalError(
				i18next.t('error.smtp.auth_error', { lng: language })
			)
		}

		if (error.code === 'ECONNECTION') {
			throw ApiError.InternalError(
				i18next.t('error.smtp.connection_error', { lng: language })
			)
		}

		if (error.code === 'ETIMEDOUT') {
			throw ApiError.InternalError(
				i18next.t('error.smtp.timeout_error', { lng: language })
			)
		}

		if (error.code === 'ENOTFOUND') {
			throw ApiError.InternalError(
				i18next.t('error.smtp.host_not_found', { lng: language })
			)
		}

		if (error.code === 'EENVELOPE') {
			throw ApiError.InternalError(
				i18next.t('error.smtp.envelope_error', { lng: language })
			)
		}

		if (error.code === 'ENOENT') {
			throw ApiError.InternalError(
				i18next.t('error.smtp.template_not_found', { lng: language })
			)
		}

		throw ApiError.InternalError(i18next.t(defaultErrorType, { lng: language }))
	}

	/**
	 * Обрабатывает ошибки операций с токенами и возвращает соответствующие ApiError
	 * @param {Error} error - Ошибка для обработки
	 * @param {string} language - Язык для сообщений об ошибках
	 * @param {string} methodName - Название метода для логирования
	 * @param {string} defaultErrorType - Тип ошибки по умолчанию для перевода
	 */
	handleTokenError(error, language, methodName, defaultErrorType) {
		logError(error, { methodName, errorType: defaultErrorType, language })

		if (error instanceof ApiError) {
			throw error
		}

		if (error.name === 'JsonWebTokenError') {
			throw ApiError.BadRequest(
				i18next.t('error.auth.token_format', { lng: language })
			)
		}

		if (error.name === 'TokenExpiredError') {
			throw ApiError.BadRequest(
				i18next.t('error.auth.token_expired', { lng: language })
			)
		}

		if (error.name === 'NotBeforeError') {
			throw ApiError.BadRequest(
				i18next.t('error.auth.token_not_active', { lng: language })
			)
		}

		if (error.name === 'ValidationError') {
			throw ApiError.BadRequest(
				i18next.t('error.auth.token_validation_error', { lng: language })
			)
		}

		if (error.name === 'CastError') {
			throw ApiError.BadRequest(
				i18next.t('error.auth.token_id_format', { lng: language })
			)
		}

		if (
			error.name === 'MongoNetworkError' ||
			error.name === 'MongoTimeoutError'
		) {
			throw ApiError.InternalError(
				i18next.t('error.database.connection_error', { lng: language })
			)
		}

		throw ApiError.InternalError(i18next.t(defaultErrorType, { lng: language }))
	}
}

module.exports = new HelpersError()
