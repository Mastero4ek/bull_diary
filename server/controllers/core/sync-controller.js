const SyncService = require('@services/core/sync-service')
const KeysService = require('@services/auth/keys-service')
const { validationError } = require('@helpers/sanitization-helpers')
const { capitalize } = require('@helpers/utility-helpers')
const { ApiError } = require('@exceptions/api-error')
const i18next = require('i18next')

class SyncController {
	async getSyncProgress(req, res, next) {
		try {
			validationError(req, next)

			const user = req.user
			const progress = SyncService.getSyncProgress(user.id)

			return res.json({
				progress: progress.progress,
				status: progress.status,
				message: progress.message,
			})
		} catch (e) {
			next(e)
		}
	}

	async syncData(req, res, next) {
		try {
			validationError(req, next)

			const { exchange, start_time, end_time } = req.body
			const user = req.user
			const keys = await KeysService.findDecryptedKeys(user.id, req.lng)

			if (!keys || keys.message) {
				throw ApiError.BadRequest(
					i18next.t('errors.keys_not_found', { lng: req.lng })
				)
			}

			const current_keys = keys.keys.find(item => item.name === exchange)

			if (!current_keys || !current_keys.api || !current_keys.secret) {
				throw ApiError.BadRequest(
					i18next.t('errors.keys_not_configured', {
						lng: req.lng,
						exchange: capitalize(exchange),
					})
				)
			}

			const startMs =
				typeof start_time === 'string'
					? new Date(start_time).getTime()
					: start_time
			const endMs =
				typeof end_time === 'string' ? new Date(end_time).getTime() : end_time

			const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

			SyncService.setSyncProgress(
				user.id,
				0,
				'loading',
				i18next.t('sync.starting_sync', { lng: req.lng })
			)

			const ordersResult = await SyncService.syncOrders(
				user.id,
				req.lng,
				exchange,
				current_keys,
				startMs,
				endMs
			)

			SyncService.setSyncProgress(
				user.id,
				50,
				'loading',
				i18next.t('sync.preparing_transactions', { lng: req.lng })
			)

			await delay(5000)

			const transactionsResult = await SyncService.syncTransactions(
				user.id,
				req.lng,
				exchange,
				current_keys,
				startMs,
				endMs
			)

			if (transactionsResult && transactionsResult.success) {
				SyncService.setSyncProgress(
					user.id,
					100,
					'success',
					i18next.t('sync.all_completed', { lng: req.lng })
				)
			}

			setTimeout(() => {
				SyncService.clearSyncProgress(user.id)
			}, 2000)

			res.json({
				success: true,
				orders: {
					success: ordersResult.success,
					dataCount: ordersResult.dataCount,
					totalDataFromApi: ordersResult.totalDataFromApi,
				},
				transactions: {
					success: transactionsResult.success,
					dataCount: transactionsResult.dataCount,
					totalDataFromApi: transactionsResult.totalDataFromApi,
				},
				summary: {
					totalOrders: ordersResult.dataCount || 0,
					totalTransactions: transactionsResult.dataCount || 0,
					totalSynced:
						(ordersResult.dataCount || 0) + (transactionsResult.dataCount || 0),
				},
			})
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new SyncController()
