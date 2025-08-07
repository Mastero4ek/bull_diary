import $api from '../http'

export default class UserService {
	static async getUsers(sort, search, page, limit, start_time, end_time) {
		return $api.get('/v1/users', {
			params: {
				sort,
				search,
				page,
				limit,
				start_time,
				end_time,
			},
		})
	}

	static async editUser(
		name,
		last_name,
		email,
		password,
		phone,
		cover,
		userId = null
	) {
		const formData = new FormData()

		if (name) formData.append('name', name)
		if (last_name) formData.append('last_name', last_name)
		if (email) formData.append('email', email)
		if (password) formData.append('password', password)
		if (phone) formData.append('phone', phone)
		if (cover) formData.append('cover', cover)

		const url = userId ? `/v1/user/${userId}` : '/v1/user'

		return $api.patch(url, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			withCredentials: true,
		})
	}

	static async removeCover(filename, userId = null) {
		const url = userId
			? `/v1/cover/${filename}/${userId}`
			: `/v1/cover/${filename}`
		return $api.delete(url)
	}

	static async removeUser(current_email, fill_email, userId) {
		return $api.delete(`/v1/user/${userId}`, {
			data: { current_email, fill_email },
		})
	}

	static async getUser(id) {
		return $api.get(`/v1/user/${id}`)
	}

	static async createUser(data) {
		const formData = new FormData()

		if (data.name) formData.append('name', data.name)
		if (data.last_name) formData.append('last_name', data.last_name)
		if (data.email) formData.append('email', data.email)
		if (data.password) formData.append('password', data.password)
		if (data.phone) formData.append('phone', data.phone)
		if (data.role) formData.append('role', data.role)
		if (data.cover) formData.append('cover', data.cover)

		return $api.post('/v1/user', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
	}
}
