const ExchangeValidation = require('@validations/exchange-validation')
const Router = require('express').Router
const { checkSchema } = require('express-validator')

const bybitController = require('@controllers/exchange/bybit-controller')
const authMiddleware = require('@middlewares/auth-middleware')

const router = new Router()

router.get(
	'/bybit-orders-pnl',
	authMiddleware,
	checkSchema(ExchangeValidation.getBybitOrdersPnl, ['query']),
	bybitController.getBybitOrdersPnl
)

router.get(
	'/bybit-tickers',
	authMiddleware,
	checkSchema(ExchangeValidation.getBybitTickers, ['query']),
	bybitController.getBybitTickers
)

router.get(
	'/bybit-wallet',
	authMiddleware,
	checkSchema(ExchangeValidation.getBybitWallet, ['query']),
	bybitController.getBybitWallet
)

router.get(
	'/bybit-transactions',
	authMiddleware,
	checkSchema(ExchangeValidation.getBybitTransactions, ['query']),
	bybitController.getBybitTransactions
)

module.exports = router
