const Router = require('express').Router
const { checkSchema } = require('express-validator')

const upload = require('@configs/multer-config')
const tournamentController = require('@controllers/core/tournament-controller')
const authMiddleware = require('@middlewares/auth-middleware')
const ValidationSchema = require('@validation/schema')

const router = new Router()

router.post(
	'/tournaments/user/:id',
	authMiddleware,
	checkSchema(ValidationSchema.addTournamentUser),
	tournamentController.addTournamentUser
)

router.post(
	'/tournaments',
	authMiddleware,
	upload.single('cover'),
	checkSchema(ValidationSchema.createTournament),
	tournamentController.createTournament
)

router.delete(
	'/tournaments/user/:id',
	authMiddleware,
	checkSchema(ValidationSchema.removeTournamentUser),
	tournamentController.removeTournamentUser
)

router.delete(
	'/tournaments/:id',
	authMiddleware,
	checkSchema(ValidationSchema.removeTournament, ['params']),
	tournamentController.removeTournament
)

router.get(
	'/tournaments/users/:id',
	authMiddleware,
	checkSchema(ValidationSchema.getTournamentUsersList, ['params']),
	tournamentController.getTournamentUsersList
)

module.exports = router
