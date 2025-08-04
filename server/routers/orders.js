const Router = require('express').Router
const router = new Router()
const authMiddleware = require('../middlewares/auth-middleware')
const ordersController = require('../controllers/orders-controller')
const { checkSchema } = require('express-validator')
const ValidationSchema = require('../validation/validation-schema')

router.post(
	'/order/:id',
	authMiddleware,
	checkSchema(ValidationSchema.orders),
	ordersController.savedOrder
)

router.delete(
	'/order/:id',
	authMiddleware,
	checkSchema(ValidationSchema.orders),
	ordersController.removedOrder
)

module.exports = router
