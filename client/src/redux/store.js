import { configureStore } from '@reduxjs/toolkit'

import candidate from './slices/candidateSlice'
import filters from './slices/filtersSlice'
import orders from './slices/ordersSlice'
import settings from './slices/settingsSlice'
import tournaments from './slices/tournamentSlice'
import transactions from './slices/transactionSlice'
import users from './slices/usersSlice'
import wallet from './slices/walletSlice'
import websocket from './slices/websocketSlice'

export const store = configureStore({
	reducer: {
		settings,
		candidate,
		filters,
		tournaments,
		orders,
		wallet,
		transactions,
		users,
		websocket,
	},
})
