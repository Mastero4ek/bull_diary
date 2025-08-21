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
		if (model.transactionTime instanceof Date) {
			this.transactionTime = model.transactionTime
		} else if (typeof model.transactionTime === 'string') {
			this.transactionTime = new Date(model.transactionTime)
		} else if (typeof model.transactionTime === 'number') {
			this.transactionTime = new Date(model.transactionTime)
		} else {
			this.transactionTime = new Date()
		}
		this.change = Number(parseFloat(model.change || 0).toFixed(4))
		this.cashFlow = Number(parseFloat(model.cashFlow || 0).toFixed(4))

		if (
			model.cashBalance !== null &&
			model.cashBalance !== undefined &&
			model.cashBalance !== ''
		) {
			this.cashBalance = Number(parseFloat(model.cashBalance).toFixed(4))
		} else {
			this.cashBalance = null
		}

		this.symbol = model.symbol || ''
		this.currency = model.currency || ''
		this.category = model.category || ''
		this.side = model.side || ''
		this.type = model.type || ''
		this.funding = Number(parseFloat(model.funding || 0).toFixed(4))
		this.fee = Number(parseFloat(model.fee || 0).toFixed(4))
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
