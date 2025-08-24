import { fakeWalletTransactions } from '@/helpers/constants'
import { resError } from '@/helpers/functions'
import TransactionsService from '@/services/TransactionsService'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const getBybitTransactions = createAsyncThunk(
	'transactions/get-bybit-transactions',
	async (
		{ exchange, start_time, end_time, sort, search, page, limit, size },
		{ rejectWithValue }
	) => {
		try {
			const response = await TransactionsService.getBybitTransactions(
				exchange,
				start_time,
				end_time,
				sort,
				search,
				page,
				limit,
				size
			)

			const result = {
				transactions: response?.data?.transactions || [],
				total_pages: response?.data?.total_pages || 0,
				total: response?.data?.total || 0,
				message: response?.data?.message || null,
			}
			return result
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

const handleTransactionError = (state, action) => {
	state.errorMessage = action?.payload?.message
	state.serverStatus = 'error'
}

const handleTransactionLoading = (state, action) => {
	state.serverStatus = 'loading'
	state.errorMessage = null
}

const initialState = {
	fakeTransactions: fakeWalletTransactions,
	transactions: [],
	serverStatus: '',
	errorMessage: null,
	page: 1,
	sort: { type: 'transactionTime', value: 'desc' },
	totalPages: 0,
	total: 0,
}

const transactionSlice = createSlice({
	name: 'transactions',
	initialState,
	reducers: {
		setTransactions: (state, action) => {
			state.transactions = action.payload
		},
		setPage: (state, action) => {
			state.page = action.payload
		},
		setSort: (state, action) => {
			state.sort = action.payload
		},
		clearTransactions: state => {
			return {
				...initialState,
				fakeTransactions: fakeWalletTransactions,
			}
		},
	},
	extraReducers: builder => {
		builder
			.addCase(getBybitTransactions.pending, state =>
				handleTransactionLoading(state)
			)
			.addCase(getBybitTransactions.fulfilled, (state, action) => {
				const { transactions, total_pages, total, message } = action.payload

				state.transactions = transactions || []
				state.totalPages = total_pages || 0
				state.total = total || 0
				state.serverStatus = 'success'
				state.errorMessage = message
			})
			.addCase(getBybitTransactions.rejected, handleTransactionError)
	},
})

export const { setTransactions, setPage, setSort, clearTransactions } =
	transactionSlice.actions

export default transactionSlice.reducer
