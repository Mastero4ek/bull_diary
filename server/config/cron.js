const cron = require('node-cron')
const userService = require('../services/user-service')
const { rotateLogs, cleanOldLogs, logInfo, logError } = require('./logger')

const initCronJobs = () => {
	cron.schedule('0 * * * *', () => {
		userService.deleteInactiveUsers()
	})

	cron.schedule('0 0 * * *', () => {
		require('child_process').exec(
			'node scripts/backup-mongodb.js',
			(error, stdout, stderr) => {
				if (error) {
					logError(error, { context: 'cron-mongodb-backup', stderr })
				} else {
					logInfo('Daily MongoDB backup completed', { stdout })
				}
			}
		)
		rotateLogs()
		logInfo('Daily log rotation completed')
	})

	cron.schedule('0 2 * * 0', () => {
		cleanOldLogs()
		logInfo('Weekly log cleanup completed')
	})

	cron.schedule('0 3 * * 0', () => {
		require('child_process').exec(
			'node scripts/clean-backups.js',
			(error, stdout, stderr) => {
				if (error) {
					logError(error, { context: 'cron-clean-mongodb-backups', stderr })
				} else {
					logInfo('Weekly MongoDB backups cleanup completed', { stdout })
				}
			}
		)
	})
}

module.exports = initCronJobs
