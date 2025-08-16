import { fakePositions } from '@/helpers/constants';
import { resError } from '@/helpers/functions';
import PositionsService from '@/services/PositionsService';
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

export const getBybitPositions = createAsyncThunk(
	'get-positions',
	async ({ exchange, sort, search, page, limit }, { rejectWithValue }) => {
		try {
			const response = await PositionsService.getBybitPositions(
				exchange,
				sort,
				search,
				page,
				limit
			)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

const initialState = {
	position: null,
	fakePositions: null,
	positions: [],
	ordersByDay: [],
	page: 1,
	sort: { type: 'closed_time', value: 'desc' },
	totalPages: 0,
	serverStatus: '',
	errorMessage: null,
}

const positionsSlice = createSlice({
	name: 'positions',
	initialState,
	reducers: {
		setPosition(state, action) {
			state.position = action.payload
		},
		setPositions(state, action) {
			state.positions = action.payload
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
		clearPositions(state) {
			state.position = null
			state.positions = []
			state.ordersByDay = []
			state.sort = { type: 'closed_time', value: 'desc' } // descending
			state.totalPages = 0
			state.serverStatus = ''
			state.errorMessage = null
		},
	},
	extraReducers: builder => {
		builder
			//get-positions
			.addCase(getBybitPositions.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(getBybitPositions.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.errorMessage = action.payload.message || null
				state.fakePositions =
					action.payload.positions.length === 0 ? fakePositions : null

				if (!action.payload.message) {
					state.positions = action.payload.positions
					state.ordersByDay = action.payload.ordersByDay
					state.totalPages = action.payload.total_pages
				}
			})
			.addCase(getBybitPositions.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.fakePositions = fakePositions
				state.serverStatus = 'error'
				state.positions = []
				state.ordersByDay = []
				state.totalPages = 0
			})
	},
})

export const {
	setPositions,
	setPosition,
	setPage,
	setSort,
	setTotalPages,
	clearPositions,
} = positionsSlice.actions

export default positionsSlice.reducer
