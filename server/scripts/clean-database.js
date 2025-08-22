require('dotenv').config()
const mongoose = require('mongoose')
const { cleanAllUploads } = require('./clean-uploads')

const connectDB = require('@configs/database-config')
const User = require('@models/core/user-model')
const Keys = require('@models/auth/keys-model')
const Level = require('@models/core/level-model')
const Order = require('@models/core/order-model')
const File = require('@models/core/file-model')
const Token = require('@models/auth/token-model')
const Tournament = require('@models/core/tournament-model')
const TournamentUser = require('@models/core/tournament_user-model')
const Description = require('@models/core/description-model')

const { logInfo, logError } = require('@configs/logger-config')

async function cleanDatabase() {
	await connectDB()

	try {
		await Promise.all([
			User.deleteMany({}),
			Keys.deleteMany({}),
			Level.deleteMany({}),
			Order.deleteMany({}),
			File.deleteMany({}),
			Token.deleteMany({}),
			Tournament.deleteMany({}),
			TournamentUser.deleteMany({}),
			Description.deleteMany({}),
		])
		logInfo('All collections have been cleaned!')
	} catch (err) {
		logError(err, { context: 'clean database' })
	} finally {
		mongoose.disconnect()
	}
}

async function main() {
	await cleanDatabase()

	if (process.argv.includes('--clean-uploads')) {
		await cleanAllUploads()
	}
}

main()
