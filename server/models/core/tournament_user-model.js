const { Schema, model } = require('mongoose')

const TournamentUserSchema = new Schema({
	tournament: { type: Schema.Types.ObjectId, ref: 'Tournament' },
	id: { type: Schema.Types.ObjectId, required: true },
	name: { type: String, required: true },
	last_name: { type: String },
	cover: { type: String, default: null },
	level: { type: Object, required: true },
	registration_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
})

TournamentUserSchema.index({ tournament: 1 })
TournamentUserSchema.index({ id: 1 })
TournamentUserSchema.index({ name: 1 })
TournamentUserSchema.index({ last_name: 1 })
TournamentUserSchema.index({ registration_at: -1 })
TournamentUserSchema.index({ updated_at: -1 })
TournamentUserSchema.index({ tournament: 1, registration_at: -1 })
TournamentUserSchema.index({ tournament: 1, id: 1 })
TournamentUserSchema.index({ name: 1, last_name: 1 })

module.exports = model('TournamentUser', TournamentUserSchema)
