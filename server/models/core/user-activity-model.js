const { Schema, model } = require('mongoose')

const UserActivitySchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	email: { type: String },
	name: { type: String },
	last_name: { type: String },
	ip_address: { type: String },
	user_agent: { type: String },
	activity_date: { type: String, required: true },
	created_at: { type: Date, default: Date.now, required: true },
	updated_at: { type: Date, default: Date.now, required: true },
})

UserActivitySchema.index({ user: 1, activity_date: 1 })
UserActivitySchema.index({ user: 1, created_at: -1 })
UserActivitySchema.index({ created_at: -1 })

module.exports = model('UserActivity', UserActivitySchema)
