const Router = require('express').Router
const mailController = require('../../controllers/mail-controller')
const router = new Router()

router.get('/activate/:link', mailController.activate)

module.exports = router
