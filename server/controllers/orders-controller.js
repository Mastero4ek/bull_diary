const Helpers = require('../helpers/helpers')
const OrdersService = require('../service/orders-service')
const { validationResult } = require('express-validator')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')

class OrdersController {
	async savedOrder(req, res, next) {
		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				throw ApiError.BadRequest(
					i18next.t('errors.order_required', { lng: req.lng })
				)
			}

			const { order, exchange } = req.body
			const user = req.user
			const new_order = await OrdersService.savedOrder(
				req.lng,
				user.id,
				order,
				exchange
			)

			return res.json(new_order)
		} catch (e) {
			next(e)
		}
	}

	async removedOrder(req, res, next) {
		try {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				throw ApiError.BadRequest(
					i18next.t('errors.order_required', { lng: req.lng })
				)
			}

			const {
				order,
				exchange,
				page,
				limit,
				sort,
				search,
				start_time,
				end_time,
			} = req.body
			const user = req.user
			const orders = await OrdersService.removedOrder(
				req.lng,
				user.id,
				start_time,
				end_time,
				order,
				exchange
			)
			const paginated_orders = await Helpers.paginate(
				orders,
				page,
				limit,
				sort,
				search
			)
			const total = await Helpers.calculateTotalPnl(orders)

			return res.json({
				orders: paginated_orders.items,
				total_pages: paginated_orders.totalPages,
				total_profit: +total.profit,
				total_loss: +total.loss,
			})
		} catch (e) {
			next(e)
		}
	}

	async getBybitSavedOrders(req, res, next) {
		try {
			const { sort, search, page, limit, start_time, end_time, exchange } =
				req.query
			const parsedPage = page ? parseInt(page) : undefined
			const parsedLimit = limit ? parseInt(limit) : undefined

			if (!exchange) {
				throw ApiError.BadRequest(
					i18next.t('errors.exchange_required', { lng: req.lng })
				)
			}

			if (!start_time || !end_time) {
				throw ApiError.BadRequest(
					i18next.t('errors.time_range_required', { lng: req.lng })
				)
			}

			const { all } = req.params
			const user = req.user

			if (all === 'all') {
				const result = await OrdersService.getBybitSavedOrders(
					req.lng,
					user.id,
					start_time,
					end_time,
					exchange,
					null, // sort
					null, // search
					null, // page
					null // limit
				)
				const total = await Helpers.calculateTotalPnl(result.orders)

				return res.json({
					orders: result.orders,
					total_pages: 1,
					total_profit: +total.profit,
					total_loss: +total.loss,
				})
			}

			const result = await OrdersService.getBybitSavedOrders(
				req.lng,
				user.id,
				start_time,
				end_time,
				exchange,
				sort,
				search,
				parsedPage,
				parsedLimit
			)
			const total = await Helpers.calculateTotalPnl(result.orders)

			return res.json({
				orders: result.orders,
				total_pages: result.totalPages,
				total_profit: +total.profit,
				total_loss: +total.loss,
			})
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new OrdersController()
