import { configureStore } from '@reduxjs/toolkit';

import bookmarks from './slices/bookmarksOrdersSlice';
import candidate from './slices/candidateSlice';
import filters from './slices/filtersSlice';
import orders from './slices/ordersSlice';
import positions from './slices/positionsSlice';
import settings from './slices/settingsSlice';
import tournaments from './slices/tournamentSlice';
import users from './slices/usersSlice';
import wallet from './slices/walletSlice';

export const store = configureStore({
	reducer: {
		settings,
		candidate,
		filters,
		tournaments,
		orders,
		bookmarks,
		wallet,
		positions,
		users,
	},
})
