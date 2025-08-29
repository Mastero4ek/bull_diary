const cron = require('node-cron')

const userService = require('@services/core/user-service')

const {
	rotateLogs,
	cleanOldLogs,
	logInfo,
	logError,
} = require('./logger-config')

const initCronJobs = () => {
	// Ежедневная проверка активности пользователей в 9:00
	cron.schedule('0 9 * * *', async () => {
		try {
			await userService.checkUserActivity()
			await userService.markInactiveUsers()

			logInfo('Daily user activity check completed')
		} catch (error) {
			logError(error, { context: 'cron-user-activity-check' })
		}
	})

	// Ежедневное резервное копирование MongoDB и ротация логов в 00:00
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

	// Еженедельная очистка старых логов в воскресенье в 2:00
	cron.schedule('0 2 * * 0', () => {
		cleanOldLogs()
		logInfo('Weekly log cleanup completed')
	})

	// Еженедельная очистка старых резервных копий MongoDB в воскресенье в 3:00
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
