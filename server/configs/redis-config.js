const Redis = require('ioredis')
const { logInfo, logError } = require('./logger-config')

let redis = null

try {
	redis = new Redis(process.env.REDIS_URL, {
		retryStrategy: function (times) {
			const delay = Math.min(times * 50, 2000)

			return delay
		},
		maxRetriesPerRequest: 3,
	})

	redis.on('error', err => {
		logError(err, { context: 'Redis connection' })
	})

	redis.on('connect', () => {
		logInfo('Successfully connected to Redis', { port: 6379 })
	})
} catch (error) {
	logError(error, { context: 'Redis initialization' })
}

module.exports = redis
