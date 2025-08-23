import { fakePnlOrders } from '@/helpers/constants'
import { resError } from '@/helpers/functions'
import OrdersService from '@/services/OrdersService'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const getBybitOrdersPnl = createAsyncThunk(
	'get-order-pnl',
	async (
		{ exchange, sort, search, page, limit, start_time, end_time, bookmarks },
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
				end_time,
				bookmarks
			)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const getOrderDescription = createAsyncThunk(
	'get-order-description',
	async ({ id }, { rejectWithValue }) => {
		try {
			const response = await OrdersService.getOrderDescription(id)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const updateOrderDescription = createAsyncThunk(
	'update-order-description',
	async ({ id, text }, { rejectWithValue }) => {
		try {
			const response = await OrdersService.updateOrderDescription(id, text)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const savedOrder = createAsyncThunk(
	'saved-order',
	async ({ order, exchange }, { rejectWithValue }) => {
		try {
			const response = await OrdersService.savedOrder(order, exchange)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const removedOrder = createAsyncThunk(
	'removed-order',
	async ({ order, exchange }, { rejectWithValue }) => {
		try {
			const response = await OrdersService.removedOrder(order, exchange)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

const handleOrderError = (state, action) => {
	state.errorMessage = action?.payload?.message
	state.serverStatus = 'error'
	state.description = ''
	state.order = null
}

const handleOrdersError = (state, action) => {
	state.errorMessage = action?.payload?.message
	state.serverStatus = 'error'
}

const initialState = {
	fakeOrders: fakePnlOrders,
	orders: [],
	order: null,
	description: '',
	sort: { type: 'closed_time', value: 'desc' },
	page: 1,
	totalPages: 0,
	totalProfit: 0,
	totalLoss: 0,
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
		setDescription(state, action) {
			state.description = action.payload
		},
		clearDescription(state) {
			state.description = ''
		},

		clearOrders(state) {
			return { ...initialState, fakeOrders: fakePnlOrders }
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
				state.errorMessage = null

				if (!action.payload.message) {
					state.totalLoss = action.payload.total_loss
					state.totalProfit = action.payload.total_profit
					state.orders = action.payload.orders
					state.totalPages = action.payload.total_pages
				}
			})
			.addCase(getBybitOrdersPnl.rejected, handleOrdersError)

			//get-order-description
			.addCase(getOrderDescription.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(getOrderDescription.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.errorMessage = action.payload.message || null
				state.description = action.payload.description
			})
			.addCase(getOrderDescription.rejected, handleOrderError)

			//update-order-description
			.addCase(updateOrderDescription.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(updateOrderDescription.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.errorMessage = action.payload.message || null
				state.description = action.payload.description
			})
			.addCase(updateOrderDescription.rejected, handleOrderError)

			//saved-order
			.addCase(savedOrder.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(savedOrder.fulfilled, (state, action) => {
				state.errorMessage = action.payload.message || null
				state.serverStatus = 'success'
				state.order = action.payload.order
			})
			.addCase(savedOrder.rejected, handleOrderError)

			//removed-order
			.addCase(removedOrder.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(removedOrder.fulfilled, (state, action) => {
				state.errorMessage = action.payload.message || null
				state.serverStatus = 'success'
				state.order = action.payload.order
			})
			.addCase(removedOrder.rejected, handleOrderError)
	},
})

export const {
	setOrders,
	setOrder,
	setPage,
	setSort,
	setTotalPages,
	clearOrders,
	clearDescription,
	setDescription,
} = ordersSlice.actions

export default ordersSlice.reducer
