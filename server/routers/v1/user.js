const Router = require('express').Router
const userController = require('../../controllers/user-controller')
const fileController = require('../../controllers/file-controller')
const router = new Router()
const { checkSchema } = require('express-validator')
const authMiddleware = require('../../middlewares/auth-middleware')
const ValidationSchema = require('../../validation/validation-schema')
const upload = require('../../config/multer')
const fileValidation = require('../../middlewares/file-validation')

const profileImageValidation = fileValidation({
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

router.post(
	'/user',
	authMiddleware,
	upload.single('cover'),
	profileImageValidation,
	checkSchema(ValidationSchema.createUser),
	userController.createUser
)

module.exports = router
