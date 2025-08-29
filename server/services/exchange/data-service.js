const moment = require('moment')
const mongoose = require('mongoose')

const { logger } = require('@configs/logger-config')
const BybitOrderDto = require('@dtos/bybit-order-dto')
const BybitTransactionDto = require('@dtos/bybit-transaction-dto')
const { handleApiError } = require('@helpers/error-helpers')
const Order = require('@models/core/order-model')
const Transaction = require('@models/core/transaction-model')

class DataService {
	/**
	 * Универсальная функция для расчета ROI
	 * @param {Object} model - Модель с данными ордера
	 * @returns {number} - Рассчитанный ROI
	 */
	calculateRoi(model) {
		const qty = parseFloat(model.quality || model.qty) || 0
		const leverage = parseFloat(model.leverage) || 1
		const avgEntryPrice = parseFloat(model.avgEntryPrice) || 0
		const closedPnl = parseFloat(model.pnl || model.closedPnl) || 0

		if (qty <= 0 || leverage <= 0 || avgEntryPrice <= 0) {
			return 0
		}

		const initialMargin = (qty * avgEntryPrice) / leverage
		const roi = initialMargin > 0 ? (closedPnl / initialMargin) * 100 : 0

		return roi
	}

	/**
	 * Вычисляет ROI для открытой позиции
	 * @param {Object} position - Данные позиции
	 * @returns {number} ROI в процентах
	 */
	calculateUnrealisedRoi(position) {
		const positionValue = Number(position.positionValue)
		const unrealisedPnl = Number(position.unrealisedPnl)

		if (positionValue > 0) {
			return Number(((unrealisedPnl / positionValue) * 100).toFixed(2))
		}

		return 0
	}

	/**
	 * Создает временные интервалы для разбивки больших периодов на чанки
	 * @param {Date|string|number} startTime - Время начала периода
	 * @param {Date|string|number} endTime - Время окончания периода
	 * @param {number} maxDays - Максимальное количество дней в одном чанке
	 * @returns {Array} - Массив объектов с полями start и end (в миллисекундах)
	 */
	createTimeChunks(startTime, endTime, maxDays = 7) {
		const timeChunks = []
		let currentStartTime = moment(startTime)
		const endLimit = moment(endTime)

		while (currentStartTime.isBefore(endLimit)) {
			const currentEndTime = moment.min(
				currentStartTime.clone().add(maxDays, 'days'),
				endLimit
			)

			timeChunks.push({
				start: currentStartTime.unix() * 1000,
				end: currentEndTime.unix() * 1000,
			})

			currentStartTime = currentEndTime
		}

		return timeChunks
	}

	/**
	 * Трансформирует данные ордеров из API в формат для сохранения в БД
	 * @param {Array} allOrders - Массив ордеров из API
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи (по умолчанию 'bybit')
	 * @returns {Array} - Массив ордеров в формате для БД
	 */
	transformOrdersToDbFormat(allOrders, userId, exchange = 'bybit') {
		return allOrders
			.filter(orderData => {
				return (
					orderData &&
					orderData.orderId &&
					orderData.symbol &&
					orderData.side &&
					orderData.updatedTime &&
					orderData.createdTime
				)
			})
			.map(orderData => {
				const updatedTime = orderData.updatedTime
					? +orderData.updatedTime
					: Date.now()
				const createdTime = orderData.createdTime
					? +orderData.createdTime
					: Date.now()

				return {
					user: userId,
					exchange: exchange.toLowerCase(),
					bookmark: false,
					id: orderData.orderId || '',
					symbol: orderData.symbol || '',
					closed_time: new Date(updatedTime),
					open_time: new Date(createdTime),
					direction: orderData.side || 'Buy',
					leverage: parseFloat(orderData.leverage) || 1,
					quality: parseFloat(orderData.qty) || 0,
					margin: parseFloat(orderData.cumEntryValue) || 0,
					avgEntryPrice: parseFloat(orderData.avgEntryPrice) || 0,
					open_fee: parseFloat(orderData.openFee) || 0,
					closed_fee: parseFloat(orderData.closeFee) || 0,
					pnl: parseFloat(orderData.closedPnl) || 0,
					roi: orderData ? parseFloat(this.calculateRoi(orderData)) || 0 : 0,
					sync_time: new Date(),
				}
			})
	}

