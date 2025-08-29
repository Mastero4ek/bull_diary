const { Schema, model } = require('mongoose')

const TournamentSchema = new Schema({
	name: { type: String, require: true },
	description: { type: String, default: null },
	cover: { type: String, default: null },
	exchange: { type: String, require: true, unique: true },
	registration_date: { type: Date, require: true },
	start_date: { type: Date, require: true },
	end_date: { type: Date, require: true },
})

// TournamentSchema.index({ exchange: 1 }) // Removed - duplicate with unique constraint
TournamentSchema.index({ registration_date: -1 })
TournamentSchema.index({ start_date: -1 })
TournamentSchema.index({ end_date: -1 })
TournamentSchema.index({ exchange: 1, start_date: -1 })
TournamentSchema.index({ exchange: 1, end_date: -1 })

module.exports = model('Tournament', TournamentSchema)
