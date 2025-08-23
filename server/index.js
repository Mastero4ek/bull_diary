require('module-alias/register')
require('dotenv').config()

const { logError } = require('./configs/logger-config')

process.on('uncaughtException', error => {
	console.error('Uncaught Exception:', error.message)
	console.error('Stack:', error.stack)
	logError(error, { context: 'Uncaught Exception' })
	process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)
	const error = reason instanceof Error ? reason : new Error(String(reason))
	logError(error, { context: 'Unhandled Rejection' })
	process.exit(1)
})

const app = require('./configs/express-config')

const routerGoogleV1 = require('./routers/v1/integration/google-router')
const routerGithubV1 = require('./routers/v1/integration/github-router')
const routerKeysV1 = require('./routers/v1/auth/keys-router')
const routerAuthV1 = require('./routers/v1/auth/auth-router')
const routerMailV1 = require('./routers/v1/core/mail-router')
const routerTournamentV1 = require('./routers/v1/core/tournament-router')
const routerBybitV1 = require('./routers/v1/exchange/bybit-router')
const routerOrdersV1 = require('./routers/v1/core/orders-router')
const routerUserV1 = require('./routers/v1/core/user-router')
const routerHealthV1 = require('./routers/v1/core/health-router')

const passport = require('./configs/passport-config')
const passportSetupGoogle = require('./passports/google-passport')
const passportSetupGithub = require('./passports/github-passport')

const connectDB = require('./configs/database-config')
const initCronJobs = require('./configs/cron-config')
const { initI18next } = require('./configs/i18next-config')
const { logInfo } = require('./configs/logger-config')

const WebSocketService = require('./services/system/websocket-service')
const SyncExecutor = require('./services/core/sync-executor')
const KeysService = require('./services/auth/keys-service')

const errorMiddleware = require('./middlewares/error-middleware')
const langMiddleware = require('./middlewares/lang-middleware')

const PORT = process.env.PORT

initI18next()

app.use(langMiddleware)

app.use('/', routerHealthV1)
app.use('/auth', routerGoogleV1)
app.use('/auth', routerGithubV1)
app.use('/api/v1', routerAuthV1)
app.use('/api/v1', routerMailV1)
app.use('/api/v1', routerKeysV1)
app.use('/api/v1', routerTournamentV1)
app.use('/api/v1', routerBybitV1)
app.use('/api/v1', routerOrdersV1)
app.use('/api/v1', routerUserV1)

app.use(errorMiddleware)

const start = async () => {
	try {
		await connectDB()
		await initCronJobs()

		const server = app.listen(PORT, () => {
			logInfo(`Successfully started server`, { port: Number(PORT) })
		})

		WebSocketService.initialize(server)
		WebSocketService.setKeysService(KeysService)

		SyncExecutor.setDependencies(WebSocketService, KeysService)
	} catch (e) {
		logError(e, { context: 'Server startup' })
	}
}

start()
