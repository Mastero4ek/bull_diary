const { Schema, model } = require('mongoose')

const LevelSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	level: {
		type: Object,
		default: { name: 'hamster', value: 0 },
		required: true,
	},
})

LevelSchema.index({ user: 1 })
LevelSchema.index({ 'level.value': -1 })

module.exports = model('Level', LevelSchema)
