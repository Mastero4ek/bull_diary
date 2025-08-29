const { Schema, model } = require('mongoose')

const TokenSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	refresh_token: { type: String, required: true },
})

TokenSchema.index({ user: 1 })
TokenSchema.index({ refresh_token: 1 })
TokenSchema.index({ user: 1, refresh_token: 1 })

module.exports = model('Token', TokenSchema)
