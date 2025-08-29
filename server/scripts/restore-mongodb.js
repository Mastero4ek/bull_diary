require('dotenv').config()
const { exec } = require('child_process')

const { logInfo, logError } = require('../configs/logger-config')

const MONGO_URI = process.env.MONGO_URI
const backupDir = process.argv[2]

if (!MONGO_URI) {
	logError(new Error('MONGO_URI is not set in .env'), {
		context: 'restore-mongodb',
	})
	process.exit(1)
}

if (!backupDir) {
	logError(new Error('Backup directory argument is required'), {
		context: 'restore-mongodb',
	})
	process.exit(1)
}

const restoreCmd = `mongorestore --uri="${MONGO_URI}" --drop "${backupDir}"`

exec(restoreCmd, (error, stdout, stderr) => {
	if (error) {
		logError(error, { context: 'mongorestore', stderr })
		process.exit(1)
	} else {
		logInfo('MongoDB restore completed', { backupDir, stdout })
		process.exit(0)
	}
})