	/**
	 * Трансформирует данные транзакций из API в формат для сохранения в БД
	 * @param {Array} allTransactions - Массив транзакций из API
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи (по умолчанию 'bybit')
	 * @returns {Array} - Массив транзакций в формате для БД
	 */
	transformTransactionsToDbFormat(allTransactions, userId, exchange = 'bybit') {
		return allTransactions
			.filter(transactionData => {
				return (
					transactionData &&
					transactionData.transactionTime &&
					transactionData.type
				)
			})
			.map(transactionData => {
				let transactionTime
				if (typeof transactionData.transactionTime === 'string') {
					if (
						transactionData.transactionTime.includes('-') ||
						transactionData.transactionTime.includes('T')
					) {
						transactionTime = new Date(
							transactionData.transactionTime
						).getTime()
					} else {
						transactionTime = parseInt(transactionData.transactionTime)
					}
				} else if (typeof transactionData.transactionTime === 'number') {
					transactionTime = transactionData.transactionTime
				} else {
					transactionTime = Date.now()
				}

				if (isNaN(transactionTime) || transactionTime <= 0) {
					transactionTime = Date.now()
				}

				const symbol =
					transactionData.symbol && transactionData.symbol.trim() !== ''
						? transactionData.symbol
						: transactionData.currency || ''

				if (!transactionData.symbol || transactionData.symbol.trim() === '') {
					//
				} else {
					//
				}

				return {
					user: userId,
					exchange: exchange.toLowerCase(),
					bookmark: false,
					transactionTime: new Date(transactionTime),
					symbol,
					currency: transactionData.currency || '',
					category: transactionData.category || '',
					side: transactionData.side || '',
					type: transactionData.type || 'unknown',
					change: parseFloat(transactionData.change || 0),
					cashFlow: parseFloat(transactionData.cashFlow || 0),
					cashBalance:
						transactionData.cashBalance !== null &&
						transactionData.cashBalance !== undefined
							? parseFloat(transactionData.cashBalance)
							: null,
					funding: parseFloat(transactionData.funding || 0),
					fee: parseFloat(transactionData.fee || 0),
					sync_time: new Date(),
				}
			})
	}

	/**
	 * Фильтрует существующие ордера, удаляя дубликаты и уже сохраненные в БД
	 * @param {Array} transformedOrders - Массив трансформированных ордеров
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи (по умолчанию 'bybit')
	 * @returns {Promise<Array>} - Массив новых ордеров для сохранения
	 */
	async filterExistingOrders(transformedOrders, userId, exchange = 'bybit') {
		const uniqueIncomingOrders = []
		const seenIncomingKeys = new Set()

		for (const order of transformedOrders) {
			const openTime =
				order.open_time instanceof Date
					? order.open_time.toISOString()
					: new Date(order.open_time).toISOString()

			const key = `${exchange.toLowerCase()}_${openTime}_${
				order.symbol
			}_${userId}`

			if (!seenIncomingKeys.has(key)) {
				seenIncomingKeys.add(key)
				uniqueIncomingOrders.push(order)
			} else {
				//
			}
		}

		const existingKeysInDbSet = new Set()
		if (uniqueIncomingOrders.length > 0) {
			const dbQueryKeys = uniqueIncomingOrders.map(order => ({
				exchange: exchange.toLowerCase(),
				open_time: order.open_time,
				symbol: order.symbol,
				user: userId,
			}))

			const existingOrdersInDb = await Order.find({
				$or: dbQueryKeys,
			})

			existingOrdersInDb.forEach(order => {
				const key = `${order.exchange}_${order.open_time.toISOString()}_${
					order.symbol
				}_${order.user}`
				existingKeysInDbSet.add(key)
			})
		}

		const trulyNewOrders = uniqueIncomingOrders.filter(order => {
			const openTime =
				order.open_time instanceof Date
					? order.open_time.toISOString()
					: new Date(order.open_time).toISOString()
			const key = `${exchange.toLowerCase()}_${openTime}_${
				order.symbol
			}_${userId}`
			const isNew = !existingKeysInDbSet.has(key)

			if (!isNew) {
				//
			}

			return isNew
		})

		return trulyNewOrders
	}

