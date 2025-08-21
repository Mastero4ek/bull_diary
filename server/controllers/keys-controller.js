const keysService = require('../services/keys-service')
const { validationError } = require('../helpers/validation-helpers')

class KeysController {
	async updateKeys(req, res, next) {
		try {
			validationError(req, next)

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
