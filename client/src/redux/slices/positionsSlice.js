import { fakeOrdersByDay, fakePositions } from '@/helpers/constants'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	data: [],
	lastUpdate: null,
	fakeData: fakePositions,
	ordersByDay: [],
	fakeOrdersByDay: fakeOrdersByDay,
	page: 1,
	sort: { type: 'unrealisedPnl', value: 'desc' },
	serverStatus: '',
	errorMessage: null,
}

const positionsSlice = createSlice({
	name: 'positions',
	initialState,
	reducers: {
		setPositions: (state, action) => {
			state.data = action.payload
			state.lastUpdate = new Date().toISOString()
			state.serverStatus = 'success'
			state.errorMessage = null
		},
		setFakePositions: (state, action) => {
			state.fakeData = action.payload || fakePositions
		},
		setOrdersByDay: (state, action) => {
			state.ordersByDay = action.payload
		},
		setFakeOrdersByDay: (state, action) => {
			state.fakeOrdersByDay = action.payload || fakeOrdersByDay
		},
		setPage: (state, action) => {
			state.page = action.payload
		},
		setSort: (state, action) => {
			state.sort = action.payload
		},
		setServerStatus: (state, action) => {
			state.serverStatus = action.payload
			if (action.payload === 'loading') {
				state.fakeData = fakePositions
				state.fakeOrdersByDay = fakeOrdersByDay
			}
		},
		setErrorMessage: (state, action) => {
			state.errorMessage = action.payload
		},
		clearErrorMessage: state => {
			state.errorMessage = null
		},
		setPositionsReset: state => {
			return {
				...initialState,
				fakeData: fakePositions,
				fakeOrdersByDay: fakeOrdersByDay,
			}
		},
	},
})

export const {
	setPositions,
	setFakePositions,
	setOrdersByDay,
	setFakeOrdersByDay,
	setPage,
	setSort,
	setServerStatus,
	setErrorMessage,
	clearErrorMessage,
	setPositionsReset,
} = positionsSlice.actions

export default positionsSlice.reducer
