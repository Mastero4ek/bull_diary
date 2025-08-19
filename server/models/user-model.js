const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
	name: { type: String, required: true },
	role: { type: String, default: 'user' },
	last_name: { type: String, default: '' },
	email: { type: String, unique: true, required: true },
	password: { type: String, required: false },
	activation_link: { type: String },
	source: { type: String, default: 'self' }, // 'self' for local registration, 'google'/'github' for OAuth
	is_activated: { type: Boolean, default: false },
	inactive: { type: Boolean, default: false },
	change_password: { type: Boolean, default: true },
	phone: { type: Number, default: null },
	cover: { type: String, default: null },
	tournaments: [
		{
			exchange: { type: String, required: true },
			id: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
		},
	],
	google: {
		type: {
			id: { type: String },
			email: { type: String },
		},
		default: undefined,
	},
	github: {
		type: {
			id: { type: String },
			email: { type: String },
		},
		default: undefined,
	},
	created_at: { type: Date, default: Date.now, required: true },
	updated_at: { type: Date, default: Date.now },
})

// Ensure created_at is set before saving
UserSchema.pre('save', function (next) {
	if (this.isNew && !this.created_at) {
		this.created_at = new Date()
	}

	next()
})

// Ensure updated_at is set before saving
UserSchema.pre('save', function (next) {
	this.updated_at = new Date()
	next()
})

// Ensure updated_at is set before updating
UserSchema.pre('findOneAndUpdate', function (next) {
	this.set({ updated_at: new Date() })
	next()
})

UserSchema.pre('updateOne', function (next) {
	this.set({ updated_at: new Date() })
	next()
})

UserSchema.pre('updateMany', function (next) {
	this.set({ updated_at: new Date() })
	next()
})

module.exports = model('User', UserSchema)
