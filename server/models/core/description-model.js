const { Schema, model } = require('mongoose')

const DescriptionSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	orderId: { type: String, required: true },
	text: { type: String, required: true },
})

DescriptionSchema.index({ user: 1 })
DescriptionSchema.index({ orderId: 1 })
DescriptionSchema.index({ user: 1, orderId: 1 })

module.exports = model('Description', DescriptionSchema)
