module.exports = class BybitTransactionDto {
	transactionTime
	change
	cashFlow
	cashBalance
	symbol
	currency
	category
	side
	type
	funding
	fee

	constructor(model) {
		this.transactionTime = parseInt(model.transactionTime)
		this.change = parseFloat(Number(model.change || 0).toFixed(4))
		this.cashFlow = parseFloat(Number(model.cashFlow || 0).toFixed(4))

		if (
			model.cashBalance !== null &&
			model.cashBalance !== undefined &&
			model.cashBalance !== ''
		) {
			this.cashBalance = parseFloat(Number(model.cashBalance).toFixed(4))
		} else {
			this.cashBalance = null
		}

		this.symbol = model.symbol || ''
		this.currency = model.currency || ''
		this.category = model.category || ''
		this.side = model.side || ''
		this.type = model.type || ''
		this.funding = parseFloat(Number(model.funding || 0).toFixed(4))
		this.fee = parseFloat(Number(model.fee || 0).toFixed(4))
	}

	isPositive() {
		const netChange = this.getNetChange()
		return netChange > 0
	}

	isNegative() {
		const netChange = this.getNetChange()
		return netChange < 0
	}

	getNetChange() {
		return this.change || this.cashFlow || 0
	}

	getAbsoluteValue() {
		return Math.abs(this.getNetChange())
	}
}