	/**
	 * Фильтрует существующие транзакции, удаляя дубликаты и уже сохраненные в БД
	 * @param {Array} transformedTransactions - Массив трансформированных транзакций
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи (по умолчанию 'bybit')
	 * @returns {Promise<Array>} - Массив новых транзакций для сохранения
	 */
	async filterExistingTransactions(
		transformedTransactions,
		userId,
		exchange = 'bybit'
	) {
		const uniqueIncomingTransactions = []
		const seenIncomingKeys = new Set()

		for (const transaction of transformedTransactions) {
			const txTime =
				transaction.transactionTime instanceof Date
					? transaction.transactionTime.toISOString()
					: new Date(transaction.transactionTime).toISOString()

			const key = `${exchange.toLowerCase()}_${txTime}_${
				transaction.type
			}_${userId}`

			if (!seenIncomingKeys.has(key)) {
				seenIncomingKeys.add(key)
				uniqueIncomingTransactions.push(transaction)
			} else {
				//
			}
		}

		const existingKeysInDbSet = new Set()
		if (uniqueIncomingTransactions.length > 0) {
			const dbQueryKeys = uniqueIncomingTransactions.map(transaction => ({
				exchange: exchange.toLowerCase(),
				transactionTime: transaction.transactionTime,
				type: transaction.type,
				user: userId,
			}))

			const existingTransactionsInDb = await Transaction.find({
				$or: dbQueryKeys,
			})

			existingTransactionsInDb.forEach(transaction => {
				const key = `${
					transaction.exchange
				}_${transaction.transactionTime.toISOString()}_${transaction.type}_${
					transaction.user
				}`
				existingKeysInDbSet.add(key)
			})
		}

		const trulyNewTransactions = uniqueIncomingTransactions.filter(
			transaction => {
				const txTime =
					transaction.transactionTime instanceof Date
						? transaction.transactionTime.toISOString()
						: new Date(transaction.transactionTime).toISOString()
				const key = `${exchange.toLowerCase()}_${txTime}_${
					transaction.type
				}_${userId}`
				const isNew = !existingKeysInDbSet.has(key)

				if (!isNew) {
					//
				}

				return isNew
			}
		)

		return trulyNewTransactions
	}

	/**
	 * Сохраняет ордера в базу данных с обработкой дубликатов
	 * @param {Array} transformedOrders - Массив трансформированных ордеров
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи (по умолчанию 'bybit')
	 * @returns {Promise<Array>} - Массив сохраненных ордеров
	 */
	async saveOrdersToDatabase(transformedOrders, userId, exchange = 'bybit') {
		const newOrdersToInsert = await this.filterExistingOrders(
			transformedOrders,
			userId,
			exchange
		)

		if (newOrdersToInsert.length > 0) {
			try {
				return await Order.insertMany(newOrdersToInsert)
			} catch (error) {
				if (error.code === 11000) {
					const savedOrders = []
					for (const order of newOrdersToInsert) {
						try {
							const savedOrder = await Order.create(order)
							savedOrders.push(savedOrder)
						} catch (duplicateError) {
							if (duplicateError.code !== 11000) {
								throw duplicateError
							}
							//
						}
					}
					return savedOrders
				}
				throw error
			}
		}

		return []
	}

