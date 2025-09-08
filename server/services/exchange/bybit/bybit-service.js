const i18next = require('i18next')
const moment = require('moment')

const { ApiError } = require('@exceptions/api-error')
const {
	getFromCache,
	setToCache,
	generateCacheKey,
} = require('@helpers/cache-helpers')
const { handleApiError } = require('@helpers/error-helpers')
const Order = require('@models/core/order-model')
const Transaction = require('@models/core/transaction-model')
const DataService = require('@services/exchange/data-service')
const ClientService = require('@services/integration/client-service')

class BybitService {
	/**
	 * Получает PnL ордеров Bybit с кешированием и инкрементальным обновлением
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {Object} keys - API ключи {api, secret}
	 * @param {Date|string} start_time - Время начала периода
	 * @param {Date|string} end_time - Время окончания периода
	 * @param {Object} sort - Параметры сортировки {type, value}
	 * @param {string} search - Строка поиска
	 * @param {number} page - Номер страницы
	 * @param {number} limit - Количество записей на странице
	 * @param {boolean} bookmarks - Фильтр по закладкам
	 * @returns {Promise<Object>} - Объект с ордерами и общим PnL
	 */
	async getBybitOrdersPnl(
		userId,
		lng = 'en',
		keys,
		start_time,
		end_time,
		sort,
		search,
		page,
		limit,
		bookmarks
	) {
		const cacheKey = generateCacheKey(
			'bybit',
			'pnl',
			userId,
			start_time,
			end_time,
			page,
			limit,
			sort,
			search,
			bookmarks
		)

		const cachedData = await getFromCache(cacheKey, 'getBybitOrdersPnl')

		if (cachedData) {
			return cachedData
		}

		const client = ClientService.createClient('bybit', keys)

		try {
			const existingOrders = await Order.find({
				user: userId,
				open_time: { $gte: start_time },
				closed_time: { $lte: end_time },
			})

			if (existingOrders.length === 0) {
				const startTime = moment(start_time)
				const endTime = moment(end_time)

				const allOrders = await ClientService.fetchDataByTimeChunks({
					client,
					startTime,
					endTime,
					apiMethod: 'getClosedPnL',
					apiParams: { category: 'linear' },
					lng,
					exchangeName: 'Bybit',
					maxDays: 6,
				})

				const transformedOrders = DataService.transformOrdersToDbFormat(
					allOrders,
					userId,
					'bybit'
				)

				await DataService.saveOrdersToDatabase(
					transformedOrders,
					userId,
					'bybit'
				)

				const result = await DataService.getOrdersFromDb(
					userId,
					start_time,
					end_time,
					sort,
					search,
					page,
					limit,
					bookmarks,
					'bybit',
					lng
				)

				const totalPnl = await DataService.calculateTotalPnlFromDb(
					userId,
					start_time,
					end_time,
					bookmarks,
					search,
					'bybit',
					lng
				)

				const finalResult = {
					...result,
					totalPnl,
				}

				await setToCache(cacheKey, finalResult, 300, 'getBybitOrdersPnl')

				return finalResult
			} else {
				const latestOrder = await Order.findOne({
					user: userId,
					open_time: { $gte: start_time },
					sync_time: { $lte: end_time },
				}).sort({ open_time: -1 })

				if (latestOrder) {
					const latestOrderTime = latestOrder.sync_time.getTime()

					const allNewOrders = await ClientService.fetchDataByTimeChunks({
						client,
						startTime: latestOrderTime,
						endTime: end_time,
						apiMethod: 'getClosedPnL',
						apiParams: { category: 'linear' },
						lng,
						exchangeName: 'Bybit',
						maxDays: 6,
					})

					if (allNewOrders.length > 0) {
						const transformedNewOrders = DataService.transformOrdersToDbFormat(
							allNewOrders,
							userId,
							'bybit'
						)

						await DataService.saveOrdersToDatabase(
							transformedNewOrders,
							userId,
							'bybit'
						)
					}
				}

				const result = await DataService.getOrdersFromDb(
					userId,
					start_time,
					end_time,
					sort,
					search,
					page,
					limit,
					bookmarks,
					'bybit',
					lng
				)

				const totalPnl = await DataService.calculateTotalPnlFromDb(
					userId,
					start_time,
					end_time,
					bookmarks,
					search,
					'bybit',
					lng
				)

				const finalResult = {
					...result,
					totalPnl,
				}

				await setToCache(cacheKey, finalResult, 300, 'getBybitOrdersPnl')

				return finalResult
			}
		} catch (error) {
			handleApiError(
				error,
				lng,
				'getBybitOrdersPnl',
				'Failed to get Bybit orders PnL',
				'Bybit'
			)
		}
	}

