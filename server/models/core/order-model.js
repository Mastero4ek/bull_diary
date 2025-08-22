const { Schema, model } = require('mongoose')

const OrderSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	exchange: { type: String, required: true },
	bookmark: { type: Boolean, default: false },
	id: { type: String, required: true },
	symbol: { type: String, required: true },
	closed_time: { type: Date, required: true },
	open_time: { type: Date, required: true },
	sync_time: { type: Date, required: true, default: Date.now },
	direction: { type: String, required: true },
	leverage: { type: Number, required: true },
	quality: { type: Number, required: true },
	margin: { type: Number, required: true },
	avgEntryPrice: { type: Number, required: true },
	open_fee: { type: Number, required: true },
	closed_fee: { type: Number, required: true },
	pnl: { type: Number, required: true },
	roi: { type: Number, required: true },
})

OrderSchema.index({ user: 1, open_time: 1, closed_time: 1 })
OrderSchema.index({ user: 1, bookmark: 1, open_time: 1, closed_time: 1 })
OrderSchema.index({ user: 1, symbol: 1 })
OrderSchema.index({ user: 1, direction: 1 })
OrderSchema.index({ user: 1, closed_time: -1 })
OrderSchema.index({ user: 1, pnl: -1 })
OrderSchema.index({ user: 1, roi: -1 })
OrderSchema.index({ exchange: 1, id: 1 }, { unique: true })

module.exports = model('Order', OrderSchema)
