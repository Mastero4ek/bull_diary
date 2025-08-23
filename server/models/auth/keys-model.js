const { Schema, model } = require('mongoose')

const KeysSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	keys: {
		type: Array,
		default: [
			{
				id: 0,
				name: 'bybit',
				api: '',
				secret: '',
				sync: false,
			},
			{
				id: 1,
				name: 'mexc',
				api: '',
				secret: '',
				sync: false,
			},
			{
				id: 2,
				name: 'okx',
				api: '',
				secret: '',
				sync: false,
			},
		],
	},
})

module.exports = model('Keys', KeysSchema)
