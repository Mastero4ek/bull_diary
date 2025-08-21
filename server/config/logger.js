const pino = require('pino')
const path = require('path')
const fs = require('fs')

const logsDir = path.join(__dirname, '../logs')

if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true })
}

const isDevelopment = process.env.NODE_ENV !== 'prod'
const logLevel = process.env.LOG_LEVEL || 'info'

console.log(
	`[Logger] Environment: ${
		process.env.NODE_ENV || 'undefined'
	}, isDevelopment: ${isDevelopment}, logLevel: ${logLevel}`
)

/**
 * Записывает лог в файл
 * @param {string} level - Уровень логирования
 * @param {string} message - Сообщение для записи
 * @param {Object} data - Дополнительные данные
 */
const writeToFile = (level, message, data = {}) => {
	const timestamp = new Date().toISOString()
	const hostname = require('os').hostname()

	// [2023-10-02T12:34:56.789Z] INFO (hostname): info message
	const logEntry = `[${timestamp}] ${level.toUpperCase()} (${hostname}): ${message}`

	const additionalData =
		Object.keys(data).length > 0 ? ` ${JSON.stringify(data)}` : ''
	const fullLogEntry = logEntry + additionalData + '\n'

	fs.appendFileSync(path.join(logsDir, 'application.log'), fullLogEntry)
}

const baseOptions = {
	level: logLevel,
	base: {
		service: 'diary-server',
		environment: process.env.NODE_ENV || 'dev',
		pid: process.pid,
		hostname: require('os').hostname(),
	},
	timestamp: pino.stdTimeFunctions.isoTime,
	formatters: {
		level: label => {
			return { level: label.toUpperCase() }
		},
	},
}

const logger = pino({
	...baseOptions,
	transport: isDevelopment
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:standard',
					ignore: 'pid,hostname',
					messageFormat: '[{time}] {level} ({hostname}): {msg}',
				},
		  }
		: undefined,
})

const originalInfo = logger.info.bind(logger)
const originalError = logger.error.bind(logger)
const originalWarn = logger.warn.bind(logger)
const originalDebug = logger.debug.bind(logger)

logger.info = (data, message) => {
	writeToFile('info', message || data, typeof data === 'object' ? data : {})
	originalInfo(data, message)
}

logger.error = (data, message) => {
	writeToFile('error', message || data, typeof data === 'object' ? data : {})
	originalError(data, message)
}

logger.warn = (data, message) => {
	writeToFile('warn', message || data, typeof data === 'object' ? data : {})
	originalWarn(data, message)
}

logger.debug = (data, message) => {
	writeToFile('debug', message || data, typeof data === 'object' ? data : {})
	originalDebug(data, message)
}

/**
 * Middleware для логирования HTTP запросов
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция next
 */
const requestLogger = (req, res, next) => {
	if (req.method === 'OPTIONS' || req.method === 'HEAD') {
		return next()
	}

	const start = Date.now()

	res.on('finish', () => {
		const duration = Date.now() - start
		const logData = {
			method: req.method,
			url: req.url,
			status: res.statusCode,
			duration: `${duration}ms`,
			userAgent: req.get('User-Agent'),
			ip: req.ip || req.connection.remoteAddress,
			userId: req.user?.id || 'anonymous',
			requestId: req.id || 'unknown',
		}

		if (res.statusCode >= 400) {
			logger.warn(logData, 'HTTP Request')
		} else {
			logger.info(logData, 'HTTP Request')
		}
	})

	next()
}

const logError = (error, context = {}) => {
	const errorData = {
		message: error.message,
		stack: error.stack,
		name: error.name,
		code: error.code,
		...context,
	}

	logger.error(errorData, 'Application Error')
}

const logInfo = (message, data = {}) => {
	logger.info(data, message)
}

const logWarn = (message, data = {}) => {
	logger.warn(data, message)
}

const logDebug = (message, data = {}) => {
	logger.debug(data, message)
}

const rotateLogs = () => {
	const date = new Date().toISOString().split('T')[0]
	const files = ['application.log']

	files.forEach(filename => {
		const filePath = path.join(logsDir, filename)
		if (fs.existsSync(filePath)) {
			const newPath = path.join(logsDir, `${filename}.${date}`)
			fs.renameSync(filePath, newPath)
		}
	})

	logger.info('Log files rotated successfully')
}

const cleanOldLogs = () => {
	const maxAge = parseInt(process.env.REFRESH_TOKEN_MAX_AGE)
	const now = Date.now()

	fs.readdir(logsDir, (err, files) => {
		if (err) {
			logger.error({ err }, 'Error reading logs directory')
			return
		}

		files.forEach(file => {
			if (file.includes('.log.')) {
				const filePath = path.join(logsDir, file)
				fs.stat(filePath, (err, stats) => {
					if (err) return

					if (now - stats.mtime.getTime() > maxAge) {
						fs.unlink(filePath, err => {
							if (err) {
								logger.error({ err, file }, 'Error deleting old log file')
							} else {
								logger.info({ file }, 'Deleted old log file')
							}
						})
					}
				})
			}
		})
	})
}

module.exports = {
	logger,
	requestLogger,
	logError,
	logInfo,
	logWarn,
	logDebug,
	rotateLogs,
	cleanOldLogs,
}
