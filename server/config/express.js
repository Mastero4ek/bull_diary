const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const session = require('express-session')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')
const { requestLogger } = require('./logger')

const app = express()

const uploadsPath = path.join(__dirname, '../uploads')

if (!fs.existsSync(uploadsPath)) {
	fs.mkdirSync(uploadsPath, {
		recursive: true,
		mode: 0o755,
	})
}

app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' },
		contentSecurityPolicy: {
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				'img-src': [
					"'self'",
					'data:',
					'blob:',
					process.env.API_URL,
					process.env.API_URL + '/uploads/*',
				],
			},
		},
	})
)

const apiLimiter = rateLimit({
	windowMs: parseInt(process.env.RATE_LIMIT_MS) || 5 * 60 * 1000,
	max: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
	handler: (req, res) => {
		res.status(429).json({
			message:
				'Too many requests from this IP, please try again after ' +
				parseInt(process.env.RATE_LIMIT_MS) / 60000 +
				' minutes',
			code: 429,
		})
	},
})

app.use('/api/', apiLimiter)
app.use(requestLogger)
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.use(express.json())
app.use(cookieParser())

app.use(
	'/uploads',
	express.static(path.join(__dirname, '../uploads'), {
		setHeaders: (res, path) => {
			res.setHeader('Access-Control-Allow-Origin', '*')
			res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
		},
	})
)

app.use(
	cors({
		methods: 'GET,POST,PUT,DELETE',
		credentials: true,
		origin: [process.env.CLIENT_URL],
	})
)

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === 'prod',
			sameSite: 'lax',
			maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
		},
		store: new session.MemoryStore(),
	})
)

module.exports = app
