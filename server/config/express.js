const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const session = require('express-session')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const csrf = require('csurf')
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

app.use((req, res, next) => {
	const allowedOrigins = [process.env.CLIENT_URL]

	const origin = req.headers.origin
	if (allowedOrigins.includes(origin)) {
		res.header('Access-Control-Allow-Origin', origin)
	}

	res.header('Access-Control-Allow-Credentials', true)
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, x-xsrf-token'
	)
	res.header(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, PATCH, OPTIONS'
	)

	if (req.method === 'OPTIONS') {
		res.sendStatus(200)
	} else {
		next()
	}
})

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

// Rate limiting для auth endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 минут
	max: 5, // максимум 5 попыток
	handler: (req, res) => {
		res.status(429).json({
			message:
				'Too many authentication attempts, please try again after 15 minutes',
			code: 429,
		})
	},
})

app.use('/api/', apiLimiter)
app.use('/api/v1/sign-in', authLimiter)
app.use('/api/v1/sign-up', authLimiter)
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
		methods: 'GET,POST,PUT,DELETE,PATCH',
		credentials: true,
		origin: [process.env.CLIENT_URL],
		allowedHeaders: [
			'Origin',
			'X-Requested-With',
			'Content-Type',
			'Accept',
			'Authorization',
			'X-CSRF-Token',
			'x-xsrf-token',
		],
	})
)

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
		cookie: {
			secure: process.env.NODE_ENV === 'prod',
			sameSite: 'strict',
			maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
		},
		store: new session.MemoryStore(),
	})
)

// Create CSRF protection middleware
const csrfProtection = csrf({
	cookie: true,
	ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
	ignorePaths: ['/api/v1/logout', '/api/v1/csrf-token'],
})

// CSRF protection for all POST/PUT/DELETE requests (except logout)
app.use((req, res, next) => {
	if (req.path === '/api/v1/logout' && req.method === 'POST') {
		return next()
	}

	if (req.path === '/api/v1/csrf-token' && req.method === 'GET') {
		return next()
	}

	if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
		csrfProtection(req, res, next)
	} else {
		next()
	}
})

// CSRF error handler
app.use((err, req, res, next) => {
	if (err.code === 'EBADCSRFTOKEN') {
		return res.status(403).json({
			message: 'CSRF token validation failed',
			code: 403,
		})
	}

	next(err)
})

module.exports = app
