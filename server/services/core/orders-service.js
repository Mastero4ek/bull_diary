const Order = require('@models/core/order-model')
const DescriptionModel = require('@models/core/description-model')
const { ApiError } = require('@exceptions/api-error')
const i18next = require('i18next')
const { clearOrdersCache } = require('@helpers/cache-helpers')
const { handleDatabaseError } = require('@helpers/error-helpers')
const BybitOrderDto = require('@dtos/bybit-order-dto')

class OrdersService {
	/**
	 * Сохраняет ордер в закладки пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {string} userId - ID пользователя
	 * @param {Object} order - Объект ордера
	 * @param {string} exchange - Название биржи
	 * @returns {Promise<Object>} - Объект с сохраненным ордером
	 */
	async savedOrder(lng = 'en', userId, order, exchange) {
		try {
			const existing_order = await Order.findOneAndUpdate(
				{
					user: userId,
					exchange,
					id: order.id,
				},
				{
					$set: {
						bookmark: true,
					},
				},
				{
					new: true,
				}
			)

			if (!existing_order) {
				throw ApiError.BadRequest(
					i18next.t('error.validation.order_not_exists', { lng })
				)
			}

			await clearOrdersCache(userId, exchange, 'savedOrder')

			const order_dto = new BybitOrderDto(existing_order)

			return { order: order_dto }
		} catch (error) {
			handleDatabaseError(error, lng, 'savedOrder', 'Failed to save order')
		}
	}

	/**
	 * Удаляет ордер из закладок пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {string} userId - ID пользователя
	 * @param {Object} order - Объект ордера
	 * @param {string} exchange - Название биржи
	 * @returns {Promise<Object>} - Объект с удаленным ордером
	 */
	async removedOrder(lng = 'en', userId, order, exchange) {
		try {
			const removed_order = await Order.findOneAndUpdate(
				{
					user: userId,
					exchange,
					id: order.id,
				},
				{
					$set: {
						bookmark: false,
					},
				},
				{
					new: true,
				}
			)

			if (!removed_order) {
				throw ApiError.BadRequest(
					i18next.t('error.validation.order_not_exists', { lng })
				)
			}

			await clearOrdersCache(userId, exchange, 'removedOrder')

			const order_dto = new BybitOrderDto(removed_order)

			return { order: order_dto }
		} catch (error) {
			handleDatabaseError(error, lng, 'removedOrder', 'Failed to remove order')
		}
	}

	/**
	 * Получает описание ордера пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {string} userId - ID пользователя
	 * @param {string} orderId - ID ордера
	 * @returns {Promise<Object>} - Объект с описанием ордера
	 */
	async getOrderDescription(lng = 'en', userId, orderId) {
		try {
			const description = await DescriptionModel.findOne({
				user: userId,
				orderId,
			})

			if (!description) {
				return { description: '' }
			}

			return { description: description.text }
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'getOrderDescription',
				'Failed to get order description'
			)
		}
	}

	/**
	 * Обновляет описание ордера пользователя
	 * @param {string} lng - Язык для локализации (по умолчанию 'en')
	 * @param {string} userId - ID пользователя
	 * @param {string} orderId - ID ордера
	 * @param {string} text - Текст описания
	 * @returns {Promise<Object>} - Объект с обновленным описанием ордера
	 */
	async updateOrderDescription(lng = 'en', userId, orderId, text) {
		try {
			const exist_description = await DescriptionModel.findOne({
				user: userId,
				orderId,
			})

			let description = null

			if (!exist_description && text !== '') {
				description = await DescriptionModel.create({
					user: userId,
					orderId,
					text,
				})
			} else if (exist_description && text !== '') {
				description = await DescriptionModel.findOneAndUpdate(
					{ user: userId, orderId },
					{
						$set: {
							text: text,
						},
					},
					{ returnDocument: 'after' }
				)
			} else if (exist_description && text === '') {
				description = await DescriptionModel.findOneAndDelete({
					user: userId,
					orderId,
				})

				return { description: '' }
			}

			return { description: description?.text }
		} catch (error) {
			handleDatabaseError(
				error,
				lng,
				'getOrderDescription',
				'Failed to update order description'
			)
		}
	}
}

module.exports = new OrdersService()
