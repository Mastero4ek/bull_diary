import moment from 'moment'

import { resError } from '@/helpers/functions'
import OrdersService from '@/services/OrdersService'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

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

const shouldActivateRemoveButton = state => {
	const defaultValues = {
		search: '',
		limit: 5,
		filter: { name: 'week', id: 0 },
		exchange: { checked_id: 0, name: 'bybit' },
	}

	if (state.search !== defaultValues.search) return true
	if (state.limit !== defaultValues.limit) return true
	if (
		state.filter.name !== defaultValues.filter.name ||
		state.filter.id !== defaultValues.filter.id
	)
		return true
	if (
		state.exchange.checked_id !== defaultValues.exchange.checked_id ||
		state.exchange.name !== defaultValues.exchange.name
	)
		return true

	const currentDate = new Date()
	const currentWeekStart = moment().startOf('isoWeek')
	const stateStartDate = moment(state.date.start_date)
	const stateEndDate = moment(state.date.end_date)

	if (!stateStartDate.isSame(currentWeekStart, 'day')) return true
	if (!stateEndDate.isSame(currentDate, 'day')) return true

	return false
}

const filtersSlice = createSlice({
	name: 'filters',
	initialState,
	reducers: {
		setExchange(state, action) {
			state.exchange = action.payload
			state.remove_btn = !shouldActivateRemoveButton(state)
		},
		setRemoveBtn(state, action) {
			state.remove_btn = action.payload
		},
		setLimit(state, action) {
			state.limit = action.payload
			state.remove_btn = !shouldActivateRemoveButton(state)
		},
		setSearch(state, action) {
			state.search = action.payload
			state.remove_btn = !shouldActivateRemoveButton(state)
		},
		setFilter(state, action) {
			state.filter = action.payload
			state.remove_btn = !shouldActivateRemoveButton(state)
		},
		setDate(state, action) {
			state.date = action.payload
			state.remove_btn = !shouldActivateRemoveButton(state)
		},
		clearTickers(state) {
			state.tickers = []
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
	clearTickers,
} = filtersSlice.actions
export default filtersSlice.reducer