	/**
	 * Сохраняет транзакции в базу данных с обработкой дубликатов
	 * @param {Array} transformedTransactions - Массив трансформированных транзакций
	 * @param {string} userId - ID пользователя
	 * @param {string} exchange - Название биржи (по умолчанию 'bybit')
	 * @returns {Promise<Array>} - Массив сохраненных транзакций
	 */
	async saveTransactionsToDatabase(
		transformedTransactions,
		userId,
		exchange = 'bybit'
	) {
		const newTransactionsToInsert = await this.filterExistingTransactions(
			transformedTransactions,
			userId,
			exchange
		)

		if (newTransactionsToInsert.length > 0) {
			logger.info(
				`Attempting to save ${newTransactionsToInsert.length} transactions`
			)
			try {
				const result = await Transaction.insertMany(newTransactionsToInsert)
				logger.info(`Successfully saved ${result.length} transactions`)
				return result
			} catch (error) {
				if (error.code === 11000) {
					logger.warn(
						`Duplicate key error, trying individual saves for ${newTransactionsToInsert.length} transactions`
					)
					const savedTransactions = []
					let duplicateCount = 0
					let errorCount = 0

					for (const transaction of newTransactionsToInsert) {
						try {
							const savedTransaction = await Transaction.create(transaction)
							savedTransactions.push(savedTransaction)
						} catch (duplicateError) {
							if (duplicateError.code === 11000) {
								duplicateCount++
								logger.info(
									`Skipping duplicate transaction: ${transaction.type} at ${transaction.transactionTime} with symbol: ${transaction.symbol}`
								)
							} else {
								errorCount++
								logger.error(
									`Error saving transaction: ${duplicateError.message}`
								)
								throw duplicateError
							}
						}
					}

					logger.info(
						`Individual save results: ${savedTransactions.length} saved, ${duplicateCount} duplicates, ${errorCount} errors`
					)
					return savedTransactions
				}
				throw error
			}
		}

		return []
	}

	/**
	 * Получает ордера из базы данных с пагинацией и фильтрацией
	 * @param {string} userId - ID пользователя
	 * @param {Date|string} start_time - Время начала периода
	 * @param {Date|string} end_time - Время окончания периода
	 * @param {Object} sort - Параметры сортировки {type, value}
	 * @param {string} search - Строка поиска
	 * @param {number} page - Номер страницы
	 * @param {number} limit - Количество записей на странице
	 * @param {boolean} bookmarks - Фильтр по закладкам
	 * @param {string} exchange - Название биржи (по умолчанию 'bybit')
	 * @param {string} lng - Язык для локализации ошибок
	 * @returns {Promise<Object>} - Объект с ордерами, общим количеством и количеством страниц
	 */
	async getOrdersFromDb(
		userId,
		start_time,
		end_time,
		sort,
		search,
		page,
		limit,
		bookmarks,
		exchange = 'bybit',
		lng = 'en'
	) {
		const filter = {
			user: userId,
			exchange: exchange.toLowerCase(),
			open_time: { $gte: new Date(start_time) },
			closed_time: { $lte: new Date(end_time) },
		}

		if (bookmarks) {
			filter.bookmark = true
		}

		if (search && search.trim()) {
			const searchRegex = new RegExp(search.trim(), 'i')
			filter.$or = [{ symbol: searchRegex }, { direction: searchRegex }]
		}

		const sortOptions = {}
		if (sort && sort.type) {
			sortOptions[sort.type] = sort.value === 'asc' ? 1 : -1
		} else {
			sortOptions.closed_time = -1
		}

		const pageNum = page || 1
		const limitNum = limit || 10
		const skip = (pageNum - 1) * limitNum

		try {
			const total = await Order.countDocuments(filter)

			const orders = await Order.find(filter)
				.sort(sortOptions)
				.skip(skip)
				.limit(limitNum)
				.lean()

			const orderDtos = orders.map(item => new BybitOrderDto(item))

			return {
				orders: orderDtos,
				total,
				totalPages: Math.ceil(total / limitNum),
			}
		} catch (error) {
			handleApiError(
				error,
				lng,
				'getOrdersFromDb',
				'errors.fetch_orders_error',
				exchange
			)
		}
	}

