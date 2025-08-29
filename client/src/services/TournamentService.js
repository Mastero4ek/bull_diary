import $api from '../http';

export default class TournamentService {
  static async addTournamentUser(email, exchange, id) {
    return $api.post(`/v1/tournaments/user/${id}`, { email, exchange });
  }

  static async createTournament(data) {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('cover', data.cover);
    formData.append('exchange', data.exchange);
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    formData.append('registration_date', data.registration_date);

    return $api.post(`/v1/tournaments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async deleteTournament(id) {
    return $api.delete(`/v1/tournaments/${id}`);
  }

  static async removeTournamentUser(tournamentId, userId) {
    return $api.delete(`/v1/tournaments/user/${tournamentId}`, {
      data: { userId },
    });
  }

  static async getTournamentUsersList(id) {
    return $api.get(`/v1/tournaments/users/${id}`);
  }
}
