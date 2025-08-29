const path = require('path')

const i18next = require('i18next')
const Backend = require('i18next-fs-backend')

const initI18next = async () => {
	return i18next.use(Backend).init({
		preload: ['en', 'ru'],
		fallbackLng: 'en',
		backend: {
			loadPath: path.join(__dirname, '../locales/{{lng}}/translation.json'),
		},
		interpolation: {
			escapeValue: false,
		},
	})
}

module.exports = { initI18next, i18next }
