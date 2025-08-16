const Router = require('express').Router
const authController = require('../../controllers/auth-controller')
const router = new Router()
const { checkSchema } = require('express-validator')
const ValidationSchema = require('../../validation/validation-schema')

router.get('/csrf-token', (req, res) => {
	res.json({ csrfToken: req.csrfToken() })
})

router.post(
	'/sign-up',
	checkSchema(ValidationSchema.signUp),
	authController.signUp
)

router.post(
	'/sign-in',
	checkSchema(ValidationSchema.signIn),
	authController.signIn
)

router.get('/refresh', authController.refresh)

router.post(
	'/logout',
	checkSchema(ValidationSchema.logout),
	authController.logout
)

module.exports = router
