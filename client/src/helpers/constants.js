export const EXCHANGES = [
	{ checked_id: 0, name: 'Bybit' },
	{ checked_id: 1, name: 'Mexc' },
	{ checked_id: 2, name: 'Okx' },
]

export const fakePnlOrders = [
	{
		id: 'b1434a46-edaa-4d4d-912c-47c5aabc9d5c',
		symbol: 'ENAUSDT',
		closed_time: '2024-12-28T12:31:07.622Z',
		open_time: '2024-12-28T12:09:22.637Z',
		direction: 'short',
		leverage: 20,
		quality: 51,
		margin: 21.39,
		pnl: -0.494,
		roi: -46.15,
	},
	{
		id: 'd8e59dfd-f8c9-41a2-bb51-84a52f6357d5',
		symbol: 'BTCUSDT',
		closed_time: '2024-12-21T12:21:05.428Z',
		open_time: '2024-12-20T19:17:35.743Z',
		direction: 'short',
		leverage: 100,
		quality: 0.002,
		margin: 191.32,
		pnl: -1.24,
		roi: -64.8,
	},
	{
		id: '1d5c68f0-71a9-4b36-890a-aec494dd51c5',
		symbol: 'ETHUSDT',
		closed_time: '2024-12-20T12:30:57.938Z',
		open_time: '2024-12-19T19:23:08.290Z',
		direction: 'short',
		leverage: 100,
		quality: 0.001,
		margin: 95.94,
		pnl: -0.487,
		roi: -50.73,
	},
	{
		id: '9750d0d1-d382-48c9-a17c-ddf9c9aaa47c',
		symbol: 'LTCUSDT',
		closed_time: '2024-12-16T12:22:23.269Z',
		open_time: '2024-12-16T12:22:23.265Z',
		direction: 'short',
		leverage: 25,
		quality: 0.4,
		margin: 51.9,
		pnl: 0.092,
		roi: 4.45,
	},
	{
		id: '2effad37-4819-44cf-aaba-7adf9264ab66',
		symbol: 'BTCUSDT',
		closed_time: '2024-12-15T12:07:49.028Z',
		open_time: '2024-12-15T12:07:49.025Z',
		direction: 'short',
		leverage: 50,
		quality: 0.001,
		margin: 97.21,
		pnl: 0.206,
		roi: 10.62,
	},
]

export const fakeWallet = {
	total_balance: 234.6212,
	unrealised_pnl: 54.789,
	total_profit: 250.0,
	total_loss: -34.78,
	wining_trades: 28,
	losing_trades: 15,
	net_profit: 0.03,
	winrate: 65.12,
}

export const fakePositions = [
	{
		id: 0,
		symbol: 'BTCUSDT',
		direction: 'long',
		created_at: '2024-12-28T12:31:07.622Z',
		updated_at: '2024-12-28T12:31:07.622Z',
		leverage: 15,
		unrealisedPnl: 120.34,
	},
	{
		id: 1,
		symbol: 'ETHUSDT',
		direction: 'short',
		created_at: '2024-12-28T12:31:07.622Z',
		updated_at: '2024-12-28T12:31:07.622Z',
		leverage: 3,
		unrealisedPnl: -14.78,
	},
	{
		id: 2,
		symbol: 'TWTUSDT',
		direction: 'long',
		created_at: '2024-12-28T12:31:07.622Z',
		updated_at: '2024-12-28T12:31:07.622Z',
		leverage: 30,
		unrealisedPnl: 65.45,
	},
	{
		id: 3,
		symbol: 'LTCUSDT',
		direction: 'long',
		created_at: '2024-12-28T12:31:07.622Z',
		updated_at: '2024-12-28T12:31:07.622Z',
		leverage: 10,
		unrealisedPnl: 45.67,
	},
	{
		id: 4,
		symbol: 'XRPUSDT',
		direction: 'short',
		created_at: '2024-12-28T12:31:07.622Z',
		updated_at: '2024-12-28T12:31:07.622Z',
		leverage: 5,
		unrealisedPnl: -22.15,
	},
]

