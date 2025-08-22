const Router = require('express').Router
const authController = require('@controllers/auth/auth-controller')
const router = new Router()
const { checkSchema } = require('express-validator')
const ValidationSchema = require('@validation/schema')
const csrf = require('csurf')

router.get('/csrf-token', csrf({ cookie: true }), (req, res) => {
	const token = req.csrfToken()

	res.json({ csrfToken: token })
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
