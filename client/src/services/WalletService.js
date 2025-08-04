import $api from '../http'

export default class WalletService {
	static async getBybitTransactions(
		exchange,
		start_time,
		end_time,
		sort,
		search,
		page,
		limit
	) {
		return $api.get(`/bybit-transactions`, {
			params: {
				exchange,
				start_time,
				end_time,
				sort,
				search,
				page,
				limit,
			}
		})
	}

	static async getBybitWallet(exchange, start_time, end_time) {
		return $api.get(`/bybit-wallet`, {
			params: { exchange, start_time, end_time }
		})
	}

	static async getBybitWalletChangesByDay(exchange, start_time, end_time) {
		return $api.get(`/bybit-wallet-changes-by-day`, {
			params: {
				exchange,
				start_time,
				end_time,
			}
		})
	}
}