	/**
	 * Получает тикеры Bybit с кешированием
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {Object} keys - API ключи {api, secret}
	 * @returns {Promise<Array>} - Массив тикеров
	 */
	async getBybitTickers(lng = 'en', keys) {
		const cacheKey = generateCacheKey(
			'bybit',
			'tickers',
			new Date().toISOString().split('T')[0]
		)

		const cachedData = await getFromCache(cacheKey, 'getBybitTickers')
		if (cachedData) {
			return cachedData
		}

		const client = ClientService.createClient('bybit', keys)

		try {
			const result = await ClientService.makeApiRequest({
				client,
				apiMethod: 'getTickers',
				apiParams: { category: 'linear' },
				lng,
				exchangeName: 'Bybit',
			})

			let tickers = []

			if (result.list && result.list.length > 0) {
				tickers = [...result.list]
			}

			await setToCache(cacheKey, tickers, 60, 'getBybitTickers')

			return tickers
		} catch (error) {
			handleApiError(
				error,
				lng,
				'getBybitTickers',
				'Failed to get Bybit tickers',
				'Bybit'
			)
		}
	}

	/**
	 * Получает данные кошелька Bybit с кешированием
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {Object} keys - API ключи {api, secret}
	 * @returns {Promise<Object>} - Объект с данными кошелька
	 */
	async getBybitWallet(lng = 'en', keys) {
		const cacheKey = generateCacheKey(
			'bybit',
			'wallet',
			new Date().toISOString().split('T')[0]
		)

		const cachedData = await getFromCache(cacheKey, 'getBybitWallet')
		if (cachedData) {
			return cachedData
		}

		try {
			const client = ClientService.createClient('bybit', keys)

			const result = await ClientService.makeApiRequest({
				client,
				apiMethod: 'getWalletBalance',
				apiParams: { accountType: 'UNIFIED' },
				lng,
				exchangeName: 'Bybit',
			})

			const wallet = {}

			if (!result.list || !result.list[0].coin) {
				throw ApiError.BadRequest(
					i18next.t('error.api.wallet_not_found', { lng })
				)
			}

			if (result.list && result.list[0].coin) {
				const coins = result.list[0].coin
				const usdtCoin = coins.find(coin => coin.coin === 'USDT')

				if (!usdtCoin) {
					throw ApiError.BadRequest(
						i18next.t('error.api.usdt_not_found', { lng })
					)
				}

				let totalBalance = usdtCoin ? Number(usdtCoin.walletBalance) : 0
				let totalUnrealisedPnl = usdtCoin ? Number(usdtCoin.unrealisedPnl) : 0

				coins.forEach(coin => {
					if (coin.coin !== 'USDT') {
						totalBalance += Number(coin.usdValue) || 0
						totalUnrealisedPnl += Number(coin.unrealisedPnl) || 0
					}
				})

				wallet.total_balance = totalBalance.toFixed(4)
				wallet.unrealised_pnl = totalUnrealisedPnl.toFixed(4)

				wallet.coins = coins.map(coin => ({
					coin: coin.coin,
					walletBalance: Number(coin.walletBalance).toFixed(4),
					unrealisedPnl: Number(coin.unrealisedPnl).toFixed(4),
					equity: Number(coin.equity).toFixed(4),
					usdValue: Number(coin.usdValue).toFixed(4),
				}))
			}

			await setToCache(cacheKey, wallet, 60, 'getBybitWallet')

			return wallet
		} catch (error) {
			handleApiError(
				error,
				lng,
				'getBybitWallet',
				'Failed to get Bybit wallet',
				'Bybit'
			)
		}
	}

