const AuthValidation = require('@validations/auth-validation')
const csrf = require('csurf')
const Router = require('express').Router
const { checkSchema } = require('express-validator')

const authController = require('@controllers/auth/auth-controller')

const router = new Router()

router.post(
	'/sign-up',
	checkSchema(AuthValidation.signUp),
	authController.signUp
)

router.post(
	'/sign-in',
	checkSchema(AuthValidation.signIn),
	authController.signIn
)

router.post(
	'/logout',
	checkSchema(AuthValidation.logout),
	authController.logout
)

router.get('/refresh', authController.refresh)

router.get('/csrf-token', csrf({ cookie: true }), (req, res) => {
	res.json({ csrfToken: req.csrfToken() })
})

module.exports = router
