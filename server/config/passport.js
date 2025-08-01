const passport = require('passport')
const UserModel = require('../models/user-model')

// Initialize passport
passport.initialize()
passport.session()

// Serialize user for the session
passport.serializeUser((user, done) => {
	done(null, user)
})

// Deserialize user from the session
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

		// If user not found by email, try to find by OAuth ID
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
