const Router = require('express').Router
const authController = require('../controllers/auth-controller')
const router = new Router()
const { checkSchema } = require('express-validator')
const ValidationSchema = require('../validation/validation-schema')

router.post(
	'/sign-up',
	checkSchema(ValidationSchema.registration),
	authController.signUp
)

router.post(
	'/sign-in',
	checkSchema(ValidationSchema.login),
	authController.signIn
)

router.get('/refresh', authController.refresh)

router.post('/logout', authController.logout)

module.exports = router
