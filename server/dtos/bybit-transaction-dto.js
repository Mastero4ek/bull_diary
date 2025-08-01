module.exports = class BybitTransactionDto {
	transactionTime
	change
	cashFlow
	cashBalance
	symbol
	category
	side
	type
	funding
	fee

	constructor(model) {
		this.transactionTime = parseInt(model.transactionTime)
		this.change = parseFloat(Number(model.change || 0).toFixed(4))
		this.cashFlow = parseFloat(Number(model.cashFlow || 0).toFixed(4))
		this.cashBalance = parseFloat(Number(model.cashBalance || 0).toFixed(4))
		this.symbol = model.symbol || ''
		this.category = model.category || ''
		this.side = model.side || ''
		this.type = model.type || ''
		this.funding = parseFloat(Number(model.funding || 0).toFixed(4))
		this.fee = parseFloat(Number(model.fee || 0).toFixed(4))
	}

	isPositive() {
		return this.change > 0 || this.cashFlow > 0
	}

	isNegative() {
		return this.change < 0 || this.cashFlow < 0
	}

	getNetChange() {
		return this.change || this.cashFlow || 0
	}

	getAbsoluteValue() {
		return Math.abs(this.getNetChange())
	}
}
