const Router = require('express').Router
const router = new Router()
const authMiddleware = require('../middlewares/auth-middleware')
const bybitController = require('../controllers/bybit-controller')
const ordersController = require('../controllers/orders-controller')

router.get(
	'/bybit-orders-pnl',
	authMiddleware,
	bybitController.getBybitOrdersPnl
)

router.get('/bybit-tickers', authMiddleware, bybitController.getBybitTickers)

router.get('/bybit-wallet', authMiddleware, bybitController.getBybitWallet)

router.get(
	'/bybit-positions',
	authMiddleware,
	bybitController.getBybitPositions
)

router.get(
	'/bybit-wallet-changes-by-day',
	authMiddleware,
	bybitController.getBybitWalletChangesByDay
)

router.get(
	'/bybit-transactions',
	authMiddleware,
	bybitController.getBybitTransactions
)

router.get(
	'/bybit-saved-orders/:all?',
	authMiddleware,
	ordersController.getBybitSavedOrders
)

module.exports = router
