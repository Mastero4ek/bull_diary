import {
  fakeWallet,
  fakeWalletChangesByDay,
  fakeWalletTransactions,
} from '@/helpers/constants';
import { resError } from '@/helpers/functions';
import WalletService from '@/services/WalletService';
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

export const getBybitWalletAndChanges = createAsyncThunk(
	'wallet/get-wallet-and-changes',
	async ({ exchange, start_time, end_time }, { rejectWithValue }) => {
		try {
			const [walletRes, changesRes] = await Promise.all([
				WalletService.getBybitWallet(exchange, start_time, end_time),
				// Сервер теперь всегда возвращает данные за 180 дней
				WalletService.getBybitWalletChangesByDay(exchange),
			])

			const result = {
				wallet: walletRes?.data,
				walletChangesByDay: changesRes?.data?.items || [],
				message: walletRes?.data?.message || changesRes?.data?.message || null,
			}

			return result
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const getBybitTransactions = createAsyncThunk(
	'wallet/get-transactions',
	async (
		{ exchange, start_time, end_time, sort, search, page, limit },
		{ rejectWithValue }
	) => {
		try {
			const response = await WalletService.getBybitTransactions(
				exchange,
				start_time,
				end_time,
				sort,
				search,
				page,
				limit
			)

			return {
				transactions: response?.data?.transactions || [],
				total_pages: response?.data?.total_pages || 0,
				total: response?.data?.total || 0,
				message: response?.data?.message || null,
			}
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

const initialState = {
	wallet: {
		total_balance: 0,
		unrealised_pnl: 0,
		total_profit: 0,
		total_loss: 0,
		wining_trades: 0,
		losing_trades: 0,
		net_profit: 0,
		winrate: 0,
	},
	fakeWallet: null,
	serverStatus: '',
	errorMessage: null,
	walletChangesByDay: [],
	transactions: [],
	fakeTransactions: [],
	transactionsTotalPages: 0,
	transactionsTotal: 0,
	transactionsStatus: '',
	transactionsErrorMessage: null,
	page: 1,
	sort: { type: 'transactionTime', value: 'desc' },
}

const walletSlice = createSlice({
	name: 'wallet',
	initialState,
	reducers: {
		setPage(state, action) {
			state.page = action.payload
		},
		setSort(state, action) {
			state.sort = action.payload
		},

		setServerStatus(state, action) {
			state.serverStatus = action.payload
		},
		setErrorMessage(state, action) {
			state.errorMessage = action.payload
		},
		clearWallet() {
			return initialState
		},
		clearTransactions(state) {
			state.transactions = []
			state.transactionsTotalPages = 0
			state.transactionsTotal = 0
			state.transactionsStatus = ''
		},
	},
	extraReducers: builder => {
		builder
			//get-wallet-and-changes
			.addCase(getBybitWalletAndChanges.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(getBybitWalletAndChanges.fulfilled, (state, action) => {
				const { wallet, walletChangesByDay, message } = action.payload

				state.wallet.total_balance = wallet.total_balance
				state.wallet.unrealised_pnl = wallet.unrealised_pnl
				state.wallet.total_profit = wallet.total_profit
				state.wallet.total_loss = wallet.total_loss
				state.wallet.wining_trades = wallet.wining_trades
				state.wallet.losing_trades = wallet.losing_trades
				// total_loss уже отрицательное значение, поэтому просто складываем
				state.wallet.net_profit = +parseFloat(
					wallet.total_profit + wallet.total_loss
				).toFixed(2)
				state.wallet.winrate =
					(state.wallet.wining_trades /
						(state.wallet.wining_trades + state.wallet.losing_trades)) *
						100 || 0
				state.walletChangesByDay = walletChangesByDay
				state.serverStatus = 'success'
				state.errorMessage = message
				state.fakeWallet = null
			})
			.addCase(getBybitWalletAndChanges.rejected, (state, action) => {
				state.fakeWallet = fakeWallet
				state.fakeWalletChangesByDay = fakeWalletChangesByDay
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'error'
			})
			//get-transactions
			.addCase(getBybitTransactions.pending, state => {
				state.transactionsStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(getBybitTransactions.fulfilled, (state, action) => {
				const { transactions, total_pages, total, message } = action.payload

				state.transactions = transactions
				state.fakeTransactions =
					transactions.length === 0 ? fakeWalletTransactions : null
				state.transactionsTotalPages = total_pages
				state.transactionsTotal = total
				state.transactionsStatus = 'success'
				state.errorMessage = message
			})
			.addCase(getBybitTransactions.rejected, (state, action) => {
				state.transactions = []
				state.transactionsTotalPages = 0
				state.transactionsTotal = 0
				state.errorMessage = action?.payload?.message
				state.transactionsStatus = 'error'
			})
	},
})

export const {
	setErrorMessage,
	setServerStatus,
	clearWallet,
	setPage,
	setSort,
	clearTransactions,
} = walletSlice.actions

export default walletSlice.reducer
