/**
 * Middleware для определения языка пользователя
 * Устанавливает язык из cookies или заголовков браузера
 */
const langMiddleware = (req, res, next) => {
	req.lng =
		req.cookies?.language ||
		req.headers['accept-language']?.split(',')[0]?.slice(0, 2) ||
		'en'
	next()
}

module.exports = langMiddleware
