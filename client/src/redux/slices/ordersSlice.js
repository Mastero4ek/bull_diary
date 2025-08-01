import { fakePnlOrders } from '@/helpers/constants'
import { resError } from '@/helpers/functions'
import OrdersService from '@/services/OrdersService'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const getBybitOrdersPnl = createAsyncThunk(
	'get-order-pnl',
	async (
		{ exchange, sort, search, page, limit, start_time, end_time },
		{ rejectWithValue }
	) => {
		try {
			const response = await OrdersService.getBybitOrdersPnl(
				exchange,
				sort,
				search,
				page,
				limit,
				start_time,
				end_time
			)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

const initialState = {
	order: null,
	fakeOrders: null,
	orders: [],
	page: 1,
	sort: { type: 'closed_time', value: 'desc' },
	totalProfit: 0,
	totalLoss: 0,
	totalPages: 0,
	serverStatus: '',
	errorMessage: null,
}

const ordersSlice = createSlice({
	name: 'orders',
	initialState,
	reducers: {
		setOrder(state, action) {
			state.order = action.payload
		},
		setOrders(state, action) {
			state.orders = action.payload
		},
		setPage(state, action) {
			state.page = action.payload
		},
		setSort(state, action) {
			state.sort = action.payload
		},
		setTotalPages(state, action) {
			state.totalPages = action.payload
		},
		clearOrders(state) {
			state.order = null
			state.orders = []
			state.sort = { type: 'closed_time', value: 'desc' }
			state.totalProfit = 0
			state.totalLoss = 0
			state.totalPages = 0
			state.serverStatus = ''
			state.errorMessage = null
		},
	},
	extraReducers: builder => {
		builder
			//get-orders-pnl
			.addCase(getBybitOrdersPnl.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(getBybitOrdersPnl.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.errorMessage = action.payload.message || null
				state.fakeOrders =
					action.payload.orders.length === 0 ? fakePnlOrders : null

				if (!action.payload.message) {
					state.totalLoss = action.payload.total_loss
					state.totalProfit = action.payload.total_profit
					state.orders = action.payload.orders
					state.totalPages = action.payload.total_pages
				}
			})
			.addCase(getBybitOrdersPnl.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.fakeOrders = fakePnlOrders
				state.serverStatus = 'error'
				state.orders = []
				state.totalPages = 0
				state.totalProfit = 0
				state.totalLoss = 0
			})
	},
})

export const {
	setOrders,
	setOrder,
	setPage,
	setSort,
	setTotalPages,
	clearOrders,
} = ordersSlice.actions

export default ordersSlice.reducer
