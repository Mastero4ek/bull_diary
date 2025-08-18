const BybitService = require('../services/bybit-service')
const KeysService = require('../services/keys-service')
const Helpers = require('../helpers/helpers')
const OrdersService = require('../services/orders-service')
const { ApiError } = require('../exceptions/api-error')
const moment = require('moment')
const i18next = require('i18next')

class BybitController {
	async getBybitOrdersPnl(req, res, next) {
		try {
			Helpers.validationError(req, next)

			const { exchange, sort, search, page, limit, start_time, end_time } =
				req.query
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
						exchange: Helpers.capitalize(exchange),
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
				req.lng,
				current_keys,
				startMsPnl,
				endMsPnl,
				sort,
				search,
				parsedPage,
				parsedLimit
			)

			const total = await Helpers.calculateTotalPnl(result.allOrders)

			const bookmarksResult = await OrdersService.getBybitSavedOrders(
				req.lng,
				user.id,
				start_time,
				end_time,
				exchange,
				null, // sort
				null, // search
				parsedPage, // page
				parsedLimit // limit
			)

			return res.json({
				bookmarks: bookmarksResult.orders,
				orders: result.orders,
				total_pages: result.totalPages,
				total_profit: +total.profit,
				total_loss: +total.loss,
			})
		} catch (e) {
			next(e)
		}
	}

	async getBybitTickers(req, res, next) {
		try {
			Helpers.validationError(req, next)

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
						exchange: Helpers.capitalize(exchange),
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
			Helpers.validationError(req, next)

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
						exchange: Helpers.capitalize(exchange),
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
				req.lng,
				current_keys,
				startMsWallet,
				endMsWallet,
				null, // sort
				null, // search
				null, // page
				null // limit
			)

			const total = await Helpers.calculateTotalProfit(result.orders)

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

	async getBybitPositions(req, res, next) {
		try {
			Helpers.validationError(req, next)

			const { exchange, sort, search, page, limit } = req.query
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
						exchange: Helpers.capitalize(exchange),
					})
				)
			}

			const positions = await BybitService.getBybitPositions(
				req.lng,
				current_keys
			)

			const period = Array.from({ length: 7 }, (_, i) => {
				const startOfDay = moment()
					.startOf('isoWeek')
					.add(i, 'days')
					.toISOString()
				const endOfDay = moment()
					.startOf('isoWeek')
					.add(i, 'days')
					.endOf('day')
					.toISOString()
				const dayName = moment().startOf('isoWeek').add(i, 'days').format('ddd')

				return { start: startOfDay, end: endOfDay, day: dayName }
			})

			const ordersByDay = await Promise.all(
				period.map(async periodItem => {
					const result = await BybitService.getBybitOrdersPnl(
						req.lng,
						current_keys,
						periodItem.start,
						periodItem.end,
						null, // sort
						null, // search
						null, // page
						null // limit
					)

					const total = await Helpers.calculateTotalProfit(result.orders)

					return {
						day: periodItem.day,
						net_profit: +parseFloat(total.profit + total.loss).toFixed(2),
					}
				})
			)

			const paginated_positions = await Helpers.paginate(
				positions,
				parsedPage,
				parsedLimit,
				sort,
				search
			)

			return res.json({
				positions: paginated_positions.items,
				total_pages: paginated_positions.totalPages,
				ordersByDay,
			})
		} catch (e) {
			next(e)
		}
	}

	async getBybitWalletChangesByDay(req, res, next) {
		try {
			Helpers.validationError(req, next)

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
						exchange: Helpers.capitalize(exchange),
					})
				)
			}

			const endDate = moment().endOf('day').valueOf()
			const startDate = moment(endDate)
				.subtract(180, 'days')
				.startOf('day')
				.valueOf()

			const transactions = await BybitService.getBybitWalletChanges(
				req.lng,
				current_keys,
				startDate,
				endDate
			)

			const grouped = {}
			for (const transaction of transactions) {
				const day = moment(transaction.transactionTime)
					.utc()
					.startOf('day')
					.format('YYYY-MM-DD')

				if (!grouped[day]) grouped[day] = []

				grouped[day].push(transaction)
			}

			const wallet = await BybitService.getBybitWallet(req.lng, current_keys)
			const currentBalance = parseFloat(wallet.total_balance)
			const transactionTimes = transactions.map(t => t.transactionTime)

			if (transactionTimes.length === 0) {
				const days = moment(endDate).diff(moment(startDate), 'days') + 1
				const result = []

				for (let i = 0; i < days; i++) {
					const day = moment(startDate).add(i, 'day').format('YYYY-MM-DD')

					result.push({
						date: day,
						change: 0,
						positive: 0,
						negative: 0,
						count: 0,
						cashBalance: currentBalance,
					})
				}

				return res.json({
					items: result,
					total: result.length,
				})
			}

			const minDate = moment(Math.min(...transactionTimes))
				.utc()
				.startOf('day')
			const maxDate = moment(Math.max(...transactionTimes))
				.utc()
				.startOf('day')
			const days = maxDate.diff(minDate, 'days') + 1

			let result = []
			let lastKnownBalance = null

			for (let i = 0; i < days; i++) {
				const day = minDate.clone().add(i, 'day').format('YYYY-MM-DD')
				const transactionsForDay = grouped[day] || []

				const totalChange = transactionsForDay.reduce(
					(sum, t) => sum + t.getNetChange(),
					0
				)
				const positiveChanges = transactionsForDay.filter(t => t.isPositive())
				const negativeChanges = transactionsForDay.filter(t => t.isNegative())

				const lastTransactionWithBalance = transactionsForDay
					.filter(t => t.cashBalance !== null && t.cashBalance !== 0)
					.sort((a, b) => a.transactionTime - b.transactionTime)
					.pop()

				let cashBalance = null
				if (lastTransactionWithBalance) {
					cashBalance = lastTransactionWithBalance.cashBalance
					lastKnownBalance = cashBalance
				} else if (lastKnownBalance !== null) {
					cashBalance = lastKnownBalance
				}

				const positiveSum = positiveChanges.reduce(
					(sum, t) => sum + t.getNetChange(),
					0
				)
				const negativeSum = negativeChanges.reduce(
					(sum, t) => sum + t.getNetChange(),
					0
				)

				result.push({
					date: day,
					change: parseFloat(totalChange.toFixed(2)),
					positive: parseFloat(positiveSum.toFixed(2)),
					negative: parseFloat(Math.abs(negativeSum).toFixed(2)),
					count: transactionsForDay.length,
					cashBalance:
						cashBalance !== null ? parseFloat(cashBalance.toFixed(2)) : null,
				})
			}

			const lastTransactionBalance =
				lastKnownBalance ||
				(result.length > 0 ? result[result.length - 1].cashBalance : null)

			if (lastTransactionBalance !== null && currentBalance !== null) {
				const lastTransactionWithBalance = result
					.filter(item => item.cashBalance !== null)
					.sort((a, b) => moment(a.date).diff(moment(b.date)))
					.pop()

				const lastTransactionDate = lastTransactionWithBalance
					? lastTransactionWithBalance.date
					: null

				if (lastTransactionDate) {
					const lastDate = moment(lastTransactionDate)
					const today = moment()

					let currentDate = lastDate.clone().add(1, 'day')

					while (currentDate.isSameOrBefore(today, 'day')) {
						const dateStr = currentDate.format('YYYY-MM-DD')
						const existingEntry = result.find(item => item.date === dateStr)

						if (existingEntry) {
							if (
								existingEntry.cashBalance === null ||
								Math.abs(currentBalance - existingEntry.cashBalance) > 0.001
							) {
								existingEntry.cashBalance = currentBalance
							}
						} else {
							result.push({
								date: dateStr,
								change: 0,
								positive: 0,
								negative: 0,
								count: 0,
								cashBalance: currentBalance,
							})
						}

						currentDate.add(1, 'day')
					}
				}
			}

			return res.json({
				items: result,
				total: result.length,
			})
		} catch (e) {
			next(e)
		}
	}

	async getBybitTransactions(req, res, next) {
		try {
			Helpers.validationError(req, next)

			const { exchange, start_time, end_time, sort, search, page, limit } =
				req.query
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
						exchange: Helpers.capitalize(exchange),
					})
				)
			}

			let startDate = moment(start_time).startOf('day').valueOf()
			let endDate = moment(end_time).endOf('day').valueOf()

			const daysDiff = moment(endDate).diff(moment(startDate), 'days')

			if (daysDiff > 180) {
				startDate = moment(endDate)
					.subtract(180, 'days')
					.startOf('day')
					.valueOf()
			}

			const result = await BybitService.getBybitTransactions(
				req.lng,
				current_keys,
				startDate,
				endDate,
				sort,
				search,
				parsedPage,
				parsedLimit
			)

			const formattedTransactions = result.transactions.map(transaction => ({
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
			}))

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