	/**
	 * Получает транзакции из базы данных с пагинацией и фильтрацией
	 * @param {string} userId - ID пользователя
	 * @param {Date|string} start_time - Время начала периода
	 * @param {Date|string} end_time - Время окончания периода
	 * @param {Object} sort - Параметры сортировки {type, value}
	 * @param {string} search - Строка поиска
	 * @param {number} page - Номер страницы
	 * @param {number} limit - Количество записей на странице
	 * @param {boolean} bookmarks - Фильтр по закладкам
	 * @param {string} exchange - Название биржи (по умолчанию 'bybit')
	 * @param {string} lng - Язык для локализации ошибок
	 * @returns {Promise<Object>} - Объект с транзакциями, общим количеством и количеством страниц
	 */
	async getTransactionsFromDb(
		userId,
		start_time,
		end_time,
		sort,
		search,
		page,
		limit,
		bookmarks,
		exchange = 'bybit',
		lng = 'en'
	) {
		const filter = {
			user: userId,
			exchange: exchange.toLowerCase(),
			transactionTime: {
				$gte: new Date(start_time),
				$lte: new Date(end_time),
			},
		}

		if (bookmarks) {
			filter.bookmark = true
		}

		if (search && search.trim()) {
			const searchRegex = new RegExp(search.trim(), 'i')
			filter.$or = [
				{ symbol: searchRegex },
				{ type: searchRegex },
				{ category: searchRegex },
				{ side: searchRegex },
			]
		}

		const sortOptions = {}
		if (sort && sort.type) {
			sortOptions[sort.type] = sort.value === 'asc' ? 1 : -1
		} else {
			sortOptions.transactionTime = -1
		}

		const pageNum = page || 1
		const limitNum = limit || 50
		const skip = (pageNum - 1) * limitNum

		try {
			const total = await Transaction.countDocuments(filter)

			const transactions = await Transaction.find(filter)
				.sort(sortOptions)
				.skip(skip)
				.limit(limitNum)

			const transactionDtos = transactions.map(
				item => new BybitTransactionDto(item)
			)

			return {
				transactions: transactionDtos,
				total,
				totalPages: Math.ceil(total / limitNum),
			}
		} catch (error) {
			handleApiError(
				error,
				lng,
				'getTransactionsFromDb',
				'errors.fetch_transactions_error',
				exchange
			)
		}
	}

	/**
	 * Рассчитывает общий PnL (прибыль/убыток) для ордеров пользователя
	 * @param {string} userId - ID пользователя
	 * @param {Date|string} start_time - Время начала периода
	 * @param {Date|string} end_time - Время окончания периода
	 * @param {boolean} bookmarks - Фильтр по закладкам
	 * @param {string} search - Строка поиска
	 * @param {string} exchange - Название биржи (по умолчанию 'bybit')
	 * @param {string} lng - Язык для локализации ошибок
	 * @returns {Promise<Object>} - Объект с общей прибылью, убытком и количеством ордеров
	 */
	async calculateTotalPnlFromDb(
		userId,
		start_time,
		end_time,
		bookmarks,
		search,
		exchange = 'bybit',
		lng = 'en'
	) {
		const filter = {
			user: new mongoose.Types.ObjectId(userId),
			open_time: { $gte: new Date(start_time) },
			closed_time: { $lte: new Date(end_time) },
			exchange: exchange.toLowerCase(),
		}

		if (bookmarks) {
			filter.bookmark = true
		}

		if (search && search.trim()) {
			const searchRegex = new RegExp(search.trim(), 'i')
			filter.$or = [{ symbol: searchRegex }, { direction: searchRegex }]
		}

		try {
			const result = await Order.aggregate([
				{ $match: filter },
				{
					$group: {
						_id: null,
						totalProfit: {
							$sum: {
								$cond: [{ $gte: ['$roi', 0] }, '$roi', 0],
							},
						},
						totalLoss: {
							$sum: {
								$cond: [{ $lt: ['$roi', 0] }, '$roi', 0],
							},
						},
						totalOrders: { $sum: 1 },
					},
				},
			])

			const totals = result[0] || {
				totalProfit: 0,
				totalLoss: 0,
				totalOrders: 0,
			}

			return {
				profit: parseFloat(totals.totalProfit).toFixed(2),
				loss: parseFloat(totals.totalLoss).toFixed(2),
				totalOrders: totals.totalOrders,
			}
		} catch (error) {
			handleApiError(
				error,
				lng,
				'calculateTotalPnlFromDb',
				'errors.fetch_orders_error',
				exchange
			)
		}
	}

