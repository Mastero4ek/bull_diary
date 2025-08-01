require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

const connectDB = require('../config/database')
const User = require('../models/user-model')
const Keys = require('../models/keys-model')
const Level = require('../models/level-model')

const { logInfo, logWarn, logError } = require('../config/logger')

async function seedUser() {
	await connectDB()

	const email = 'tdiary2023@gmail.com'
	const role = 'admin'
	const password = '123456'
	const name = 'Admin'
	const last_name = 'Admin'
	const phone = 1234567890

	const existing = await User.findOne({ email })
	if (existing) {
		logWarn('User already exists', { email })

		mongoose.disconnect()
		return
	}

	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(password, salt)

	const activation_link = uuidv4()
	const user = await User.create({
		name,
		role,
		last_name,
		email,
		password: hashedPassword,
		activation_link,
		source: 'seeder',
		is_activated: true,
		change_password: false,
		phone,
		cover: null,
		created_at: new Date(),
		updated_at: new Date(),
	})
	logInfo('User created', { userId: user._id, email: user.email })

	const keys = await Keys.create({ user: user._id })
	logInfo('Keys created', { keysId: keys._id, userId: user._id })
	const level = await Level.create({ user: user._id })
	logInfo('Level created', { levelId: level._id, userId: user._id })

	mongoose.disconnect()
	logInfo('Seeding completed!')
}

seedUser().catch(err => {
	logError(err, { context: 'admin seeder' })
})
