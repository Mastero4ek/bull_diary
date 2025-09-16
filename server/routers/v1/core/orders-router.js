const CoreValidation = require('@validations/core-validation')
const Router = require('express').Router
const { checkSchema } = require('express-validator')

const ordersController = require('@controllers/core/orders-controller')
const authMiddleware = require('@middlewares/auth-middleware')

const router = new Router()

router.post(
	'/order/:id',
	authMiddleware,
	checkSchema(CoreValidation.savedOrder),
	ordersController.savedOrder
)

router.delete(
	'/order/:id',
	authMiddleware,
	checkSchema(CoreValidation.removedOrder),
	ordersController.removedOrder
)

router.get(
	'/order/description/:id',
	authMiddleware,
	ordersController.getOrderDescription
)

router.patch(
	'/order/description/:id',
	authMiddleware,
	ordersController.updateOrderDescription
)

module.exports = router
