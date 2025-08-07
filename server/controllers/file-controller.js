const fileService = require('../services/file-service')
const Helpers = require('../helpers/helpers')

class FileController {
	async removeCover(req, res, next) {
		try {
			Helpers.validationError(req, next)

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
