const { Schema, model } = require('mongoose')

const TransactionSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	exchange: { type: String, required: true },
	bookmark: { type: Boolean, default: false },
	transactionTime: { type: Date, required: true },
	symbol: { type: String, default: '' },
	currency: { type: String, default: '' },
	category: { type: String, default: '' },
	side: { type: String, default: '' },
	type: { type: String, required: true },
	change: { type: Number, required: true, default: 0 },
	cashFlow: { type: Number, required: true, default: 0 },
	cashBalance: { type: Number, default: null },
	funding: { type: Number, required: true, default: 0 },
	fee: { type: Number, required: true, default: 0 },
	sync_time: { type: Date, required: true, default: Date.now },
})

TransactionSchema.index({ user: 1, transactionTime: -1 })
TransactionSchema.index({ user: 1, bookmark: 1, transactionTime: -1 })
TransactionSchema.index({ user: 1, symbol: 1 })
TransactionSchema.index({ user: 1, type: 1 })
TransactionSchema.index({ user: 1, side: 1 })
TransactionSchema.index({ user: 1, category: 1 })
TransactionSchema.index({ user: 1, change: -1 })
TransactionSchema.index({ user: 1, cashBalance: -1 })
TransactionSchema.index(
	{ exchange: 1, transactionTime: 1, type: 1, user: 1 },
	{ unique: true }
)

module.exports = model('Transaction', TransactionSchema)
