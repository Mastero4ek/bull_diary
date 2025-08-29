const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const uuid = require('uuid')

const KeysModel = require('@models/auth/keys-model')
const LevelModel = require('@models/core/level-model')
const UserModel = require('@models/core/user-model')

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_ID,
			clientSecret: process.env.GOOGLE_SECRET,
			callbackURL: `${process.env.API_URL}/auth/google/callback`,
			scope: ['profile', 'email'],
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				let user = await UserModel.findOne({ 'google.id': profile.id })

				if (!user) {
					const googleEmail = profile.emails[0].value.toLowerCase()
					user = await UserModel.findOne({ email: googleEmail })

					if (user) {
						user.google = {
							id: profile.id,
							email: googleEmail,
						}
						await user.save()
					} else {
						const googleEmail = profile.emails[0].value.toLowerCase()
						user = await UserModel.create({
							email: googleEmail,
							name: profile.displayName,
							activation_link: uuid.v4(),
							is_activated: true,
							change_password: false,
							source: 'google',
							google: {
								id: profile.id,
								email: googleEmail,
							},
						})

						await KeysModel.create({
							user: user._id,
						})

						await LevelModel.create({
							user: user._id,
						})
					}
				}

				return done(null, user)
			} catch (error) {
				return done(error, null)
			}
		}
	)
)

module.exports = passport