export const fakeUsers = [
	{
		id: 0,
		cover: null,
		name: 'John Doe',
		created_at: '2024-12-28T12:31:07.622Z',
		updated_at: '2024-12-28T12:31:07.622Z',
		email: 'john.doe@example.com',
		level: {
			name: 'shark',
			value: 127,
		},
		score: 100,
		roi: 57,
	},
	{
		id: 1,
		cover: null,
		name: 'Alice Smith',
		created_at: '2024-12-28T12:31:07.622Z',
		updated_at: '2024-12-28T12:31:07.622Z',
		email: 'alice.smith@example.com',
		level: {
			name: 'hamster',
			value: 150,
		},
		score: 120,
		roi: 60,
	},
	{
		id: 2,
		cover: null,
		name: 'Bob Johnson',
		created_at: '2024-12-28T12:31:07.622Z',
		updated_at: '2024-12-28T12:31:07.622Z',
		email: 'bob.johnson@example.com',
		level: {
			name: 'bull',
			value: 90,
		},
		score: 80,
		roi: 50,
	},
	{
		id: 3,
		cover: null,
		name: 'Charlie Brown',
		created_at: '2024-12-28T12:31:07.622Z',
		updated_at: '2024-12-28T12:31:07.622Z',
		email: 'charlie.brown@example.com',
		level: {
			name: 'bear',
			value: 200,
		},
		score: 150,
		roi: 70,
	},
	{
		id: 4,
		cover: null,
		name: 'Diana Prince',
		created_at: '2024-12-28T12:31:07.622Z',
		updated_at: '2024-12-28T12:31:07.622Z',
		email: 'diana.prince@example.com',
		level: {
			name: 'whale',
			value: 300,
		},
		score: 200,
		roi: 80,
	},
]

