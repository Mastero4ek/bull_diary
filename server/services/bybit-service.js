const { RestClientV5 } = require('bybit-api')
const moment = require('moment')
const BybitOrderDto = require('../dtos/bybit-order-dto')
const BybitTransactionDto = require('../dtos/bybit-transaction-dto')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')
const Helpers = require('../helpers/helpers')

class BybitService {
	async getBybitOrdersPnl(
		lng = 'en',
		keys,
		start_time,
		end_time,
		sort,
		search,
		page,
		limit
	) {
		const cacheKey = Helpers.generateCacheKey(
			'bybit',
			'pnl',
			start_time,
			end_time,
			page,
			limit,
			sort,
			search
		)

		const cachedData = await Helpers.getFromCache(cacheKey, 'getBybitOrdersPnl')
		if (cachedData) {
			return cachedData
		}

		const client = new RestClientV5({
			testnet: false,
			key: keys.api,
			secret: keys.secret,
		})

		try {
			const startTime = moment(start_time)
			const endTime = moment(end_time)
			const diffDays = endTime.diff(startTime, 'days')
			let allOrders = []

			if (diffDays > 7) {
				const timeChunks = []
				let currentStartTime = startTime.clone()
				const endLimit = endTime.clone()

				while (currentStartTime.isBefore(endLimit)) {
					const currentEndTime = moment.min(
						currentStartTime.clone().add(7, 'days'),
						endLimit
					)

					timeChunks.push({
						start: currentStartTime.unix() * 1000,
						end: currentEndTime.unix() * 1000,
					})

					currentStartTime = currentEndTime
				}

				const chunkResults = await Promise.all(
					timeChunks.map(async chunk => {
						let chunkOrders = []
						let nextCursor = ''

						do {
							const response = await client.getClosedPnL({
								category: 'linear',
								startTime: chunk.start,
								endTime: chunk.end,
								cursor: nextCursor || undefined,
								limit: 50,
							})

							if (response.retCode !== 0) {
								throw ApiError.BadRequest(
									i18next.t('errors.api_error', {
										lng,
										exchange: 'Bybit',
										error: response.retMsg,
									})
								)
							}

							if (response.result.list && response.result.list.length > 0) {
								chunkOrders = [...chunkOrders, ...response.result.list]
							}

							nextCursor = response.result.nextPageCursor

							await Helpers.delayApi(100)
						} while (nextCursor)

						return chunkOrders
					})
				)

				allOrders = chunkResults.flat()
			} else {
				let nextCursor = ''

				do {
					const response = await client.getClosedPnL({
						category: 'linear',
						startTime: new Date(start_time).getTime(),
						endTime: new Date(end_time).getTime(),
						cursor: nextCursor || undefined,
						limit: 50,
					})

					if (response.retCode !== 0) {
						throw ApiError.BadRequest(
							i18next.t('errors.api_error', {
								lng,
								exchange: 'Bybit',
								error: response.retMsg,
							})
						)
					}

					if (response.result.list && response.result.list.length > 0) {
						allOrders = [...allOrders, ...response.result.list]
					}

					nextCursor = response.result.nextPageCursor

					await Helpers.delayApi(100)
				} while (nextCursor)
			}

			const orders = allOrders.map(item => new BybitOrderDto(item))

			if (page === null && limit === null) {
				let filteredOrders = orders

				if (search) {
					const searchLower = search.toLowerCase().trim()

					filteredOrders = orders.filter(order => {
						return ['symbol', 'direction'].some(field => {
							const value = order[field]

							return (
								value &&
								typeof value === 'string' &&
								value.toLowerCase().includes(searchLower)
							)
						})
					})
				}

				if (sort && sort.type) {
					filteredOrders.sort((a, b) => {
						const aValue = a[sort.type]
						const bValue = b[sort.type]

						if (sort.type === 'closed_time' || sort.type === 'date') {
							const aNum =
								typeof aValue === 'number' ? aValue : new Date(aValue).getTime()
							const bNum =
								typeof bValue === 'number' ? bValue : new Date(bValue).getTime()

							return sort.value === 'asc' ? aNum - bNum : bNum - aNum
						}

						if (typeof aValue === 'number' && typeof bValue === 'number') {
							return sort.value === 'asc' ? aValue - bValue : bValue - aValue
						}

						if (typeof aValue === 'string' && typeof bValue === 'string') {
							return sort.value === 'asc'
								? aValue.localeCompare(bValue)
								: bValue.localeCompare(aValue)
						}

						return 0
					})
				}

				await Helpers.setToCache(
					cacheKey,
					{
						orders: filteredOrders,
						total: filteredOrders.length,
						totalPages: 1,
					},
					300,
					'getBybitOrdersPnl'
				)

				return {
					orders: filteredOrders,
					total: filteredOrders.length,
					totalPages: 1,
				}
			}

			const paginatedResult = await Helpers.paginate(
				orders,
				page,
				limit,
				sort,
				search,
				['symbol', 'direction']
			)

			await Helpers.setToCache(
				cacheKey,
				{
					orders: paginatedResult.items,
					total: paginatedResult.total,
					totalPages: paginatedResult.totalPages,
				},
				300,
				'getBybitOrdersPnl'
			)

			return {
				orders: paginatedResult.items,
				total: paginatedResult.total,
				totalPages: paginatedResult.totalPages,
			}
		} catch (error) {
			Helpers.handleApiError(
				error,
				lng,
				'getBybitOrdersPnl',
				'errors.fetch_orders_error',
				'Bybit'
			)
		}
	}

