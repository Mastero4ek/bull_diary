const { Schema, model } = require('mongoose')

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
			const KeysModel = require('./keys-model')
			const LevelModel = require('./level-model')
			const TokenModel = require('./token-model')
			const TournamentUserModel = require('./tournament_user-model')
			const OrderModel = require('./order-model')
			const TransactionModel = require('./transaction-model')
			const FileModel = require('./file-model')

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
			const KeysModel = require('./keys-model')
			const LevelModel = require('./level-model')
			const TokenModel = require('./token-model')
			const TournamentUserModel = require('./tournament_user-model')
			const OrderModel = require('./order-model')
			const TransactionModel = require('./transaction-model')
			const FileModel = require('./file-model')

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
			const KeysModel = require('./keys-model')
			const LevelModel = require('./level-model')
			const TokenModel = require('./token-model')
			const TournamentUserModel = require('./tournament_user-model')
			const OrderModel = require('./order-model')
			const TransactionModel = require('./transaction-model')
			const FileModel = require('./file-model')

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

module.exports = model('User', UserSchema)
