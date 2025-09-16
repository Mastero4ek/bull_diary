const AuthValidation = require('@validations/auth-validation')
const Router = require('express').Router
const { checkSchema } = require('express-validator')

const keysController = require('@controllers/auth/keys-controller')
const authMiddleware = require('@middlewares/auth-middleware')
const router = new Router()

router.patch(
	'/api-keys',
	authMiddleware,
	checkSchema(AuthValidation.updateKeys),
	keysController.updateKeys
)

module.exports = router
