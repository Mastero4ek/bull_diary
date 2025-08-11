const { Schema, model } = require('mongoose')

const DescriptionSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	orderId: { type: String, required: true },
	text: { type: String, required: true },
})

module.exports = model('Description', DescriptionSchema)