export const fakeWalletTransactions = (() => {
	const now = new Date()
	const currentYear = now.getFullYear()
	const currentMonth = now.getMonth() + 1
	const currentDate = now.getDate()

	const formatDate = date => {
		return date.toISOString().split('T')[0]
	}

	const formatTime = date => {
		return date.toISOString().split('T')[1].split('.')[0]
	}

	const formatISO = date => {
		return date.toISOString()
	}

	const weekTransactions = []
	for (let i = 0; i < 7; i++) {
		const date = new Date()
		date.setDate(date.getDate() - i)

		weekTransactions.push({
			transactionTime: formatISO(date),
			date: formatDate(date),
			time: formatTime(date),
			symbol: [
				'BTCUSDT',
				'ETHUSDT',
				'SOLUSDT',
				'ADAUSDT',
				'DOTUSDT',
				'LINKUSDT',
				'USDT',
			][i],
			currency: 'USDT',
			category: '',
			side: i % 3 === 0 ? 'None' : i % 2 === 0 ? 'Sell' : 'Buy',
			type: i % 3 === 0 ? 'TRANSFER_IN' : 'TRADE',
			change: i % 2 === 0 ? 50 + i * 10 : -(30 + i * 5),
			cashFlow: i % 2 === 0 ? 50 + i * 10 : -(30 + i * 5),
			cashBalance: 1500 - i * 50,
			funding: 0,
			fee: i % 3 === 0 ? 0 : 0.5 + i * 0.2,
		})
	}

	for (let i = 0; i < 7; i++) {
		const date = new Date()
		date.setDate(date.getDate() - i)
		date.setHours(date.getHours() + 6)

		weekTransactions.push({
			transactionTime: formatISO(date),
			date: formatDate(date),
			time: formatTime(date),
			symbol: [
				'AVAXUSDT',
				'UNIUSDT',
				'ATOMUSDT',
				'NEARUSDT',
				'FTMUSDT',
				'ALGOUSDT',
				'VETUSDT',
			][i],
			currency: 'USDT',
			category: '',
			side: i % 2 === 0 ? 'Sell' : 'Buy',
			type: 'TRADE',
			change: i % 2 === 0 ? 25 + i * 5 : -(15 + i * 3),
			cashFlow: i % 2 === 0 ? 25 + i * 5 : -(15 + i * 3),
			cashBalance: 1400 - i * 30,
			funding: 0,
			fee: 0.3 + i * 0.1,
		})
	}

	const monthTransactions = []
	const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
	for (let i = 1; i <= daysInMonth; i += 3) {
		const date = new Date(
			currentYear,
			currentMonth - 1,
			i,
			12 + (i % 12),
			30,
			0
		)

		monthTransactions.push({
			transactionTime: formatISO(date),
			date: formatDate(date),
			time: formatTime(date),
			symbol: [
				'AVAXUSDT',
				'UNIUSDT',
				'ATOMUSDT',
				'NEARUSDT',
				'FTMUSDT',
				'ALGOUSDT',
				'VETUSDT',
			][i % 7],
			currency: 'USDT',
			category: '',
			side: i % 3 === 0 ? 'None' : i % 2 === 0 ? 'Sell' : 'Buy',
			type: i % 3 === 0 ? 'INTEREST' : 'TRADE',
			change: i % 2 === 0 ? 100 + i * 20 : -(60 + i * 10),
			cashFlow: i % 2 === 0 ? 100 + i * 20 : -(60 + i * 10),
			cashBalance: 1200 - i * 30,
			funding: 0,
			fee: i % 3 === 0 ? 0 : 1 + i * 0.3,
		})
	}

	while (monthTransactions.length < 3) {
		const i = monthTransactions.length + 1
		const date = new Date(
			currentYear,
			currentMonth - 1,
			Math.min(i, currentDate),
			12 + (i % 12),
			30,
			0
		)

		monthTransactions.push({
			transactionTime: formatISO(date),
			date: formatDate(date),
			time: formatTime(date),
			symbol: [
				'AVAXUSDT',
				'UNIUSDT',
				'ATOMUSDT',
				'NEARUSDT',
				'FTMUSDT',
				'ALGOUSDT',
				'VETUSDT',
			][i % 7],
			currency: 'USDT',
			category: '',
			side: i % 3 === 0 ? 'None' : i % 2 === 0 ? 'Sell' : 'Buy',
			type: i % 3 === 0 ? 'INTEREST' : 'TRADE',
			change: i % 2 === 0 ? 100 + i * 20 : -(60 + i * 10),
			cashFlow: i % 2 === 0 ? 100 + i * 20 : -(60 + i * 10),
			cashBalance: 1200 - i * 30,
			funding: 0,
			fee: i % 3 === 0 ? 0 : 1 + i * 0.3,
		})
	}

	for (let i = 1; i <= daysInMonth; i += 2) {
		const date = new Date(currentYear, currentMonth - 1, i, 8 + (i % 8), 15, 0)

		monthTransactions.push({
			transactionTime: formatISO(date),
			date: formatDate(date),
			time: formatTime(date),
			symbol: [
				'MKRUSDT',
				'YFIUSDT',
				'SNXUSDT',
				'BALUSDT',
				'CRVUSDT',
				'RENUSDT',
			][i % 6],
			currency: 'USDT',
			category: '',
			side: i % 2 === 0 ? 'Sell' : 'Buy',
			type: 'TRADE',
			change: i % 2 === 0 ? 80 + i * 15 : -(50 + i * 8),
			cashFlow: i % 2 === 0 ? 80 + i * 15 : -(50 + i * 8),
			cashBalance: 1100 - i * 25,
			funding: 0,
			fee: 0.8 + i * 0.2,
		})
	}

	const currentQuarter = Math.ceil(currentMonth / 3)
	const quarterStartMonth = (currentQuarter - 1) * 3 + 1
	const quarterTransactions = []
	const quarterEndMonth = quarterStartMonth + 2

	for (let month = quarterStartMonth; month <= quarterEndMonth; month++) {
		const daysInMonth = new Date(currentYear, month, 0).getDate()
		const targetDay = Math.min(daysInMonth, 28)

		const date = new Date(currentYear, month - 1, targetDay, 15, 0, 0)

		quarterTransactions.push({
			transactionTime: formatISO(date),
			date: formatDate(date),
			time: formatTime(date),
			symbol: [
				'MKRUSDT',
				'YFIUSDT',
				'SNXUSDT',
				'BALUSDT',
				'CRVUSDT',
				'RENUSDT',
			][month % 6],
			currency: 'USDT',
			category: '',
			side: month % 3 === 0 ? 'None' : month % 2 === 0 ? 'Sell' : 'Buy',
			type: month % 3 === 0 ? 'TRANSFER_OUT' : 'TRADE',
			change: month % 2 === 0 ? 200 + month * 30 : -(120 + month * 20),
			cashFlow: month % 2 === 0 ? 200 + month * 30 : -(120 + month * 20),
			cashBalance: 1000 - month * 40,
			funding: 0,
			fee: month % 3 === 0 ? 0 : 2 + month * 0.5,
		})
	}

	if (quarterTransactions.length === 0) {
		const date = new Date(
			currentYear,
			currentMonth - 1,
			Math.min(currentDate, 15),
			15,
			0,
			0
		)
		quarterTransactions.push({
			transactionTime: formatISO(date),
			date: formatDate(date),
			time: formatTime(date),
			symbol: 'MKRUSDT',
			currency: 'USDT',
			category: '',
			side: 'Sell',
			type: 'TRADE',
			change: 200,
			cashFlow: 200,
			cashBalance: 1000,
			funding: 0,
			fee: 2,
		})
	}

	const yearTransactions = []
	for (let month = 1; month <= currentMonth; month++) {
		const daysInMonth = new Date(currentYear, month, 0).getDate()
		const targetDay = month === currentMonth ? Math.min(currentDate, 15) : 15

		const date = new Date(currentYear, month - 1, targetDay, 10, 0, 0)

		yearTransactions.push({
			transactionTime: formatISO(date),
			date: formatDate(date),
			time: formatTime(date),
			symbol: [
				'ZRXUSDT',
				'BANDUSDT',
				'KNCUSDT',
				'STORJUSDT',
				'SUSHIUSDT',
				'COMPUSDT',
				'FILUSDT',
				'AAVEUSDT',
				'ICPUSDT',
				'MATICUSDT',
				'LINKUSDT',
				'VETUSDT',
			][month - 1],
			currency: 'USDT',
			category: '',
			side: month % 3 === 0 ? 'None' : month % 2 === 0 ? 'Sell' : 'Buy',
			type:
				month % 4 === 0
					? 'TRANSFER_IN'
					: month % 3 === 0
					? 'INTEREST'
					: 'TRADE',
			change: month % 2 === 0 ? 300 + month * 50 : -(180 + month * 30),
			cashFlow: month % 2 === 0 ? 300 + month * 50 : -(180 + month * 30),
			cashBalance: 2000 - month * 100,
			funding: 0,
			fee: month % 4 === 0 ? 0 : 3 + month * 0.8,
		})
	}

	if (yearTransactions.length === 0) {
		const date = new Date(
			currentYear,
			currentMonth - 1,
			Math.min(currentDate, 1),
			10,
			0,
			0
		)
		yearTransactions.push({
			transactionTime: formatISO(date),
			date: formatDate(date),
			time: formatTime(date),
			symbol: 'ZRXUSDT',
			currency: 'USDT',
			category: '',
			side: 'Sell',
			type: 'TRADE',
			change: 350,
			cashFlow: 350,
			cashBalance: 2000,
			funding: 0,
			fee: 3,
		})
	}

	for (let month = 1; month <= 12; month++) {
		const daysInMonth = new Date(currentYear, month, 0).getDate()
		const targetDay = 25

		const date = new Date(currentYear, month - 1, targetDay, 14, 0, 0)

		yearTransactions.push({
			transactionTime: formatISO(date),
			date: formatDate(date),
			time: formatTime(date),
			symbol: [
				'BANDUSDT',
				'KNCUSDT',
				'STORJUSDT',
				'SUSHIUSDT',
				'COMPUSDT',
				'FILUSDT',
				'AAVEUSDT',
				'ICPUSDT',
				'MATICUSDT',
				'LINKUSDT',
				'VETUSDT',
				'ZRXUSDT',
			][month % 12],
			currency: 'USDT',
			category: '',
			side: month % 2 === 0 ? 'Sell' : 'Buy',
			type: 'TRADE',
			change: month % 2 === 0 ? 250 + month * 40 : -(150 + month * 25),
			cashFlow: month % 2 === 0 ? 250 + month * 40 : -(150 + month * 25),
			cashBalance: 1800 - month * 80,
			funding: 0,
			fee: 2.5 + month * 0.6,
		})
	}

	const allTransactions = [
		...weekTransactions,
		...monthTransactions,
		...quarterTransactions,
		...yearTransactions,
	]

	const uniqueTransactions = allTransactions
		.filter((transaction, index, array) => {
			return (
				array.findIndex(
					t => t.date === transaction.date && t.time === transaction.time
				) === index
			)
		})
		.sort((a, b) => new Date(a.transactionTime) - new Date(b.transactionTime))

	let runningBalance = 1500
	uniqueTransactions.forEach(transaction => {
		runningBalance += transaction.change
		transaction.cashBalance = runningBalance
	})

	return uniqueTransactions.sort(
		(a, b) => new Date(b.transactionTime) - new Date(a.transactionTime)
	)
})()