	/**
	 * Получает транзакции Bybit с кешированием и инкрементальным обновлением
	 * @param {string} userId - ID пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {Object} keys - API ключи {api, secret}
	 * @param {Date|string} start_time - Время начала периода
	 * @param {Date|string} end_time - Время окончания периода
	 * @param {Object} sort - Параметры сортировки {type, value}
	 * @param {string} search - Строка поиска
	 * @param {number} page - Номер страницы
	 * @param {number} limit - Количество записей на странице
	 * @param {boolean} bookmarks - Фильтр по закладкам
	 * @returns {Promise<Object>} - Объект с транзакциями
	 */
	async getBybitTransactions(
		userId,
		lng = 'en',
		keys,
		start_time,
		end_time,
		sort,
		search,
		page,
		limit,
		bookmarks
	) {
		const cacheKey = generateCacheKey(
			'bybit',
			'transactions',
			userId,
			start_time,
			end_time,
			page,
			limit,
			sort,
			search
		)

		const cachedData = await getFromCache(cacheKey, 'getBybitTransactions')

		if (cachedData) {
			return cachedData
		}

		const client = ClientService.createClient('bybit', keys)

		try {
			const existingTransactions = await Transaction.find({
				user: userId,
				transactionTime: {
					$gte: start_time,
					$lte: end_time,
				},
				...(bookmarks && { bookmark: true }),
			})

			if (existingTransactions.length === 0) {
				const startTime = moment(start_time)
				const endTime = moment(end_time)

				const allTransactions = await ClientService.fetchDataByTimeChunks({
					client,
					startTime,
					endTime,
					apiMethod: 'getTransactionLog',
					apiParams: { accountType: 'UNIFIED' },
					lng,
					exchangeName: 'Bybit',
					maxDays: 6,
				})

				const transformedTransactions =
					DataService.transformTransactionsToDbFormat(
						allTransactions,
						userId,
						'bybit'
					)

				await DataService.saveTransactionsToDatabase(
					transformedTransactions,
					userId,
					'bybit'
				)

				const result = await DataService.getTransactionsFromDb(
					userId,
					start_time,
					end_time,
					sort,
					search,
					page,
					limit,
					bookmarks,
					'bybit',
					lng
				)

				await setToCache(cacheKey, result, 300, 'getBybitTransactions')

				return result
			} else {
				const latestTransaction = await Transaction.findOne({
					user: userId,
					transactionTime: { $gte: start_time },
					sync_time: { $lte: end_time },
				}).sort({ transactionTime: -1 })

				if (latestTransaction) {
					const latestTransactionTime = latestTransaction.sync_time.getTime()

					const allNewTransactions = await ClientService.fetchDataByTimeChunks({
						client,
						startTime: latestTransactionTime,
						endTime: end_time,
						apiMethod: 'getTransactionLog',
						apiParams: { accountType: 'UNIFIED' },
						lng,
						exchangeName: 'Bybit',
						maxDays: 6,
					})

					if (allNewTransactions.length > 0) {
						const transformedNewTransactions =
							DataService.transformTransactionsToDbFormat(
								allNewTransactions,
								userId,
								'bybit'
							)

						await DataService.saveTransactionsToDatabase(
							transformedNewTransactions,
							userId,
							'bybit'
						)
					}
				}

				const result = await DataService.getTransactionsFromDb(
					userId,
					start_time,
					end_time,
					sort,
					search,
					page,
					limit,
					bookmarks,
					'bybit',
					lng
				)

				await setToCache(cacheKey, result, 300, 'getBybitTransactions')

				return result
			}
		} catch (error) {
			handleApiError(
				error,
				lng,
				'getBybitTransactions',
				'Failed to get Bybit transactions',
				'Bybit'
			)
		}
	}
}

module.exports = new BybitService()
