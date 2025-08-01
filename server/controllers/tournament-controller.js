const tournamentService = require('../service/tournament-service')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')

class TournamentController {
	async addTournamentUser(req, res, next) {
		try {
			const { exchange } = req.body
			const user = req.user
			const bid_user = await tournamentService.addTournamentUser(
				exchange,
				user.id,
				req.lng
			)

			return res.json(bid_user)
		} catch (e) {
			next(e)
		}
	}

	async getTournament(req, res, next) {
		try {
			const { exchange } = req.body
			const { page, size } = req.query
			const tournament = await tournamentService.getTournament(
				exchange,
				req.lng,
				page,
				size
			)

			return res.json(tournament)
		} catch (e) {
			next(e)
		}
	}

	async createTournament(req, res, next) {
		try {
			const tournament = await tournamentService.createTournament(
				req.body,
				req.file,
				req.lng
			)

			return res.json(tournament)
		} catch (e) {
			next(e)
		}
	}

	async deleteTournament(req, res, next) {
		try {
			const { id } = req.params
			const deleted = await tournamentService.removeTournament(id, req.lng)

			if (!deleted) {
				throw ApiError.NotFound(
					i18next.t('errors.tournament_not_found', { lng: req.lng })
				)
			}

			return res.json({ message: 'Tournament deleted successfully' })
		} catch (e) {
			next(e)
		}
	}

	async removeTournamentUser(req, res, next) {
		try {
			const { tournamentId, userId } = req.body
			const result = await tournamentService.removeTournamentUser(
				tournamentId,
				userId,
				req.lng
			)

			return res.json(result)
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new TournamentController()
