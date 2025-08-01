import $api from '../http'

export default class PositionsService {
	static async getBybitPositions(exchange, sort, search, page, limit) {
		return $api.post(`/bybit-positions`, {
			exchange,
			sort,
			search,
			page,
			limit,
		})
	}
}
