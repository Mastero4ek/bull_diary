const DataService = require('../services/data-service')

module.exports = class BybitOrderDto {
	id
	symbol
	closed_time
	open_time
	direction
	leverage
	quality
	margin
	open_fee
	closed_fee
	pnl
	roi
	bookmark
	sync_time

	constructor(model) {
		this.id = model.orderId || model.id
		this.symbol = model.symbol
		this.closed_time = model.closed_time || +model.updatedTime
		this.open_time = model.open_time || +model.createdTime
		this.direction =
			model.direction || (model.side === 'Buy' ? 'short' : 'long')
		this.leverage = Number(parseFloat(model.leverage || 1))
		this.quality = Number(
			parseFloat(model.quality || model.qty || 0).toFixed(4)
		)
		this.margin = Number(
			parseFloat(model.margin || model.cumEntryValue || 0).toFixed(4)
		)
		this.open_fee = Number(
			parseFloat(model.open_fee || model.openFee || 0).toFixed(4)
		)
		this.closed_fee = Number(
			parseFloat(model.closed_fee || model.closeFee || 0).toFixed(4)
		)
		this.pnl = Number(parseFloat(model.pnl || model.closedPnl || 0).toFixed(4))
		this.roi = Number(
			parseFloat(model.roi || DataService.calculateRoi(model) || 0).toFixed(2)
		)
		this.bookmark = model.bookmark || false
		this.sync_time = model.sync_time
	}
}
