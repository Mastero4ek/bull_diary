import $api from '../http'

export default class TransactionsService {
	static async getBybitTransactions(
		exchange,
		start_time,
		end_time,
		sort,
		search,
		page,
		limit,
		size
	) {
		return $api.get(`/v1/bybit-transactions`, {
			params: {
				exchange,
				start_time,
				end_time,
				sort,
				search,
				page,
				limit,
				size,
			},
		})
	}
}
