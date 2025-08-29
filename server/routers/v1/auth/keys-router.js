const Router = require('express').Router
const { checkSchema } = require('express-validator')

const keysController = require('@controllers/auth/keys-controller')
const router = new Router()
const authMiddleware = require('@middlewares/auth-middleware')
const ValidationSchema = require('@validation/schema')

router.patch(
	'/api-keys',
	authMiddleware,
	checkSchema(ValidationSchema.updateKeys),
	keysController.updateKeys
)

module.exports = router
