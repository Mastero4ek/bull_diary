import { configureStore } from '@reduxjs/toolkit';

import candidate from './slices/candidateSlice';
import filters from './slices/filtersSlice';
import intro from './slices/introSlice';
import orders from './slices/ordersSlice';
import positions from './slices/positionsSlice';
import settings from './slices/settingsSlice';
import sync from './slices/syncSlice';
import tournaments from './slices/tournamentSlice';
import transactions from './slices/transactionSlice';
import users from './slices/usersSlice';
import wallet from './slices/walletSlice';
import websocket from './slices/websocketSlice';

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
    positions,
    sync,
    intro,
  },
});
