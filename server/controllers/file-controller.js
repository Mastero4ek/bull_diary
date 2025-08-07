const fileService = require('../services/file-service')
const { validationResult } = require('express-validator')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')

class FileController {
	async removeCover(req, res, next) {
		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						i18next.t('errors.validation', { lng: req.lng }),
						errors.array()
					)
				)
			}

			const file_name = req.params.filename
			const user = req.user
			const targetUserId = req.params.userId
			let userId

			if (targetUserId) {
				userId = targetUserId
			} else {
				userId = user.id
			}

			const file = await fileService.removeCover(file_name, userId, req.lng)

			return res.json(file)
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new FileController()
