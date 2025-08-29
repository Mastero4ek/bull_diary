require('dotenv').config()
const bcrypt = require('bcrypt')
const moment = require('moment')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const connectDB = require('@configs/database-config')
const { logInfo, logWarn, logError } = require('@configs/logger-config')
const Keys = require('@models/auth/keys-model')
const Level = require('@models/core/level-model')
const User = require('@models/core/user-model')

const fakeUsers = [
	{
		name: 'John',
		last_name: 'Smith',
		email: 'john.smith@example.com',
		phone: 1234567890,
		role: 'user',
		source: 'self',
		level: { name: 'hamster', value: 0 },
	},
	{
		name: 'Alice',
		last_name: 'Johnson',
		email: 'alice.johnson@example.com',
		phone: 2345678901,
		role: 'user',
		source: 'google',
		level: { name: 'bull', value: 150 },
	},
	{
		name: 'Bob',
		last_name: 'Williams',
		email: 'bob.williams@example.com',
		phone: 3456789012,
		role: 'user',
		source: 'self',
		level: { name: 'bear', value: 200 },
	},
	{
		name: 'Emma',
		last_name: 'Brown',
		email: 'emma.brown@example.com',
		phone: 4567890123,
		role: 'user',
		source: 'github',
		level: { name: 'shark', value: 300 },
	},
	{
		name: 'Michael',
		last_name: 'Davis',
		email: 'michael.davis@example.com',
		phone: 5678901234,
		role: 'user',
		source: 'self',
		level: { name: 'whale', value: 500 },
	},
	{
		name: 'Sarah',
		last_name: 'Miller',
		email: 'sarah.miller@example.com',
		phone: 6789012345,
		role: 'user',
		source: 'google',
		level: { name: 'hamster', value: 50 },
	},
	{
		name: 'David',
		last_name: 'Wilson',
		email: 'david.wilson@example.com',
		phone: 7890123456,
		role: 'user',
		source: 'self',
		level: { name: 'bull', value: 180 },
	},
	{
		name: 'Lisa',
		last_name: 'Moore',
		email: 'lisa.moore@example.com',
		phone: 8901234567,
		role: 'user',
		source: 'github',
		level: { name: 'bear', value: 250 },
	},
	{
		name: 'James',
		last_name: 'Taylor',
		email: 'james.taylor@example.com',
		phone: 9012345678,
		role: 'user',
		source: 'self',
		level: { name: 'shark', value: 350 },
	},
	{
		name: 'Jennifer',
		last_name: 'Anderson',
		email: 'jennifer.anderson@example.com',
		phone: 1122334455,
		role: 'user',
		source: 'google',
		level: { name: 'whale', value: 600 },
	},
	{
		name: 'Robert',
		last_name: 'Thomas',
		email: 'robert.thomas@example.com',
		phone: 2233445566,
		role: 'user',
		source: 'self',
		level: { name: 'hamster', value: 25 },
	},
	{
		name: 'Amanda',
		last_name: 'Jackson',
		email: 'amanda.jackson@example.com',
		phone: 3344556677,
		role: 'user',
		source: 'github',
		level: { name: 'bull', value: 120 },
	},
	{
		name: 'Christopher',
		last_name: 'White',
		email: 'christopher.white@example.com',
		phone: 4455667788,
		role: 'user',
		source: 'self',
		level: { name: 'bear', value: 280 },
	},
]

async function seedUsers() {
	try {
		await connectDB()
		logInfo('Connected to database')

		let createdCount = 0
		let skippedCount = 0

		for (const userData of fakeUsers) {
			const existing = await User.findOne({ email: userData.email })
			if (existing) {
				logWarn('User already exists', { email: userData.email })
				skippedCount++
				continue
			}

			const randomDaysAgo = Math.floor(Math.random() * 30)
			const createdDate = moment().subtract(randomDaysAgo, 'days').toDate()
			const updatedDate = moment(createdDate)
				.add(Math.floor(Math.random() * 10), 'days')
				.toDate()

			const user = await User.create({
				name: userData.name,
				last_name: userData.last_name,
				email: userData.email,
				password:
					userData.source === 'self'
						? await bcrypt.hash('password123', 10)
						: undefined,
				activation_link: uuidv4(),
				source: userData.source,
				is_activated: true,
				change_password: false,
				phone: userData.phone,
				cover: null,
				role: userData.role,
				created_at: createdDate,
				updated_at: updatedDate,
				...(userData.source === 'google' && {
					google: {
						id: `google_${Math.random().toString(36).substr(2, 9)}`,
						email: userData.email,
					},
				}),
				...(userData.source === 'github' && {
					github: {
						id: `github_${Math.random().toString(36).substr(2, 9)}`,
						email: userData.email,
					},
				}),
			})

			logInfo('User created', {
				name: `${user.name} ${user.last_name}`,
				email: user.email,
				userId: user._id,
			})

			const keys = await Keys.create({ user: user._id })
			logInfo('Keys created', { keysId: keys._id, userId: user._id })

			const level = await Level.create({
				user: user._id,
				level: userData.level,
			})
			logInfo('Level created', {
				levelName: level.level.name,
				levelValue: level.level.value,
				userId: user._id,
			})

			createdCount++
		}

		logInfo('Seeding completed!', {
			created: createdCount,
			skipped: skippedCount,
			total: fakeUsers.length,
		})
	} catch (error) {
		logError(error, { context: 'users seeder' })
	} finally {
		await mongoose.disconnect()
		logInfo('Disconnected from database')
	}
}

seedUsers()
