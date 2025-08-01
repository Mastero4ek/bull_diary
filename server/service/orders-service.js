const OrderDto = require('../dtos/order-dto')
const OrderModel = require('../models/order-model')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')
const Helpers = require('../helpers/helpers')

class OrdersService {
	async savedOrder(lng = 'en', userId, order, exchange) {
		try {
			if (!userId) {
				throw ApiError.BadRequest(i18next.t('errors.user_id_required', { lng }))
			}

			if (!order) {
				throw ApiError.BadRequest(i18next.t('errors.order_required', { lng }))
			}

			if (!order.id) {
				throw ApiError.BadRequest(
					i18next.t('errors.order_id_required', { lng })
				)
			}

			if (!exchange) {
				throw ApiError.BadRequest(
					i18next.t('errors.exchange_required', { lng })
				)
			}

			const existing_order = await OrderModel.findOne({
				user: userId,
				exchange,
				id: order.id,
			})

			if (existing_order) {
				throw ApiError.BadRequest(i18next.t('errors.order_exists', { lng }))
			}

			const new_order = await OrderModel.create({
				user: userId,
				exchange,
				id: order.id,
				symbol: order.symbol,
				closed_time: new Date(order.closed_time).toISOString(),
				open_time: new Date(order.open_time).toISOString(),
				direction: order.direction,
				leverage: order.leverage,
				quality: order.quality,
				margin: order.margin,
				pnl: order.pnl,
				roe: order.roe,
			})

			const order_dto = new OrderDto(new_order)

			return { order: order_dto }
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'savedOrder',
				'errors.order_save_failed'
			)
		}
	}

	async removedOrder(
		lng = 'en',
		userId,
		start_time,
		end_time,
		order,
		exchange
	) {
		try {
			if (!userId) {
				throw ApiError.BadRequest(i18next.t('errors.user_id_required', { lng }))
			}

			if (!order) {
				throw ApiError.BadRequest(i18next.t('errors.order_required', { lng }))
			}

			if (!order.id) {
				throw ApiError.BadRequest(
					i18next.t('errors.order_id_required', { lng })
				)
			}

			if (!exchange) {
				throw ApiError.BadRequest(
					i18next.t('errors.exchange_required', { lng })
				)
			}

			if (!start_time || !end_time) {
				throw ApiError.BadRequest(
					i18next.t('errors.time_range_required', { lng })
				)
			}

			const removed_order = await OrderModel.findOneAndDelete({
				user: userId,
				exchange,
				id: order.id,
			})

			if (!removed_order) {
				throw ApiError.BadRequest(
					i18next.t('errors.order_not_found_or_deleted', { lng })
				)
			}

			const all_orders = await OrderModel.find({
				user: userId,
				exchange,
				closed_time: {
					$gte: new Date(start_time).toISOString(),
					$lte: new Date(end_time).toISOString(),
				},
				open_time: {
					$gte: new Date(start_time).toISOString(),
					$lte: new Date(end_time).toISOString(),
				},
			})

			const orders = all_orders.map(item => new OrderDto(item))

			return orders
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'removedOrder',
				'errors.order_removal_failed'
			)
		}
	}

	async getBybitSavedOrders(
		lng = 'en',
		userId,
		start_time,
		end_time,
		exchange,
		sort,
		search,
		page,
		limit
	) {
		try {
			if (!userId) {
				throw ApiError.BadRequest(i18next.t('errors.user_id_required', { lng }))
			}

			if (!exchange) {
				throw ApiError.BadRequest(
					i18next.t('errors.exchange_required', { lng })
				)
			}

			if (!start_time || !end_time) {
				throw ApiError.BadRequest(
					i18next.t('errors.time_range_required', { lng })
				)
			}

			if (page === null || limit === null) {
				//
			} else {
				if (!page || page < 1) {
					throw ApiError.BadRequest(
						i18next.t('errors.invalid_page_number', { lng })
					)
				}

				if (!limit || limit < 1 || limit > 100) {
					throw ApiError.BadRequest(
						i18next.t('errors.invalid_limit_value', { lng })
					)
				}
			}

			const filter = {
				user: userId,
				exchange,
				closed_time: {
					$gte: new Date(start_time).toISOString(),
					$lte: new Date(end_time).toISOString(),
				},
				open_time: {
					$gte: new Date(start_time).toISOString(),
					$lte: new Date(end_time).toISOString(),
				},
			}

			if (search && search.trim() !== '') {
				filter.$or = [
					{ symbol: { $regex: search, $options: 'i' } },
					{ direction: { $regex: search, $options: 'i' } },
				]
			}

			const total = await OrderModel.countDocuments(filter)

			let sortObj = {}

			if (sort && typeof sort === 'object' && sort.type && sort.value) {
				sortObj[sort.type] = sort.value === 'asc' ? 1 : -1
			} else {
				sortObj.closed_time = -1
			}

			let totalPages = 1
			let all_orders

			if (page === null || limit === null) {
				all_orders = await OrderModel.find(filter).sort(sortObj)
			} else {
				totalPages = Math.ceil(total / limit)
				all_orders = await OrderModel.find(filter)
					.sort(sortObj)
					.skip((page - 1) * limit)
					.limit(limit)
			}

			const orders = all_orders.map(item => new OrderDto(item))

			return {
				orders,
				total,
				totalPages,
			}
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'getBybitSavedOrders',
				'errors.orders_fetch_failed'
			)
		}
	}
}

module.exports = new OrdersService()
