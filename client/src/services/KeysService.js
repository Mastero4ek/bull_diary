import $api from '../http';

export default class KeysService {
	static async updateKeys(exchange, api, secret) {
		const response = await $api.post('/update-keys', { exchange, api, secret })

		return response
	}
}
