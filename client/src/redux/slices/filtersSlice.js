import moment from 'moment';

import { resError } from '@/helpers/functions';
import OrdersService from '@/services/OrdersService';
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

export const getBybitTickers = createAsyncThunk(
	'get-tickers',
	async ({ exchange }, { rejectWithValue }) => {
		try {
			const response = await OrdersService.getBybitTickers(exchange)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

const initialState = {
	remove_btn: true,
	tickers: [],
	error: '',
	exchange: {
		checked_id: 0,
		name: 'bybit',
	},
	search: '',
	limit: 5,
	filter: {
		name: 'week',
		id: 0,
	},
	date: {
		start_date: moment().startOf('isoWeek').toISOString(),
		end_date: new Date().toISOString(),
	},
	serverStatus: '',
	errorMessage: null,
}

const filtersSlice = createSlice({
	name: 'filters',
	initialState,
	reducers: {
		setExchange(state, action) {
			state.exchange = action.payload
		},
		setRemoveBtn(state, action) {
			state.remove_btn = action.payload
		},
		setLimit(state, action) {
			state.limit = action.payload
		},
		setSearch(state, action) {
			state.search = action.payload
		},
		setFilter(state, action) {
			state.filter = action.payload
		},
		setDate(state, action) {
			state.date = action.payload
		},
	},
	extraReducers: builder => {
		builder
			//tickers
			.addCase(getBybitTickers.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(getBybitTickers.fulfilled, (state, action) => {
				state.errorMessage = action.payload.message || null
				state.serverStatus = 'success'
				state.tickers = action.payload
			})
			.addCase(getBybitTickers.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'error'
			})
	},
})

export const {
	setExchange,
	setRemoveBtn,
	setLimit,
	setFilter,
	setDate,
	setSearch,
} = filtersSlice.actions
export default filtersSlice.reducer
