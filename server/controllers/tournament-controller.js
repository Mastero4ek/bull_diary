const tournamentService = require('../services/tournament-service')
const Helpers = require('../helpers/helpers')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')

class TournamentController {
	async createTournament(req, res, next) {
		try {
			Helpers.validationError(req, next)

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

	async removeTournament(req, res, next) {
		try {
			Helpers.validationError(req, next)

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

	async getTournaments(req, res, next) {
		try {
			Helpers.validationError(req, next)

			const { exchange } = req.query
			const { page, size } = req.query

			const tournament = await tournamentService.getTournaments(
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

	async addTournamentUser(req, res, next) {
		try {
			Helpers.validationError(req, next)

			const { exchange } = req.body
			const { id } = req.params

			const bid_user = await tournamentService.addTournamentUser(
				exchange,
				id,
				req.lng
			)

			return res.json(bid_user)
		} catch (e) {
			next(e)
		}
	}

	async removeTournamentUser(req, res, next) {
		try {
			Helpers.validationError(req, next)

			const { userId } = req.body
			const { id: tournamentId } = req.params

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
