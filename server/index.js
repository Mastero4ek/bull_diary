require('dotenv').config()

const app = require('./config/express')
const passport = require('./config/passport')
const connectDB = require('./config/database')
const initCronJobs = require('./config/cron')
const redis = require('./config/redis')
const mongoose = require('mongoose')
const routerGoogle = require('./routers/google')
const routerGithub = require('./routers/github')
const routerApi = require('./routers/app')
const routerTournament = require('./routers/tournament')
const routerBybit = require('./routers/bybit')
const routerOrders = require('./routers/orders')
const passportSetupGoogle = require('./passports/passportGoogle')
const passportSetupGithub = require('./passports/passportGithub')
const errorMiddleware = require('./middlewares/error-middleware')
const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const path = require('path')
const langMiddleware = require('./middlewares/lang-middleware')

const { logInfo, logError } = require('./config/logger')

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
app.use('/api', routerApi)
app.use('/auth', routerGoogle)
app.use('/auth', routerGithub)
app.use('/api', routerTournament)
app.use('/api', routerBybit)
app.use('/api', routerOrders)

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
