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
					'http://localhost:5001',
					'http://localhost:5001/uploads/*',
				],
			},
		},
	})
)

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 30 minutes
	max: 1000, // limit each IP to 10 requests per windowMs
	handler: (req, res) => {
		res.status(429).json({
			message:
				'Too many requests from this IP, please try again after 15 minutes',
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
		secret: process.env.SESSION_SECRET || 'bull_diary_master_key',
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 24 * 60 * 60 * 1000,
		},
		store: new session.MemoryStore(),
	})
)

module.exports = app
