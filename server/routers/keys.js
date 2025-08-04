const Router = require('express').Router
const keysController = require('../controllers/keys-controller')
const router = new Router()
const authMiddleware = require('../middlewares/auth-middleware')
const { checkSchema } = require('express-validator')
const ValidationSchema = require('../validation/validation-schema')

router.patch(
	'/api-keys',
	authMiddleware,
	checkSchema(ValidationSchema.updateKeys),
	keysController.updateKeys
)

module.exports = router
