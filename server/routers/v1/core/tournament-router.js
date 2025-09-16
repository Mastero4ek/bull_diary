const CoreValidation = require('@validations/core-validation')
const Router = require('express').Router
const { checkSchema } = require('express-validator')

const upload = require('@configs/multer-config')
const tournamentController = require('@controllers/core/tournament-controller')
const authMiddleware = require('@middlewares/auth-middleware')

const router = new Router()

router.post(
	'/tournaments/user/:id',
	authMiddleware,
	checkSchema(CoreValidation.addTournamentUser),
	tournamentController.addTournamentUser
)

router.post(
	'/tournaments',
	authMiddleware,
	upload.single('cover'),
	checkSchema(CoreValidation.createTournament),
	tournamentController.createTournament
)

router.delete(
	'/tournaments/user/:id',
	authMiddleware,
	checkSchema(CoreValidation.removeTournamentUser),
	tournamentController.removeTournamentUser
)

router.delete(
	'/tournaments/:id',
	authMiddleware,
	checkSchema(CoreValidation.removeTournament, ['params']),
	tournamentController.removeTournament
)

router.get(
	'/tournaments/users/:id',
	authMiddleware,
	checkSchema(CoreValidation.getTournamentUsersList, ['params']),
	tournamentController.getTournamentUsersList
)

module.exports = router
