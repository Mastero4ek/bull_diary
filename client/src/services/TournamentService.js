import $api from '../http'

export default class TournamentService {
	static async getTournament(exchange, page, size) {
		return $api.post(`/tournament?page=${page}&size=${size}`, { exchange })
	}

	static async addTournamentUser(email, exchange) {
		return $api.post('/add_tournament_user', { email, exchange })
	}

	static async createTournament(data) {
		const formData = new FormData()

		formData.append('name', data.name)
		formData.append('description', data.description)
		formData.append('cover', data.cover)
		formData.append('exchange', data.exchange)
		formData.append('start_date', data.start_date)
		formData.append('end_date', data.end_date)
		formData.append('registration_date', data.registration_date)

		return $api.post('/create_tournament', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
	}

	static async deleteTournament(id) {
		return $api.delete(`/tournament/${id}`)
	}

	static async removeTournamentUser(tournamentId, userId) {
		return $api.post('/remove_tournament_user', { tournamentId, userId })
	}
}
