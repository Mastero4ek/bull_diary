import $api from '../http'

export default class AuthService {
	static async signIn(email, password) {
		const response = await $api.post('/sign-in', { email, password })
		return response
	}

	static async signUp(name, email, password, confirm_password, agreement) {
		const response = await $api.post('/sign-up', {
			agreement,
			name,
			email,
			password,
			confirm_password,
		})
		return response
	}

	static async logout() {
		const response = await $api.post('/logout', {})
		return response
	}
}
