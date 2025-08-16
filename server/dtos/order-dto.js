module.exports = class OrderDto {
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
		this.id = model.id
		this.symbol = model.symbol
		this.closed_time = +model.closed_time
		this.open_time = +model.open_time
		this.direction = model.side === 'Buy' ? 'short' : 'long'
		this.leverage = +model.leverage
		this.quality = +model.quality
		this.margin = +model.margin
		this.open_fee = +model.open_fee
		this.closed_fee = +model.closed_fee
		this.pnl = +model.pnl
		this.roi = +model.roi
	}
}
