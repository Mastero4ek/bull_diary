import $api from '../http';

export default class UserService {
	static async getUsers(sort, search, page, limit, start_time, end_time) {
		return $api.get('/users', {
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

		const url = userId ? `/user/${userId}` : '/user'

		return $api.patch(url, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			withCredentials: true,
		})
	}

	static async removeCover(filename, userId = null) {
		const url = userId ? `/cover/${filename}/${userId}` : `/cover/${filename}`
		return $api.delete(url)
	}

	static async removeUser(current_email, fill_email, userId) {
		return $api.delete(`/user/${userId}`, {
			data: { current_email, fill_email },
		})
	}

	static async getUser(id) {
		return $api.get(`/user/${id}`)
	}
}
