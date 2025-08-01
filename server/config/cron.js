const cron = require('node-cron')
const userService = require('../service/user-service')
const { rotateLogs, cleanOldLogs, logInfo } = require('./logger')

const initCronJobs = () => {
	cron.schedule('0 * * * *', () => {
		userService.deleteInactiveUsers()
	})

	cron.schedule('0 0 * * *', () => {
		rotateLogs()
		logInfo('Daily log rotation completed')
	})

	cron.schedule('0 2 * * 0', () => {
		cleanOldLogs()
		logInfo('Weekly log cleanup completed')
	})
}

module.exports = initCronJobs
