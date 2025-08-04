import { fakePnlOrders } from '@/helpers/constants';
import { resError } from '@/helpers/functions';
import OrdersService from '@/services/OrdersService';
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

export const getBybitSavedOrders = createAsyncThunk(
	'get-saved-orders',
	async (
		{ sort, search, page, limit, start_time, end_time, exchange, all = false },
		{ rejectWithValue }
	) => {
		try {
			const response = await OrdersService.getBybitSavedOrders(
				sort,
				search,
				page,
				limit,
				start_time,
				end_time,
				exchange,
				all
			)

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
	async ({ order, exchange, start_time, end_time }, { rejectWithValue }) => {
		try {
			const response = await OrdersService.removedOrder(
				order,
				exchange,
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
	bookmarks: [],
	page: 1,
	sort: { type: 'closed_time', value: 'desc' },
	totalProfit: 0,
	totalLoss: 0,
	totalPages: 0,
	serverStatus: '',
	saved: false,
	errorMessage: null,
}

const bookmarksOrdersSlice = createSlice({
	name: 'bookmarks-orders',
	initialState,
	reducers: {
		setOrder(state, action) {
			state.order = action.payload
		},
		setSaved(state, action) {
			state.saved = action.payload
		},
		setBookmarks(state, action) {
			state.bookmarks = action.payload
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
			state.bookmarks = []
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
			//get-saved-orders
			.addCase(getBybitSavedOrders.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(getBybitSavedOrders.fulfilled, (state, action) => {
				state.errorMessage = action.payload.message || null
				state.serverStatus = 'success'
				state.totalLoss = action.payload.total_loss
				state.totalProfit = action.payload.total_profit
				state.fakeOrders =
					action.payload.orders.length === 0 ? fakePnlOrders : null
				state.bookmarks = action.payload.orders
				state.totalPages = action.payload.total_pages
			})
			.addCase(getBybitSavedOrders.rejected, (state, action) => {
				state.fakeOrders = fakePnlOrders
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'error'
			})

			//order
			.addCase(savedOrder.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(savedOrder.fulfilled, (state, action) => {
				state.errorMessage = action.payload.message || null
				state.serverStatus = 'success'
				state.saved = false
				state.order = action.payload.order
			})
			.addCase(savedOrder.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.errorMessage = action?.payload?.message
				state.saved = action?.payload?.message.includes('saved') ? true : false
				state.serverStatus = 'error'
			})

			//order
			.addCase(removedOrder.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(removedOrder.fulfilled, (state, action) => {
				state.errorMessage = action.payload.message || null
				state.serverStatus = 'success'
				state.totalLoss = action.payload.total_loss
				state.totalProfit = action.payload.total_profit
				state.fakeOrders =
					action.payload.orders.length === 0 ? fakePnlOrders : null
				state.totalPages = action.payload.total_pages
			})
			.addCase(removedOrder.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'error'
			})
	},
})

export const {
	setOrder,
	setBookmarks,
	setPage,
	setSaved,
	setSort,
	setTotalPages,
	clearOrders,
} = bookmarksOrdersSlice.actions

export default bookmarksOrdersSlice.reducer
