const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const UserModel = require('../models/user-model')
const KeysModel = require('../models/keys-model')
const LevelModel = require('../models/level-model')
const uuid = require('uuid')

passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
			callbackURL: `${process.env.API_URL}/auth/github/callback`,
			scope: ['user:email'],
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				let user = await UserModel.findOne({ 'github.id': profile.id })

				if (!user) {
					const primaryEmail = profile.emails[0].value.toLowerCase()

					user = await UserModel.findOne({ email: primaryEmail })

					if (user) {
						user.github = {
							id: profile.id,
							email: primaryEmail,
						}
						await user.save()
					} else {
						user = await UserModel.create({
							email: primaryEmail,
							name: profile.displayName || profile.username,
							activation_link: uuid.v4(),
							is_activated: true,
							change_password: false,
							source: 'github',
							github: {
								id: profile.id,
								email: primaryEmail,
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
