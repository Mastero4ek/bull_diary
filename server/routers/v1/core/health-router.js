const express = require('express')
const mongoose = require('mongoose')
const redis = require('@configs/redis-config')

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

module.exports = router
