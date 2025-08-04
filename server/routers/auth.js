const Router = require('express').Router
const userController = require('../controllers/user-controller')
const router = new Router()
const { checkSchema } = require('express-validator')
const ValidationSchema = require('../validation/validation-schema')

router.post(
	'/sign-up',
	checkSchema(ValidationSchema.registration),
	userController.signUp
)

router.post(
	'/sign-in',
	checkSchema(ValidationSchema.login),
	userController.signIn
)

router.get('/refresh', userController.refresh)

router.post('/logout', userController.logout)

module.exports = router
