const OrdersService = require('../services/orders-service')
const { validationError } = require('../helpers/validation-helpers')

class OrdersController {
	async savedOrder(req, res, next) {
		try {
			validationError(req, next)

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
			validationError(req, next)

			const { order, exchange } = req.body
			const user = req.user
			const removed_order = await OrdersService.removedOrder(
				req.lng,
				user.id,
				order,
				exchange
			)

			return res.json(removed_order)
		} catch (e) {
			next(e)
		}
	}

	async getOrderDescription(req, res, next) {
		try {
			const orderId = req.params.id
			const userId = req.user.id

			const description = await OrdersService.getOrderDescription(
				req.lng,
				userId,
				orderId
			)

			return res.json(description)
		} catch (e) {
			next(e)
		}
	}

	async updateOrderDescription(req, res, next) {
		try {
			const orderId = req.params.id
			const userId = req.user.id
			const text = req.body.text

			const description = await OrdersService.updateOrderDescription(
				req.lng,
				userId,
				orderId,
				text
			)

			return res.json(description)
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new OrdersController()
