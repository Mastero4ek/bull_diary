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
		return $api.post(`/bybit-transactions`, {
			exchange,
			start_time,
			end_time,
			sort,
			search,
			page,
			limit,
		})
	}

	static async getBybitWallet(exchange, start_time, end_time) {
		return $api.post(`/bybit-wallet`, { exchange, start_time, end_time })
	}

	static async getBybitWalletChangesByDay(exchange, start_time, end_time) {
		return $api.post(`/bybit-wallet-changes-by-day`, {
			exchange,
			start_time,
			end_time,
		})
	}
}
