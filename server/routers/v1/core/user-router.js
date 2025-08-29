const express = require('express')
const userController = require('@controllers/core/user-controller')
const fileController = require('@controllers/core/file-controller')
const router = express.Router()
const { checkSchema } = require('express-validator')
const authMiddleware = require('@middlewares/auth-middleware')
const ValidationSchema = require('@validation/schema')
const upload = require('@configs/multer-config')
const fileMiddleware = require('@middlewares/file-middleware')

const profileImageValidation = fileMiddleware({
	allowedTypes: ['image/jpeg', 'image/png'],
	maxSize: parseInt(process.env.MAX_FILE_SIZE),
	minSize: 1024,
})

router.get(
	'/user/:id',
	checkSchema(ValidationSchema.getUser, ['params']),
	userController.getUser
)

router.patch(
	'/user/:id?',
	authMiddleware,
	upload.single('cover'),
	profileImageValidation,
	checkSchema(ValidationSchema.editUser),
	userController.editUser
)

router.delete(
	'/cover/:filename/:userId?',
	authMiddleware,
	checkSchema(ValidationSchema.removeCover, ['params']),
	fileController.removeCover
)

router.delete(
	'/user/:id',
	authMiddleware,
	checkSchema(ValidationSchema.removeUser),
	userController.removeUser
)

router.get(
	'/users',
	authMiddleware,
	checkSchema(ValidationSchema.getUsers, ['query']),
	userController.getUsers
)

router.get('/users/list', authMiddleware, userController.getUsersList)

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
	checkSchema(ValidationSchema.createUser),
	userController.createUser
)

router.patch(
	'/user/:id/activate',
	authMiddleware,
	checkSchema(ValidationSchema.getUser, ['params']),
	userController.activeUser
)

router.patch(
	'/user/:id/deactivate',
	authMiddleware,
	checkSchema(ValidationSchema.getUser, ['params']),
	userController.inactiveUser
)

module.exports = router
