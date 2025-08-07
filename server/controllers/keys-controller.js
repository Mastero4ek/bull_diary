const keysService = require('../services/keys-service')
const { validationResult } = require('express-validator')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')

class KeysController {
	async updateKeys(req, res, next) {
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

			const { exchange, api, secret } = req.body
			const user = req.user

			const keys = await keysService.updateKeys(
				user.id,
				exchange,
				api,
				secret,
				req.lng
			)

			return res.json(keys)
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new KeysController()
