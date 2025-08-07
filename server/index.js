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
const routerGoogle = require('./routers/google')
const routerGithub = require('./routers/github')
const routerKeys = require('./routers/keys')
const routerAuth = require('./routers/auth')
const routerMail = require('./routers/mail')
const routerTournament = require('./routers/tournament')
const routerBybit = require('./routers/bybit')
const routerOrders = require('./routers/orders')
const routerUser = require('./routers/user')
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
app.use('/auth', routerGoogle)
app.use('/auth', routerGithub)
app.use('/api', routerAuth)
app.use('/api', routerMail)
app.use('/api', routerKeys)
app.use('/api', routerTournament)
app.use('/api', routerBybit)
app.use('/api', routerOrders)
app.use('/api', routerUser)

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
