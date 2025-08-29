const { Schema, model } = require('mongoose')

const KeysModel = require('../auth/keys-model')
const TokenModel = require('../auth/token-model')

const FileModel = require('./file-model')
const LevelModel = require('./level-model')
const OrderModel = require('./order-model')
const TournamentUserModel = require('./tournament_user-model')
const TransactionModel = require('./transaction-model')

const UserSchema = new Schema({
	name: { type: String, required: true },
	role: { type: String, default: 'user' },
	last_name: { type: String, default: '' },
	email: { type: String, unique: true, required: true },
	password: { type: String, required: false },
	activation_link: { type: String },
	source: { type: String, default: 'self' },
	is_activated: { type: Boolean, default: false },
	inactive: { type: Boolean, default: false },
	change_password: { type: Boolean, default: false },
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

UserSchema.pre('save', function (next) {
	if (this.isNew && !this.created_at) {
		this.created_at = new Date()
	}

	next()
})

UserSchema.pre('save', function (next) {
	this.updated_at = new Date()
	next()
})

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

UserSchema.pre('findOneAndDelete', async function (next) {
	try {
		const user = await this.model.findOne(this.getQuery())

		if (user) {
			await Promise.all([
				KeysModel.deleteOne({ user: user._id }),
				LevelModel.deleteOne({ user: user._id }),
				TokenModel.deleteMany({ user: user._id }),
				TournamentUserModel.deleteMany({ user: user._id }),
				OrderModel.deleteMany({ user: user._id }),
				TransactionModel.deleteMany({ user: user._id }),
				FileModel.deleteMany({ user: user._id }),
			])
		}
		next()
	} catch (error) {
		next(error)
	}
})

UserSchema.pre('deleteOne', async function (next) {
	try {
		const user = await this.model.findOne(this.getQuery())

		if (user) {
			await Promise.all([
				KeysModel.deleteOne({ user: user._id }),
				LevelModel.deleteOne({ user: user._id }),
				TokenModel.deleteMany({ user: user._id }),
				TournamentUserModel.deleteMany({ user: user._id }),
				OrderModel.deleteMany({ user: user._id }),
				TransactionModel.deleteMany({ user: user._id }),
				FileModel.deleteMany({ user: user._id }),
			])
		}
		next()
	} catch (error) {
		next(error)
	}
})

UserSchema.pre('deleteMany', async function (next) {
	try {
		const users = await this.model.find(this.getQuery())

		if (users.length > 0) {
			const userIds = users.map(user => user._id)

			await Promise.all([
				KeysModel.deleteMany({ user: { $in: userIds } }),
				LevelModel.deleteMany({ user: { $in: userIds } }),
				TokenModel.deleteMany({ user: { $in: userIds } }),
				TournamentUserModel.deleteMany({ user: { $in: userIds } }),
				OrderModel.deleteMany({ user: { $in: userIds } }),
				TransactionModel.deleteMany({ user: { $in: userIds } }),
				FileModel.deleteMany({ user: { $in: userIds } }),
			])
		}
		next()
	} catch (error) {
		next(error)
	}
})

UserSchema.index({ name: 1 })
UserSchema.index({ last_name: 1 })
UserSchema.index({ email: 1 })
UserSchema.index({ inactive: 1 })
UserSchema.index({ created_at: -1 })
UserSchema.index({ updated_at: -1 })
UserSchema.index({ name: 1, last_name: 1 })
UserSchema.index({ inactive: 1, created_at: -1 })
UserSchema.index({ name: 'text', last_name: 'text', email: 'text' })

module.exports = model('User', UserSchema)
