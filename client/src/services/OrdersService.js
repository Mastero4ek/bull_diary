import $api from '../http'

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
		return $api.post(`/bybit-orders-pnl`, {
			exchange,
			sort,
			search,
			page,
			limit,
			start_time,
			end_time,
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

		return $api.post(url, {
			sort,
			search,
			page,
			limit,
			start_time,
			end_time,
			exchange,
		})
	}

	static async getBybitTickers(exchange) {
		return $api.post(`/bybit-tickers`, { exchange })
	}

	static async savedOrder(order, exchange) {
		return $api.post(`/saved-order`, { order, exchange })
	}

	static async removedOrder(order, exchange, start_time, end_time) {
		return $api.post(`/removed-order`, {
			order,
			exchange,
			start_time,
			end_time,
		})
	}
}
