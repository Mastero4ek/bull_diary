const passport = require('passport')

const UserModel = require('@models/core/user-model')

passport.initialize()
passport.session()

/**
 * Сериализация пользователя для сессии
 * @param {Object} user - Объект пользователя
 * @param {Function} done - Callback функция
 */
passport.serializeUser((user, done) => {
	done(null, user)
})

/**
 * Десериализация пользователя из сессии
 * @param {Object} user - Объект пользователя из сессии
 * @param {Function} done - Callback функция
 */
passport.deserializeUser(async (user, done) => {
	try {
		let currentUser = {}

		if (user.provider === 'google') {
			currentUser = await UserModel.findOne({ email: user._json.email })
		} else if (user.provider === 'github') {
			currentUser = await UserModel.findOne({
				email: user.emails[0].value.toLowerCase(),
			})
		}

		if (!currentUser && user.provider === 'google' && user.id) {
			currentUser = await UserModel.findOne({ 'google.id': user.id })
		} else if (!currentUser && user.provider === 'github' && user.id) {
			currentUser = await UserModel.findOne({ 'github.id': user.id })
		}

		done(null, currentUser)
	} catch (err) {
		done(err)
	}
})

module.exports = passport
