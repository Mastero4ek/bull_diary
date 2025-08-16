require('dotenv').config()
const mongoose = require('mongoose')
const { cleanAllUploads } = require('./clean-uploads')

const connectDB = require('../config/database')
const User = require('../models/user-model')
const Keys = require('../models/keys-model')
const Level = require('../models/level-model')
const Order = require('../models/order-model')
const File = require('../models/file-model')
const Token = require('../models/token-model')
const Tournament = require('../models/tournament-model')
const TournamentUser = require('../models/tournament_user-model')
const Description = require('../models/description-model')

const { logInfo, logError } = require('../config/logger')

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
