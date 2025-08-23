const express = require('express')
const mongoose = require('mongoose')
const redis = require('@configs/redis-config')
const SyncExecutor = require('@services/core/sync-executor')

const router = express.Router()

router.get('/health', async (req, res) => {
	try {
		await mongoose.connection.db.admin().ping()
		await redis.ping()

		res.status(200).json({
			status: 'healthy',
			timestamp: new Date().toISOString(),
			services: {
				mongodb: 'connected',
				redis: 'connected',
			},
		})
	} catch (error) {
		res.status(500).json({
			status: 'unhealthy',
			timestamp: new Date().toISOString(),
			error: error.message,
		})
	}
})

router.get('/auto-sync-stats', (req, res) => {
	try {
		const stats = SyncExecutor.getPendingSyncsStats()
		res.json(stats)
	} catch (error) {
		res.status(500).json({ error: 'Failed to get auto sync stats' })
	}
})

module.exports = router
