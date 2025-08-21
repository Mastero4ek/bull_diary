const moment = require('moment')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')
const ApiClientService = require('./api-client-service')
const DataService = require('./data-service')
const Order = require('../models/order-model')
const Transaction = require('../models/transaction-model')
const BybitTransactionDto = require('../dtos/bybit-transaction-dto')
const {
	getFromCache,
	setToCache,
	generateCacheKey,
} = require('../helpers/cache-helpers')
const { handleApiError } = require('../helpers/error-helpers')

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

		const client = ApiClientService.createClient('bybit', keys)

		try {
			let existingOrders = await Order.find({
				user: userId,
				open_time: { $gte: start_time },
				closed_time: { $lte: end_time },
			})

			if (existingOrders.length === 0) {
				const startTime = moment(start_time)
				const endTime = moment(end_time)

				const allOrders = await ApiClientService.fetchDataByTimeChunks({
					client,
					startTime,
					endTime,
					apiMethod: 'getClosedPnL',
					apiParams: { category: 'linear' },
					lng,
					exchangeName: 'Bybit',
					maxDays: 7,
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

					const allNewOrders = await ApiClientService.fetchDataByTimeChunks({
						client,
						startTime: latestOrderTime,
						endTime: end_time,
						apiMethod: 'getClosedPnL',
						apiParams: { category: 'linear' },
						lng,
						exchangeName: 'Bybit',
						maxDays: 7,
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
				'errors.fetch_orders_error',
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

		const client = ApiClientService.createClient('bybit', keys)

		try {
			const result = await ApiClientService.makeApiRequest({
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
				'errors.fetch_tickers_error',
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
			const client = ApiClientService.createClient('bybit', keys)

			const result = await ApiClientService.makeApiRequest({
				client,
				apiMethod: 'getWalletBalance',
				apiParams: { accountType: 'UNIFIED' },
				lng,
				exchangeName: 'Bybit',
			})

			let wallet = {}

			if (!result.list || !result.list[0].coin) {
				throw ApiError.BadRequest(i18next.t('errors.wallet_not_found', { lng }))
			}

			if (result.list && result.list[0].coin) {
				const coins = result.list[0].coin
				const usdtCoin = coins.find(coin => coin.coin === 'USDT')

				if (!usdtCoin) {
					throw ApiError.BadRequest(i18next.t('errors.usdt_not_found', { lng }))
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
				'errors.fetch_wallet_error',
				'Bybit'
			)
		}
	}

	/**
	 * Получает позиции Bybit с кешированием
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {Object} keys - API ключи {api, secret}
	 * @returns {Promise<Array>} - Массив позиций
	 */
	async getBybitPositions(lng = 'en', keys) {
		const cacheKey = generateCacheKey(
			'bybit',
			'positions',
			new Date().toISOString().split('T')[0]
		)

		const cachedData = await getFromCache(cacheKey, 'getBybitPositions')
		if (cachedData) {
			return cachedData
		}

		const client = ApiClientService.createClient('bybit', keys)

		try {
			const allPositions = await ApiClientService.fetchPaginatedData({
				client,
				apiMethod: 'getPositionInfo',
				apiParams: {
					category: 'linear',
					settleCoin: 'USDT',
				},
				lng,
				exchangeName: 'Bybit',
			})

			const orders = allPositions.map(item => new BybitOrderDto(item))

			await setToCache(cacheKey, orders, 300, 'getBybitPositions')

			return orders
		} catch (error) {
			handleApiError(
				error,
				lng,
				'getBybitPositions',
				'errors.fetch_positions_error',
				'Bybit'
			)
		}
	}

	/**
	 * Получает изменения кошелька Bybit за период с кешированием
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {Object} keys - API ключи {api, secret}
	 * @param {Date|string} start_time - Время начала периода
	 * @param {Date|string} end_time - Время окончания периода
	 * @returns {Promise<Array>} - Массив изменений кошелька
	 */
	async getBybitWalletChanges(lng = 'en', keys, start_time, end_time) {
		const cacheKey = generateCacheKey(
			'bybit',
			'wallet_changes',
			start_time,
			end_time
		)

		const cachedData = await getFromCache(cacheKey, 'getBybitWalletChanges')
		if (cachedData) {
			return cachedData.map(item => new BybitTransactionDto(item))
		}

		const client = ApiClientService.createClient('bybit', keys)

		try {
			const startTime = moment(start_time)
			const endTime = moment(end_time)

			const allTransactions = await ApiClientService.fetchDataByTimeChunks({
				client,
				startTime,
				endTime,
				apiMethod: 'getTransactionLog',
				apiParams: { accountType: 'UNIFIED' },
				lng,
				exchangeName: 'Bybit',
				maxDays: 7,
			})

			const transactions = allTransactions.map(
				item => new BybitTransactionDto(item)
			)

			const plainObjects = allTransactions.map(item => ({
				transactionTime: parseInt(item.transactionTime),
				change: parseFloat(Number(item.change || 0).toFixed(8)),
				cashFlow: parseFloat(Number(item.cashFlow || 0).toFixed(8)),
				cashBalance: parseFloat(Number(item.cashBalance || 0).toFixed(8)),
			}))

			await setToCache(cacheKey, plainObjects, 300, 'getBybitWalletChanges')

			return transactions
		} catch (error) {
			handleApiError(
				error,
				lng,
				'getBybitWalletChanges',
				'errors.fetch_wallet_changes_error',
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

		const client = ApiClientService.createClient('bybit', keys)

		try {
			let existingTransactions = await Transaction.find({
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

				const allTransactions = await ApiClientService.fetchDataByTimeChunks({
					client,
					startTime,
					endTime,
					apiMethod: 'getTransactionLog',
					apiParams: { accountType: 'UNIFIED' },
					lng,
					exchangeName: 'Bybit',
					maxDays: 7,
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

					const allNewTransactions =
						await ApiClientService.fetchDataByTimeChunks({
							client,
							startTime: latestTransactionTime,
							endTime: end_time,
							apiMethod: 'getTransactionLog',
							apiParams: { accountType: 'UNIFIED' },
							lng,
							exchangeName: 'Bybit',
							maxDays: 7,
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
				'errors.fetch_transactions_error',
				'Bybit'
			)
		}
	}
}

module.exports = new BybitService()
