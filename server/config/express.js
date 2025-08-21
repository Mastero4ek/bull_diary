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
const sanitizationMiddleware = require('../middlewares/sanitization-middleware')

const app = express()

const uploadsPath = path.join(__dirname, '../uploads')

if (!fs.existsSync(uploadsPath)) {
	fs.mkdirSync(uploadsPath, {
		recursive: true,
		mode: 0o755,
	})
}

// Настройка безопасности с помощью Helmet
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
				'script-src': ["'self'"],
				'style-src': ["'self'", "'unsafe-inline'"],
				'font-src': ["'self'"],
				'connect-src': ["'self'", process.env.API_URL],
				'frame-ancestors': ["'none'"],
				'base-uri': ["'self'"],
				'form-action': ["'self'"],
				'upgrade-insecure-requests': [],
			},
		},
		hsts: {
			maxAge: 31536000,
			includeSubDomains: true,
			preload: true,
		},
		noSniff: true,
		referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
		permittedCrossDomainPolicies: { permittedPolicies: 'none' },
		expectCt: {
			enforce: true,
			maxAge: 30,
			reportUri: process.env.CT_REPORT_URI || null,
		},
	})
)

// Дополнительные заголовки безопасности
app.use((req, res, next) => {
	res.setHeader('X-Content-Type-Options', 'nosniff')
	res.setHeader('X-Frame-Options', 'DENY')
	res.setHeader('X-XSS-Protection', '1; mode=block')
	res.setHeader('X-Download-Options', 'noopen')
	res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
	res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
	res.setHeader(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
	)

	if (req.path === '/api/v1/logout') {
		res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"')
	}

	next()
})

// Настройка CORS для разрешенных доменов
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

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	handler: (req, res) => {
		res.status(429).json({
			message:
				'Too many authentication attempts, please try again after 15 minutes',
			code: 429,
		})
	},
})

// Rate limiting для API запросов (исключая OAuth callback)
app.use((req, res, next) => {
	const oauthPaths = [
		'/auth/google/callback',
		'/auth/github/callback',
		'/auth/vkontakte/callback',
	]
	if (oauthPaths.some(path => req.path.includes(path))) {
		return next()
	}

	apiLimiter(req, res, next)
})

// Rate limiting для аутентификации
app.use('/api/v1/sign-in', authLimiter)
app.use('/api/v1/sign-up', authLimiter)
// Логирование HTTP запросов
app.use(requestLogger)
// Парсинг JSON тела запроса
app.use(bodyParser.json())
// Поддержка HTTP методов (PUT, DELETE через POST)
app.use(methodOverride('_method'))
// Парсинг JSON (дублирующий bodyParser)
app.use(express.json())
// Парсинг cookies
app.use(cookieParser())
// Санитизация входящих данных
app.use(sanitizationMiddleware)

// Статические файлы для загрузок с настройками безопасности
app.use(
	'/uploads',
	express.static(path.join(__dirname, '../uploads'), {
		setHeaders: (res, path) => {
			res.setHeader('Access-Control-Allow-Origin', '*')
			res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
			res.setHeader('X-Content-Type-Options', 'nosniff')
			res.setHeader('Cache-Control', 'public, max-age=31536000')
		},
	})
)

// Настройка CORS для API
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

// Настройка сессий
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
		cookie: {
			secure: process.env.NODE_ENV === 'prod',
			sameSite: 'strict',
			maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
			httpOnly: true,
			domain: process.env.COOKIE_DOMAIN || undefined,
			path: '/',
		},
		store: new session.MemoryStore(),
	})
)

const csrfProtection = csrf({
	cookie: true,
	ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
	ignorePaths: [
		'/api/v1/logout',
		'/api/v1/csrf-token',
		'/auth/google/callback',
		'/auth/github/callback',
		'/auth/vkontakte/callback',
	],
})

// CSRF защита для изменяющих методов (исключая logout и csrf-token)
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

// Обработка ошибок CSRF
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
