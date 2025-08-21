import $api from '../http'

export default class WalletService {
	static async getBybitWallet(exchange, start_time, end_time) {
		return $api.get(`/v1/bybit-wallet`, {
			params: { exchange, start_time, end_time },
		})
	}
}
