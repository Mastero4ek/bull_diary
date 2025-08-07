require('dotenv').config()
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { logInfo, logError } = require('../config/logger')

const BACKUP_DIR = path.join(__dirname, '../backups/mongodb')
const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
	logError(new Error('MONGO_URI is not set in .env'), {
		context: 'backup-mongodb',
	})
	process.exit(1)
}

if (!fs.existsSync(BACKUP_DIR)) {
	fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

const date = new Date().toISOString().replace(/[:.]/g, '-')
const backupPath = path.join(BACKUP_DIR, `backup-${date}`)

const dumpCmd = `mongodump --uri=\"${MONGO_URI}\" --out=\"${backupPath}\"`

exec(dumpCmd, (error, stdout, stderr) => {
	if (error) {
		logError(error, { context: 'mongodump', stderr })
		process.exit(1)
	} else {
		logInfo('MongoDB backup completed', { backupPath, stdout })
		process.exit(0)
	}
})