	async getBybitTickers(lng = 'en', keys) {
		const cacheKey = Helpers.generateCacheKey(
			'bybit',
			'tickers',
			new Date().toISOString().split('T')[0]
		)

		const cachedData = await Helpers.getFromCache(cacheKey, 'getBybitTickers')
		if (cachedData) {
			return cachedData
		}

		const client = new RestClientV5({
			testnet: false,
			key: keys.api,
			secret: keys.secret,
		})

		try {
			const response = await client.getTickers({ category: 'linear' })

			if (response.retCode !== 0) {
				throw ApiError.BadRequest(
					i18next.t('errors.api_error', {
						lng,
						exchange: 'Bybit',
						error: response.retMsg,
					})
				)
			}

			let tickers = []

			if (response.result.list && response.result.list.length > 0) {
				tickers = [...response.result.list]
			}

			await Helpers.setToCache(cacheKey, tickers, 60, 'getBybitTickers')

			return tickers
		} catch (error) {
			Helpers.handleApiError(
				error,
				lng,
				'getBybitTickers',
				'errors.fetch_tickers_error',
				'Bybit'
			)
		}
	}

	async getBybitWallet(lng = 'en', keys) {
		const cacheKey = Helpers.generateCacheKey(
			'bybit',
			'wallet',
			new Date().toISOString().split('T')[0]
		)

		const cachedData = await Helpers.getFromCache(cacheKey, 'getBybitWallet')
		if (cachedData) {
			return cachedData
		}

		const client = new RestClientV5({
			testnet: false,
			key: keys.api,
			secret: keys.secret,
		})

		try {
			const response = await client.getWalletBalance({
				accountType: 'UNIFIED',
			})

			let wallet = {}

			if (response.retCode !== 0) {
				throw ApiError.BadRequest(
					i18next.t('errors.api_error', {
						lng,
						exchange: 'Bybit',
						error: response.retMsg,
					})
				)
			}

			if (!response.result.list || !response.result.list[0].coin) {
				throw ApiError.BadRequest(i18next.t('errors.wallet_not_found', { lng }))
			}

			if (response.result.list && response.result.list[0].coin) {
				const coins = response.result.list[0].coin
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

			await Helpers.setToCache(cacheKey, wallet, 60, 'getBybitWallet')

			return wallet
		} catch (error) {
			Helpers.handleApiError(
				error,
				lng,
				'getBybitWallet',
				'errors.fetch_wallet_error',
				'Bybit'
			)
		}
	}

	async getBybitPositions(lng = 'en', keys) {
		const cacheKey = Helpers.generateCacheKey(
			'bybit',
			'positions',
			new Date().toISOString().split('T')[0]
		)

		const cachedData = await Helpers.getFromCache(cacheKey, 'getBybitPositions')
		if (cachedData) {
			return cachedData
		}

		const client = new RestClientV5({
			testnet: false,
			key: keys.api,
			secret: keys.secret,
		})

		try {
			let allPositions = []

			const response = await client.getPositionInfo({
				category: 'linear',
				settleCoin: 'USDT',
			})

			if (response.retCode !== 0) {
				throw ApiError.BadRequest(
					i18next.t('errors.api_error', {
						lng,
						exchange: 'Bybit',
						error: response.retMsg,
					})
				)
			}

			if (response.result.list && response.result.list.length > 0) {
				allPositions = [...allPositions, ...response.result.list]
			}

			while (response.result.nextPageCursor !== '') {
				const nextResponse = await client.getPositionInfo({
					category: 'linear',
					settleCoin: 'USDT',
					cursor: response.result.nextPageCursor,
				})

				if (nextResponse.retCode !== 0) {
					throw ApiError.BadRequest(
						i18next.t('errors.api_error', {
							lng,
							exchange: 'Bybit',
							error: nextResponse.retMsg,
						})
					)
				}

				if (nextResponse.result.list && nextResponse.result.list.length > 0) {
					allPositions = [...allPositions, ...nextResponse.result.list]
				}

				response.result.nextPageCursor = nextResponse.result.nextPageCursor

				await Helpers.delayApi(100)
			}

			const orders = allPositions.map(item => new BybitOrderDto(item))

			await Helpers.setToCache(cacheKey, orders, 300, 'getBybitPositions')

			return orders
		} catch (error) {
			Helpers.handleApiError(
				error,
				lng,
				'getBybitPositions',
				'errors.fetch_positions_error',
				'Bybit'
			)
		}
	}

	async getBybitWalletChanges(lng = 'en', keys, start_time, end_time) {
		const cacheKey = Helpers.generateCacheKey(
			'bybit',
			'wallet_changes',
			start_time,
			end_time
		)

		const cachedData = await Helpers.getFromCache(
			cacheKey,
			'getBybitWalletChanges'
		)
		if (cachedData) {
			return cachedData.map(item => new BybitTransactionDto(item))
		}

		const client = new RestClientV5({
			testnet: false,
			key: keys.api,
			secret: keys.secret,
		})

		try {
			const startTime = moment(start_time)
			const endTime = moment(end_time)
			const diffDays = endTime.diff(startTime, 'days')

			let allTransactions = []

			if (diffDays > 7) {
				const timeChunks = []
				let currentStartTime = startTime.clone()
				const endLimit = endTime.clone()

				while (currentStartTime.isBefore(endLimit)) {
					const currentEndTime = moment.min(
						currentStartTime.clone().add(7, 'days'),
						endLimit
					)

					timeChunks.push({
						start: currentStartTime.valueOf(),
						end: currentEndTime.valueOf(),
					})

					currentStartTime = currentEndTime
				}

				const chunkResults = await Promise.all(
					timeChunks.map(async (chunk, index) => {
						let chunkTransactions = []
						let nextCursor = ''

						do {
							const response = await client.getTransactionLog({
								accountType: 'UNIFIED',
								startTime: chunk.start,
								endTime: chunk.end,
								cursor: nextCursor || undefined,
								limit: 50,
							})

							if (response.retCode !== 0) {
								throw ApiError.BadRequest(
									i18next.t('errors.api_error', {
										lng,
										exchange: 'Bybit',
										error: response.retMsg,
									})
								)
							}

							if (response.result.list && response.result.list.length > 0) {
								chunkTransactions = [
									...chunkTransactions,
									...response.result.list,
								]
							}

							nextCursor = response.result.nextPageCursor

							await Helpers.delayApi(100)
						} while (nextCursor)

						return chunkTransactions
					})
				)

				allTransactions = chunkResults.flat()
			} else {
				let nextCursor = ''

				do {
					const response = await client.getTransactionLog({
						accountType: 'UNIFIED',
						startTime: startTime.valueOf(),
						endTime: endTime.valueOf(),
						cursor: nextCursor || undefined,
						limit: 50,
					})

					if (response.retCode !== 0) {
						throw ApiError.BadRequest(
							i18next.t('errors.api_error', {
								lng,
								exchange: 'Bybit',
								error: response.retMsg,
							})
						)
					}

					if (response.result.list && response.result.list.length > 0) {
						allTransactions = [...allTransactions, ...response.result.list]
					}

					nextCursor = response.result.nextPageCursor

					await Helpers.delayApi(100)
				} while (nextCursor)
			}

			const transactions = allTransactions.map(
				item => new BybitTransactionDto(item)
			)

			const plainObjects = allTransactions.map(item => ({
				transactionTime: parseInt(item.transactionTime),
				change: parseFloat(Number(item.change || 0).toFixed(8)),
				cashFlow: parseFloat(Number(item.cashFlow || 0).toFixed(8)),
				cashBalance: parseFloat(Number(item.cashBalance || 0).toFixed(8)),
			}))

			await Helpers.setToCache(
				cacheKey,
				plainObjects,
				300,
				'getBybitWalletChanges'
			)

			return transactions
		} catch (error) {
			Helpers.handleApiError(
				error,
				lng,
				'getBybitWalletChanges',
				'errors.fetch_wallet_changes_error',
				'Bybit'
			)
		}
	}

	async getBybitTransactions(
		lng = 'en',
		keys,
		start_time,
		end_time,
		sort,
		search,
		page,
		limit
	) {
		const cacheKey = Helpers.generateCacheKey(
			'bybit',
			'transactions',
			start_time,
			end_time,
			page,
			limit
		)

		const cachedData = await Helpers.getFromCache(
			cacheKey,
			'getBybitTransactions'
		)
		if (cachedData) {
			const transactions = cachedData.map(item => new BybitTransactionDto(item))

			let filteredTransactions = transactions

			if (search) {
				const searchLower = search.toLowerCase()
				filteredTransactions = transactions.filter(
					transaction =>
						transaction.symbol?.toLowerCase().includes(searchLower) ||
						transaction.type?.toLowerCase().includes(searchLower) ||
						transaction.category?.toLowerCase().includes(searchLower) ||
						transaction.side?.toLowerCase().includes(searchLower)
				)
			}

			if (sort && sort.type) {
				filteredTransactions.sort((a, b) => {
					const aValue = a[sort.type]
					const bValue = b[sort.type]

					if (sort.type === 'transactionTime' || sort.type === 'date') {
						return sort.value === 'asc' ? aValue - bValue : bValue - aValue
					}

					if (typeof aValue === 'number' && typeof bValue === 'number') {
						return sort.value === 'asc' ? aValue - bValue : bValue - aValue
					}

					if (typeof aValue === 'string' && typeof bValue === 'string') {
						return sort.value === 'asc'
							? aValue.localeCompare(bValue)
							: bValue.localeCompare(aValue)
					}

					return 0
				})
			}

			const pageSize = limit || 50
			const currentPage = page || 1
			const startIndex = (currentPage - 1) * pageSize
			const endIndex = startIndex + pageSize
			const paginatedTransactions = filteredTransactions.slice(
				startIndex,
				endIndex
			)

			return {
				transactions: paginatedTransactions,
				total: filteredTransactions.length,
				totalPages: Math.ceil(filteredTransactions.length / pageSize),
			}
		}

		const client = new RestClientV5({
			testnet: false,
			key: keys.api,
			secret: keys.secret,
		})

		try {
			const startTime = moment(start_time)
			const endTime = moment(end_time)
			const diffDays = endTime.diff(startTime, 'days')

			let allTransactions = []

			if (diffDays > 7) {
				const timeChunks = []
				let currentStartTime = startTime.clone()
				const endLimit = endTime.clone()

				while (currentStartTime.isBefore(endLimit)) {
					const currentEndTime = moment.min(
						currentStartTime.clone().add(7, 'days'),
						endLimit
					)

					timeChunks.push({
						start: currentStartTime.valueOf(),
						end: currentEndTime.valueOf(),
					})

					currentStartTime = currentEndTime
				}

				const chunkResults = await Promise.all(
					timeChunks.map(async (chunk, index) => {
						let chunkTransactions = []
						let nextCursor = ''

						do {
							const response = await client.getTransactionLog({
								accountType: 'UNIFIED',
								startTime: chunk.start,
								endTime: chunk.end,
								cursor: nextCursor || undefined,
								limit: 50,
							})

							if (response.retCode !== 0) {
								throw ApiError.BadRequest(
									i18next.t('errors.api_error', {
										lng,
										exchange: 'Bybit',
										error: response.retMsg,
									})
								)
							}

							if (response.result.list && response.result.list.length > 0) {
								chunkTransactions = [
									...chunkTransactions,
									...response.result.list,
								]
							}

							nextCursor = response.result.nextPageCursor

							await Helpers.delayApi(100)
						} while (nextCursor)

						return chunkTransactions
					})
				)

				allTransactions = chunkResults.flat()
			} else {
				let nextCursor = ''

				do {
					const response = await client.getTransactionLog({
						accountType: 'UNIFIED',
						startTime: startTime.valueOf(),
						endTime: endTime.valueOf(),
						cursor: nextCursor || undefined,
						limit: 50,
					})

					if (response.retCode !== 0) {
						throw ApiError.BadRequest(
							i18next.t('errors.api_error', {
								lng,
								exchange: 'Bybit',
								error: response.retMsg,
							})
						)
					}

					if (response.result.list && response.result.list.length > 0) {
						allTransactions = [...allTransactions, ...response.result.list]
					}

					nextCursor = response.result.nextPageCursor

					await Helpers.delayApi(100)
				} while (nextCursor)
			}

			const transactions = allTransactions.map(
				item => new BybitTransactionDto(item)
			)

			const paginatedResult = await Helpers.paginate(
				transactions,
				page || 1,
				limit || 50,
				sort,
				search,
				['symbol', 'type', 'category', 'side']
			)

			const plainObjects = allTransactions.map(item => ({
				transactionTime: parseInt(item.transactionTime),
				change: parseFloat(Number(item.change || 0).toFixed(4)),
				cashFlow: parseFloat(Number(item.cashFlow || 0).toFixed(4)),
				cashBalance: parseFloat(Number(item.cashBalance || 0).toFixed(4)),
				symbol: item.symbol || '',
				category: item.category || '',
				side: item.side || '',
				type: item.type || '',
				funding: parseFloat(Number(item.funding || 0).toFixed(4)),
				fee: parseFloat(Number(item.fee || 0).toFixed(4)),
			}))

			await Helpers.setToCache(
				cacheKey,
				plainObjects,
				300,
				'getBybitTransactions'
			)

			return {
				transactions: paginatedResult.items,
				total: paginatedResult.total,
				totalPages: paginatedResult.totalPages,
			}
		} catch (error) {
			Helpers.handleApiError(
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
