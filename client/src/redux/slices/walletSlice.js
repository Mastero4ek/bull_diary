import { fakeWallet } from '@/helpers/constants'
import { resError } from '@/helpers/functions'
import WalletService from '@/services/WalletService'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const getBybitWallet = createAsyncThunk(
	'wallet/get-wallet',
	async ({ exchange, start_time, end_time }, { rejectWithValue }) => {
		try {
			const walletRes = await WalletService.getBybitWallet(
				exchange,
				start_time,
				end_time
			)

			const result = {
				wallet: walletRes?.data,
				message: walletRes?.data?.message || null,
			}

			return result
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

const handleWalletError = (state, action) => {
	state.errorMessage = action?.payload?.message
	state.serverStatus = 'error'
}

const handleWalletLoading = state => {
	state.serverStatus = 'loading'
	state.errorMessage = null
}

const initialState = {
	fakeWallet: fakeWallet,
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
	serverStatus: '',
	errorMessage: null,
}

const walletSlice = createSlice({
	name: 'wallet',
	initialState,
	reducers: {
		setServerStatus(state, action) {
			state.serverStatus = action.payload
		},
		setErrorMessage(state, action) {
			state.errorMessage = action.payload
		},

		clearWallet() {
			return { ...initialState, fakeWallet: fakeWallet }
		},
	},
	extraReducers: builder => {
		builder
			.addCase(getBybitWallet.pending, state => handleWalletLoading(state))
			.addCase(getBybitWallet.fulfilled, (state, action) => {
				const { wallet, message } = action.payload

				state.wallet.total_balance = wallet.total_balance
				state.wallet.unrealised_pnl = wallet.unrealised_pnl
				state.wallet.total_profit = wallet.total_profit
				state.wallet.total_loss = wallet.total_loss
				state.wallet.wining_trades = wallet.wining_trades
				state.wallet.losing_trades = wallet.losing_trades
				state.wallet.net_profit = +parseFloat(
					wallet.total_profit + wallet.total_loss
				).toFixed(2)
				state.wallet.winrate =
					(state.wallet.wining_trades /
						(state.wallet.wining_trades + state.wallet.losing_trades)) *
						100 || 0
				state.serverStatus = 'success'
				state.errorMessage = message
			})
			.addCase(getBybitWallet.rejected, handleWalletError)
	},
})

export const { setErrorMessage, setServerStatus, clearWallet } =
	walletSlice.actions

export default walletSlice.reducer
