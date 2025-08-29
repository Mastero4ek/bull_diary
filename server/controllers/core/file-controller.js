const { validationError } = require('@helpers/sanitization-helpers')
const fileService = require('@services/core/file-service')

class FileController {
	async removeCover(req, res, next) {
		try {
			validationError(req, next)

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
