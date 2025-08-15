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

	constructor(model) {
		this.id = model.orderId
		this.symbol = model.symbol
		this.closed_time = +model.updatedTime
		this.open_time = +model.createdTime
		this.direction = model.side === 'Buy' ? 'short' : 'long'
		this.leverage = +model.leverage
		this.quality = parseFloat(model.qty).toFixed(4)
		this.margin = parseFloat(model.cumEntryValue).toFixed(2)
		this.open_fee = parseFloat(model.openFee).toFixed(4)
		this.closed_fee = parseFloat(model.closeFee).toFixed(4)
		this.pnl = parseFloat(model.closedPnl).toFixed(4)
		this.roi = parseFloat(this.calculateRoi(model).toFixed(2))
	}

	calculateRoi = model => {
		const qty = parseFloat(model.qty) || 0
		const leverage = parseFloat(model.leverage) || 1
		const avgEntryPrice = parseFloat(model.avgEntryPrice) || 0
		const closedPnl = parseFloat(model.closedPnl) || 0

		if (qty <= 0 || leverage <= 0 || avgEntryPrice <= 0) {
			return 0
		}

		const initialMargin = (qty * avgEntryPrice) / leverage
		const roi = initialMargin > 0 ? (closedPnl / initialMargin) * 100 : 0

		return roi
	}
}
