import $api from '../http';

export default class OrdersService {
	static async getBybitOrdersPnl(
		exchange,
		sort,
		search,
		page,
		limit,
		start_time,
		end_time,
		bookmarks
	) {
		return $api.get(`/v1/bybit-orders-pnl`, {
			params: {
				exchange,
				sort,
				search,
				page,
				limit,
				start_time,
				end_time,
				bookmarks,
			},
		})
	}

	static async getBybitTickers(exchange) {
		return $api.get(`/v1/bybit-tickers`, {
			params: { exchange },
		})
	}

	static async getOrderDescription(id) {
		return $api.get(`/v1/order/description/${id}`)
	}

	static async updateOrderDescription(id, text) {
		return $api.patch(`/v1/order/description/${id}`, { text })
	}

	static async savedOrder(order, exchange) {
		return $api.post(`/v1/order/${order.id}`, { order, exchange })
	}

	static async removedOrder(order, exchange) {
		return $api.delete(`/v1/order/${order.id}`, {
			data: {
				order,
				exchange,
			},
		})
	}

	static async getSyncProgress() {
		return $api.get(`/v1/sync-progress`)
	}

	static async syncData(exchange, start_time, end_time) {
		return $api.post(`/v1/sync-data`, {
			exchange,
			start_time,
			end_time,
		})
	}
}
