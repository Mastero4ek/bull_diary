const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middlewares/auth-middleware')
const syncController = require('../../controllers/sync-controller')

router.get('/sync-progress', authMiddleware, syncController.getSyncProgress)
router.post('/sync-data', authMiddleware, syncController.syncData)

module.exports = router
