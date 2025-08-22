const mongoose = require('mongoose')
const { logInfo, logError } = require('./logger-config')

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI)

		const portMatch = process.env.MONGO_URI.match(/:(\d+)(?:\/|$)/)
		const port = portMatch ? Number(portMatch[1]) : 27017

		logInfo('Successfully connected to MongoDB', { port: port })
	} catch (error) {
		logError(error, { context: 'MongoDB connection' })
		process.exit(1)
	}
}

module.exports = connectDB
