const Router = require('express').Router
const router = new Router()
const authMiddleware = require('../../middlewares/auth-middleware')
const bybitController = require('../../controllers/bybit-controller')
const { checkSchema } = require('express-validator')
const ValidationSchema = require('../../validation/validation-schema')

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
	'/bybit-positions',
	authMiddleware,
	checkSchema(ValidationSchema.getBybitPositions, ['query']),
	bybitController.getBybitPositions
)

router.get(
	'/bybit-wallet-changes-by-day',
	authMiddleware,
	checkSchema(ValidationSchema.getBybitWalletChangesByDay, ['query']),
	bybitController.getBybitWalletChangesByDay
)

router.get(
	'/bybit-transactions',
	authMiddleware,
	checkSchema(ValidationSchema.getBybitTransactions, ['query']),
	bybitController.getBybitTransactions
)

module.exports = router
