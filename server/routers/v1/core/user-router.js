const CoreValidation = require('@validations/core-validation')
const express = require('express')
const { checkSchema } = require('express-validator')

const upload = require('@configs/multer-config')
const fileController = require('@controllers/core/file-controller')
const userController = require('@controllers/core/user-controller')
const authMiddleware = require('@middlewares/auth-middleware')
const fileMiddleware = require('@middlewares/file-middleware')

const router = express.Router()

const profileImageValidation = fileMiddleware({
	allowedTypes: ['image/jpeg', 'image/png'],
	maxSize: parseInt(process.env.MAX_FILE_SIZE),
	minSize: 1024,
})

router.get(
	'/user/:id',
	checkSchema(CoreValidation.getUser, ['params']),
	userController.getUser
)

router.patch(
	'/user/:id?',
	authMiddleware,
	upload.single('cover'),
	profileImageValidation,
	checkSchema(CoreValidation.editUser),
	userController.editUser
)

router.delete(
	'/cover/:filename/:userId?',
	authMiddleware,
	checkSchema(CoreValidation.removeCover, ['params']),
	fileController.removeCover
)

router.delete(
	'/user/:id',
	authMiddleware,
	checkSchema(CoreValidation.removeUser),
	userController.removeUser
)

router.get(
	'/users',
	authMiddleware,
	checkSchema(CoreValidation.getUsers, ['query']),
	userController.getUsers
)

router.get('/users/list', authMiddleware, userController.getUsersList)

router.get('/users/count', userController.getUsersCount)

router.get('/users/active-count', userController.getUsersActiveCount)

router.get(
	'/users/calendar-data',
	authMiddleware,
	userController.getUsersActivity
)

router.post(
	'/user',
	authMiddleware,
	upload.single('cover'),
	profileImageValidation,
	checkSchema(CoreValidation.createUser),
	userController.createUser
)

router.patch(
	'/user/:id/activate',
	authMiddleware,
	checkSchema(CoreValidation.getUser, ['params']),
	userController.activeUser
)

router.patch(
	'/user/:id/deactivate',
	authMiddleware,
	checkSchema(CoreValidation.getUser, ['params']),
	userController.inactiveUser
)

module.exports = router
