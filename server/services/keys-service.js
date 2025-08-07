const KeysModel = require('../models/keys-model')
const UserModel = require('../models/user-model')
const KeysDto = require('../dtos/keys-dto')
const { ApiError } = require('../exceptions/api-error')
const i18next = require('i18next')
const Helpers = require('../helpers/helpers')

class KeysService {
	async findKeys(userId, lng = 'en') {
		try {
			const keys = await KeysModel.findOne({ user: userId })

			if (!keys) {
				throw ApiError.BadRequest(i18next.t('errors.keys_not_found', { lng }))
			}

			return keys
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'findKeys',
				'errors.keys_not_found'
			)
		}
	}

	async updateKeys(userId, exchange, api, secret, lng = 'en') {
		try {
			const keys = await KeysModel.findOne({ user: userId })

			if (!keys) {
				throw ApiError.BadRequest(i18next.t('errors.keys_not_found', { lng }))
			}

			const exchangeExists = keys.keys.some(key => key.name === exchange)

			if (!exchangeExists) {
				throw ApiError.BadRequest(
					i18next.t('errors.exchange_not_found_in_keys', { lng, exchange })
				)
			}

			keys.keys = keys.keys.map(key => {
				if (key.name === exchange) {
					return {
						...key,
						api: api !== key.api ? api : key.api,
						secret: secret !== key.secret ? secret : key.secret,
					}
				}

				return key
			})

			await keys.save()

			const keys_dto = new KeysDto(keys)

			return keys_dto
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'updateKeys',
				'errors.keys_update_failed'
			)
		}
	}

	async removeKeys(email, lng = 'en') {
		try {
			const user = await UserModel.findOne({ email })

			if (!user) {
				throw ApiError.BadRequest(i18next.t('errors.user_not_found', { lng }))
			}

			const keys = await KeysModel.findOneAndDelete({ user: user._id })

			if (!keys) {
				throw ApiError.BadRequest(i18next.t('errors.keys_not_found', { lng }))
			}

			return {
				message: i18next.t('success.keys_deleted', { lng }),
			}
		} catch (error) {
			Helpers.handleDatabaseError(
				error,
				lng,
				'removeKeys',
				'errors.keys_deletion_failed'
			)
		}
	}
}

module.exports = new KeysService()
