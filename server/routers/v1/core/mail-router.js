const Router = require('express').Router
const mailController = require('@controllers/core/mail-controller')
const router = new Router()

router.get('/activate/:link', mailController.activate)

module.exports = router
