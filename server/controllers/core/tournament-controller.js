const TournamentService = require('@services/core/tournament-service')
const { validationError } = require('@helpers/sanitization-helpers')
const { ApiError } = require('@exceptions/api-error')
const i18next = require('i18next')

class TournamentController {
	async createTournament(req, res, next) {
		try {
			validationError(req, next)

			const tournament = await TournamentService.createTournament(
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
			validationError(req, next)

			const { id } = req.params
			const deleted = await TournamentService.removeTournament(id, req.lng)

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
			validationError(req, next)

			const { exchange, page, size, search, sort } = req.query

			const tournament = await TournamentService.getTournaments(
				exchange,
				req.lng,
				page,
				size,
				search,
				sort
			)

			return res.json(tournament)
		} catch (e) {
			next(e)
		}
	}

	async addTournamentUser(req, res, next) {
		try {
			validationError(req, next)

			const { exchange } = req.body
			const { id } = req.params

			const bid_user = await TournamentService.addTournamentUser(
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
			validationError(req, next)

			const { userId } = req.body
			const { id: tournamentId } = req.params

			const result = await TournamentService.removeTournamentUser(
				tournamentId,
				userId,
				req.lng
			)

			return res.json(result)
		} catch (e) {
			next(e)
		}
	}

	async getTournamentUsersList(req, res, next) {
		try {
			validationError(req, next)

			const { id } = req.params
			const users = await TournamentService.getTournamentUsersList(id)

			return res.json(users)
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new TournamentController()
