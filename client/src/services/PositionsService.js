import $api from '../http'

export default class PositionsService {
	static async getBybitPositions(exchange, sort, search, page, limit) {
		return $api.get(`/bybit-positions`, {
			params: {
				exchange,
				sort,
				search,
				page,
				limit,
			}
		})
	}
}
