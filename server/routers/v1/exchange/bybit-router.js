const Router = require('express').Router
const { checkSchema } = require('express-validator')

const bybitController = require('@controllers/exchange/bybit-controller')
const authMiddleware = require('@middlewares/auth-middleware')
const ValidationSchema = require('@validation/schema')

const router = new Router()

router.get(
	'/bybit-orders-pnl',
	authMiddleware,
	checkSchema(ValidationSchema.getBybitOrdersPnl, ['query']),
	bybitController.getBybitOrdersPnl
)

router.get(
	'/bybit-tickers',
	authMiddleware,
	checkSchema(ValidationSchema.getBybitTickers, ['query']),
	bybitController.getBybitTickers
)

router.get(
	'/bybit-wallet',
	authMiddleware,
	checkSchema(ValidationSchema.getBybitWallet, ['query']),
	bybitController.getBybitWallet
)

router.get(
	'/bybit-transactions',
	authMiddleware,
	checkSchema(ValidationSchema.getBybitTransactions, ['query']),
	bybitController.getBybitTransactions
)

module.exports = router
