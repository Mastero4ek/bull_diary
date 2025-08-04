const Router = require('express').Router
const router = new Router()
const authMiddleware = require('../middlewares/auth-middleware')
const tournamentController = require('../controllers/tournament-controller')
const { checkSchema } = require('express-validator')
const ValidationSchema = require('../validation/validation-schema')
const upload = require('../config/multer')

router.get('/tournaments', authMiddleware, tournamentController.getTournaments)

router.post(
	'/tournaments/user/:id',
	authMiddleware,
	checkSchema(ValidationSchema.tournament),
	tournamentController.addTournamentUser
)

router.post(
	'/tournaments',
	authMiddleware,
	upload.single('cover'),
	checkSchema(ValidationSchema.tournament),
	tournamentController.createTournament
)

router.delete(
	'/tournaments/user/:id',
	authMiddleware,
	checkSchema(ValidationSchema.tournament),
	tournamentController.removeTournamentUser
)

router.delete(
	'/tournaments/:id',
	authMiddleware,
	tournamentController.removeTournament
)

module.exports = router