	/**
	 * Рассчитывает общую прибыль и убытки для ордеров пользователя через агрегацию в БД
	 * @param {string} userId - ID пользователя
	 * @param {Date|string} start_time - Время начала периода
	 * @param {Date|string} end_time - Время окончания периода
	 * @param {boolean} bookmarks - Фильтр по закладкам
	 * @param {string} search - Строка поиска
	 * @param {string} exchange - Название биржи (по умолчанию 'bybit')
	 * @param {string} lng - Язык для локализации ошибок
	 * @returns {Promise<Object>} - Объект с общей прибылью, убытком и количеством ордеров
	 */
	async calculateTotalProfitFromDb(
		userId,
		start_time,
		end_time,
		bookmarks,
		search,
		exchange = 'bybit',
		lng = 'en'
	) {
		const filter = {
			user: new mongoose.Types.ObjectId(userId),
			open_time: { $gte: new Date(start_time) },
			closed_time: { $lte: new Date(end_time) },
			exchange: exchange.toLowerCase(),
		}

		if (bookmarks) {
			filter.bookmark = true
		}

		if (search && search.trim()) {
			const searchRegex = new RegExp(search.trim(), 'i')
			filter.$or = [{ symbol: searchRegex }, { direction: searchRegex }]
		}

		try {
			const result = await Order.aggregate([
				{ $match: filter },
				{
					$group: {
						_id: null,
						totalProfit: {
							$sum: {
								$cond: [{ $gte: ['$roi', 0] }, '$pnl', 0],
							},
						},
						totalLoss: {
							$sum: {
								$cond: [{ $lt: ['$roi', 0] }, '$pnl', 0],
							},
						},
						profitCount: {
							$sum: {
								$cond: [{ $gte: ['$roi', 0] }, 1, 0],
							},
						},
						lossCount: {
							$sum: {
								$cond: [{ $lt: ['$roi', 0] }, 1, 0],
							},
						},
					},
				},
			])

			const totals = result[0] || {
				totalProfit: 0,
				totalLoss: 0,
				profitCount: 0,
				lossCount: 0,
			}

			return {
				profit: parseFloat(totals.totalProfit).toFixed(2),
				loss: parseFloat(totals.totalLoss).toFixed(2),
				profitCount: parseFloat(totals.profitCount),
				lossCount: parseFloat(totals.lossCount),
			}
		} catch (error) {
			handleApiError(
				error,
				lng,
				'calculateTotalProfitFromDb',
				'errors.fetch_orders_error',
				exchange
			)
		}
	}

	/**
	 * Рассчитывает ROI для конкретного ордера через агрегацию в БД
	 * @param {string} orderId - ID ордера
	 * @param {string} lng - Язык для локализации ошибок
	 * @returns {Promise<number>} - Рассчитанный ROI
	 */
	async calculateRoiFromDb(orderId, lng = 'en') {
		try {
			const result = await Order.aggregate([
				{ $match: { _id: new mongoose.Types.ObjectId(orderId) } },
				{
					$project: {
						roi: {
							$cond: {
								if: {
									$and: [
										{ $gt: ['$qty', 0] },
										{ $gt: ['$leverage', 0] },
										{ $gt: ['$avgEntryPrice', 0] },
									],
								},
								then: {
									$multiply: [
										{
											$divide: [
												'$pnl',
												{
													$divide: [
														{ $multiply: ['$qty', '$avgEntryPrice'] },
														'$leverage',
													],
												},
											],
										},
										100,
									],
								},
								else: 0,
							},
						},
					},
				},
			])

			const order = result[0]
			return order ? parseFloat(order.roi) || 0 : 0
		} catch (error) {
			handleApiError(
				error,
				lng,
				'calculateRoiFromDb',
				'errors.fetch_orders_error'
			)
			return 0
		}
	}
}

module.exports = new DataService()
