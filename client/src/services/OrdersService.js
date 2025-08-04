import $api from '../http';

export default class OrdersService {
	static async getBybitOrdersPnl(
		exchange,
		sort,
		search,
		page,
		limit,
		start_time,
		end_time
	) {
		return $api.get(`/bybit-orders-pnl`, {
			params: {
				exchange,
				sort,
				search,
				page,
				limit,
				start_time,
				end_time,
			},
		})
	}

	static async getBybitSavedOrders(
		sort,
		search,
		page,
		limit,
		start_time,
		end_time,
		exchange,
		all = false
	) {
		const url = all ? `/bybit-saved-orders/all` : `/bybit-saved-orders`

		return $api.get(url, {
			params: {
				sort,
				search,
				page,
				limit,
				start_time,
				end_time,
				exchange,
			},
		})
	}

	static async getBybitTickers(exchange) {
		return $api.get(`/bybit-tickers`, {
			params: { exchange },
		})
	}

	static async savedOrder(order, exchange) {
		return $api.post(`/order/${order.id}`, { order, exchange })
	}

	static async removedOrder(order, exchange, start_time, end_time) {
		return $api.delete(`/order/${order.id}`, {
			data: {
				order,
				exchange,
				start_time,
				end_time,
			},
		})
	}
}
