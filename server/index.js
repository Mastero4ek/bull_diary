require('module-alias/register')
require('dotenv').config()

process.on('uncaughtException', error => {
	logError(error, { context: 'Uncaught Exception' })
	process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
	const error = reason instanceof Error ? reason : new Error(String(reason))
	logError(error, { context: 'Unhandled Rejection' })
	process.exit(1)
})

const initCronJobs = require('./configs/cron-config')
const connectDB = require('./configs/database-config')
const app = require('./configs/express-config')
const { initI18next } = require('./configs/i18next-config')
const { logError } = require('./configs/logger-config')
const { logInfo } = require('./configs/logger-config')
const passport = require('./configs/passport-config')
const errorMiddleware = require('./middlewares/error-middleware')
const langMiddleware = require('./middlewares/lang-middleware')
const passportSetupGithub = require('./passports/github-passport')
const passportSetupGoogle = require('./passports/google-passport')
const routerAuthV1 = require('./routers/v1/auth/auth-router')
const routerKeysV1 = require('./routers/v1/auth/keys-router')
const routerHealthV1 = require('./routers/v1/core/health-router')
const routerMailV1 = require('./routers/v1/core/mail-router')
const routerOrdersV1 = require('./routers/v1/core/orders-router')
const routerTournamentV1 = require('./routers/v1/core/tournament-router')
const routerUserV1 = require('./routers/v1/core/user-router')
const routerBybitV1 = require('./routers/v1/exchange/bybit-router')
const routerGithubV1 = require('./routers/v1/integration/github-router')
const routerGoogleV1 = require('./routers/v1/integration/google-router')
const KeysService = require('./services/auth/keys-service')
const SyncExecutor = require('./services/core/sync-executor')
const WebSocketService = require('./services/system/websocket-service')

const PORT = process.env.PORT

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
		await initI18next()
		await initCronJobs()

		const server = app.listen(PORT, async () => {
			logInfo(`Successfully started server`, { port: Number(PORT) })
		})

		await WebSocketService.initialize(server)
		WebSocketService.setKeysService(KeysService)

		SyncExecutor.setDependencies(WebSocketService, KeysService)
	} catch (e) {
		logError(e, { context: 'Server startup' })
	}
}

start()
