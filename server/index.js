require('dotenv').config()

// Настройка обработки неперехваченных исключений в самом начале
const { logError } = require('./config/logger')

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

const app = require('./config/express')
const passport = require('./config/passport')
const connectDB = require('./config/database')
const initCronJobs = require('./config/cron')
const redis = require('./config/redis')
const mongoose = require('mongoose')
const routerGoogleV1 = require('./routers/v1/google')
const routerGithubV1 = require('./routers/v1/github')
const routerKeysV1 = require('./routers/v1/keys')
const routerAuthV1 = require('./routers/v1/auth')
const routerMailV1 = require('./routers/v1/mail')
const routerTournamentV1 = require('./routers/v1/tournament')
const routerBybitV1 = require('./routers/v1/bybit')
const routerOrdersV1 = require('./routers/v1/orders')
const routerUserV1 = require('./routers/v1/user')
const passportSetupGoogle = require('./passports/passportGoogle')
const passportSetupGithub = require('./passports/passportGithub')
const errorMiddleware = require('./middlewares/error-middleware')
const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const path = require('path')
const langMiddleware = require('./middlewares/lang-middleware')

const { logInfo } = require('./config/logger')

i18next.use(Backend).init({
	preload: ['en', 'ru'],
	fallbackLng: 'en',
	backend: {
		loadPath: path.join(__dirname, 'locales/{{lng}}/translation.json'),
	},
	interpolation: {
		escapeValue: false,
	},
})

const PORT = process.env.PORT || 5001

app.use(langMiddleware)
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

app.get('/health', async (req, res) => {
	try {
		await mongoose.connection.db.admin().ping()

		await redis.ping()

		res.status(200).json({
			status: 'healthy',
			timestamp: new Date().toISOString(),
			services: {
				mongodb: 'connected',
				redis: 'connected',
			},
		})
	} catch (error) {
		res.status(500).json({
			status: 'unhealthy',
			timestamp: new Date().toISOString(),
			error: error.message,
		})
	}
})

const start = async () => {
	try {
		await connectDB()
		await initCronJobs()

		app.listen(PORT, () => {
			logInfo(`Successfully started server`, { port: Number(PORT) })
		})
	} catch (e) {
		logError(e, { context: 'Server startup' })
	}
}

start()
