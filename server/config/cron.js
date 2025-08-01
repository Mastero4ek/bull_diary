const cron = require('node-cron')
const moment = require('moment')
const userService = require('../service/user-service')
const tournamentService = require('../service/tournament-service')
const { rotateLogs, cleanOldLogs, logInfo } = require('./logger')

// Schedule tournament creation
// const scheduleTournamentCreation = () => {
// 	const currentDate = moment()
// 	const daysInMonth = currentDate.daysInMonth()
// 	const targetDate = daysInMonth - 7

// 	if (currentDate.date() < targetDate) {
// 		const cronTime = `0 0 ${targetDate} ${currentDate.month() + 1} *`

// 		cron.schedule(cronTime, () => {
// 			// Создание турниров для разных бирж
// 			// tournamentService.createTournament(tournamentData, null, 'en')
// 			// tournamentService.createTournament(tournamentData, null, 'en')
// 			// tournamentService.createTournament(tournamentData, null, 'en')
// 		})
// 	} else {
// 		logInfo('The target date has already passed or is today!')
// 	}
// }

const initCronJobs = () => {
	cron.schedule('0 * * * *', () => {
		userService.deleteInactiveUsers()
		// scheduleTournamentCreation()
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
