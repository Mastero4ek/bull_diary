import $api from '../http'

export default class AuthService {
	static async signIn(email, password) {
		const response = await $api.post('/v1/sign-in', { email, password })
		return response
	}

	static async signUp(name, email, password, confirm_password, agreement) {
		const response = await $api.post('/v1/sign-up', {
			agreement,
			name,
			email,
			password,
			confirm_password,
		})
		return response
	}

	static async logout() {
		const response = await $api.post('/v1/logout', {})
		return response
	}
}
