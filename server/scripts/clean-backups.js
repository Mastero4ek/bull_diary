const fs = require('fs')
const path = require('path')

const { logInfo, logWarn } = require('@configs/logger-config')

const BACKUP_DIR = path.join(__dirname, '../backups/mongodb')
const DAYS_TO_KEEP = 7

if (!fs.existsSync(BACKUP_DIR)) {
	logWarn('Backup directory does not exist.', { BACKUP_DIR })
	process.exit(0)
}

const now = Date.now()
const cutoff = now - DAYS_TO_KEEP * 24 * 60 * 60 * 1000

const files = fs.readdirSync(BACKUP_DIR)
let deleted = 0
for (const file of files) {
	const filePath = path.join(BACKUP_DIR, file)
	const stat = fs.statSync(filePath)
	if (stat.isDirectory() && stat.mtimeMs < cutoff) {
		fs.rmSync(filePath, { recursive: true, force: true })
		deleted++
	}
}

logInfo('Old backups cleanup completed', { deleted })
