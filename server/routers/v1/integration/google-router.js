const Router = require('express').Router
const router = new Router()
const passport = require('passport')

const { logError } = require('@configs/logger-config')
const UserDto = require('@dtos/user-dto')
const KeysModel = require('@models/auth/keys-model')
const LevelModel = require('@models/core/level-model')
const tokenService = require('@services/auth/token-service')

router.get(
	'/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get(
	'/google/callback',
	passport.authenticate('google', { session: false }),
	async (req, res) => {
		try {
			const user = req.user
			const keys = await KeysModel.findOne({ user: user._id })
			const level = await LevelModel.findOne({ user: user._id })
			const userDto = new UserDto(user)

			if (!keys) {
				throw new Error('User keys not found')
			}
			const tokens = await tokenService.generateTokens({ ...userDto }, req.lng)

			await tokenService.saveToken(userDto.id, tokens.refresh_token, req.lng)

			res.cookie('refresh_token', tokens.refresh_token, {
				maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: process.env.NODE_ENV === 'prod',
				sameSite: 'strict',
			})

			res.cookie('access_token', tokens.access_token, {
				maxAge: parseInt(process.env.ACCESS_TOKEN_MAX_AGE),
				httpOnly: true,
				secure: process.env.NODE_ENV === 'prod',
				sameSite: 'strict',
			})

			res.redirect(`${process.env.CLIENT_URL}/auth/success`)
		} catch (error) {
			logError(error, {
				context: 'Google auth callback',
				userId: req.user?._id,
			})

			res.redirect(`${process.env.CLIENT_URL}/auth/error`)
		}
	}
)

module.exports = router
