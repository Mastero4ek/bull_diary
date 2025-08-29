const i18next = require('i18next')
const moment = require('moment')

const { ApiError } = require('@exceptions/api-error')
const { validationError } = require('@helpers/sanitization-helpers')
const { capitalize } = require('@helpers/utility-helpers')
const KeysService = require('@services/auth/keys-service')
const BybitService = require('@services/exchange/bybit/bybit-service')
const DataService = require('@services/exchange/data-service')

class BybitController {
	async getBybitOrdersPnl(req, res, next) {
		try {
			validationError(req, next)

			const {
				exchange,
				sort,
				search,
				page,
				limit,
				start_time,
				end_time,
				bookmarks,
			} = req.query
			const parsedPage = page ? parseInt(page) : undefined
			const parsedLimit = limit ? parseInt(limit) : undefined

			const user = req.user
			const keys = await KeysService.findDecryptedKeys(user.id, req.lng)

			if (!keys || keys.message) {
				throw ApiError.BadRequest(
					i18next.t('errors.keys_not_found', { lng: req.lng })
				)
			}

			const current_keys = keys.keys.find(item => item.name === exchange)

			if (!current_keys || !current_keys.api || !current_keys.secret) {
				throw ApiError.BadRequest(
					i18next.t('errors.keys_not_configured', {
						lng: req.lng,
						exchange: capitalize(exchange),
					})
				)
			}

			const startMsPnl =
				typeof start_time === 'string'
					? new Date(start_time).getTime()
					: start_time
			const endMsPnl =
				typeof end_time === 'string' ? new Date(end_time).getTime() : end_time

			const result = await BybitService.getBybitOrdersPnl(
				user.id,
				req.lng,
				current_keys,
				startMsPnl,
				endMsPnl,
				sort,
				search,
				parsedPage,
				parsedLimit,
				bookmarks
			)

			const totalStats = await DataService.calculateTotalProfitFromDb(
				user.id,
				startMsPnl,
				endMsPnl,
				bookmarks,
				search,
				'bybit',
				req.lng
			)

			return res.json({
				orders: result.orders,
				total_pages: result.totalPages,
				total_profit: {
					value: +result.totalPnl.profit,
					count: totalStats.profitCount || 0,
				},
				total_loss: {
					value: +result.totalPnl.loss,
					count: totalStats.lossCount || 0,
				},
			})
		} catch (e) {
			next(e)
		}
	}

	async getBybitTickers(req, res, next) {
		try {
			validationError(req, next)

			const { exchange } = req.query

			const user = req.user
			const keys = await KeysService.findDecryptedKeys(user.id, req.lng)

			if (!keys || keys.message) {
				throw ApiError.BadRequest(
					i18next.t('errors.keys_not_found', { lng: req.lng })
				)
			}

			const current_keys = keys.keys.find(item => item.name === exchange)

			if (!current_keys || !current_keys.api || !current_keys.secret) {
				throw ApiError.BadRequest(
					i18next.t('errors.keys_not_configured', {
						lng: req.lng,
						exchange: capitalize(exchange),
					})
				)
			}

			const tickers = await BybitService.getBybitTickers(req.lng, current_keys)

			return res.json(tickers)
		} catch (e) {
			next(e)
		}
	}

	async getBybitWallet(req, res, next) {
		try {
			validationError(req, next)

			const { exchange, start_time, end_time } = req.query
			const user = req.user
			const keys = await KeysService.findDecryptedKeys(user.id, req.lng)

			if (!keys || keys.message) {
				throw ApiError.BadRequest(
					i18next.t('errors.keys_not_found', { lng: req.lng })
				)
			}

			const current_keys = keys.keys.find(item => item.name === exchange)

			if (!current_keys || !current_keys.api || !current_keys.secret) {
				throw ApiError.BadRequest(
					i18next.t('errors.keys_not_configured', {
						lng: req.lng,
						exchange: capitalize(exchange),
					})
				)
			}

			const startMsWallet =
				typeof start_time === 'string'
					? new Date(start_time).getTime()
					: start_time
			const endMsWallet =
				typeof end_time === 'string' ? new Date(end_time).getTime() : end_time
			const wallet = await BybitService.getBybitWallet(req.lng, current_keys)

			const result = await BybitService.getBybitOrdersPnl(
				user.id,
				req.lng,
				current_keys,
				startMsWallet,
				endMsWallet,
				null, // sort
				null, // search
				null, // page
				null, // limit
				false // bookmarks
			)

			const total = await DataService.calculateTotalProfitFromDb(
				user.id,
				startMsWallet,
				endMsWallet,
				false, // bookmarks
				null, // search
				'bybit', // exchange
				req.lng
			)

			return res.json({
				total_balance: +wallet.total_balance,
				unrealised_pnl: +wallet.unrealised_pnl,
				coins: wallet.coins,
				total_profit: +total.profit,
				total_loss: +total.loss,
				wining_trades: +total.profitCount,
				losing_trades: +total.lossCount,
			})
		} catch (e) {
			next(e)
		}
	}

	async getBybitTransactions(req, res, next) {
		try {
			validationError(req, next)

			const {
				exchange,
				start_time,
				end_time,
				sort,
				search,
				page,
				limit,
				bookmarks,
			} = req.query

			const user = req.user
			const keys = await KeysService.findDecryptedKeys(user.id, req.lng)

			if (!keys || keys.message) {
				throw ApiError.BadRequest(
					i18next.t('errors.keys_not_found', { lng: req.lng })
				)
			}

			const current_keys = keys.keys.find(item => item.name === exchange)

			if (!current_keys || !current_keys.api || !current_keys.secret) {
				throw ApiError.BadRequest(
					i18next.t('errors.keys_not_configured', {
						lng: req.lng,
						exchange: capitalize(exchange),
					})
				)
			}

			const startMs =
				typeof start_time === 'string'
					? new Date(start_time).getTime()
					: start_time
			const endMs =
				typeof end_time === 'string' ? new Date(end_time).getTime() : end_time

			const result = await BybitService.getBybitTransactions(
				user.id,
				req.lng,
				current_keys,
				startMs,
				endMs,
				sort,
				search,
				page,
				limit,
				bookmarks
			)

			const formattedTransactions = result.transactions.map(transaction => {
				return {
					transactionTime: transaction.transactionTime,
					date: moment(transaction.transactionTime).format('YYYY-MM-DD'),
					time: moment(transaction.transactionTime).format('HH:mm:ss'),
					symbol: transaction.symbol,
					currency: transaction.currency,
					category: transaction.category,
					side: transaction.side,
					type: transaction.type,
					change: transaction.change,
					cashFlow: transaction.cashFlow,
					cashBalance: transaction.cashBalance,
					funding: transaction.funding,
					fee: transaction.fee,
				}
			})

			return res.json({
				transactions: formattedTransactions,
				total_pages: result.totalPages,
				total: result.total,
			})
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new BybitController()
