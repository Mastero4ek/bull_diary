import { fakePositions } from '@/helpers/constants'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	isConnected: false,
	isSubscribed: false,
	positions: [],
	error: null,
	lastUpdate: null,
	connectionStatus: null,
	position: null,
	fakePositions: null,
	ordersByDay: [],
	page: 1,
	sort: { type: 'unrealisedPnl', value: 'desc' },
	serverStatus: '',
	errorMessage: null,
}

const websocketSlice = createSlice({
	name: 'websocket',
	initialState,
	reducers: {
		setConnectionStatus: (state, action) => {
			state.isConnected = action.payload
		},
		setSubscriptionStatus: (state, action) => {
			state.isSubscribed = action.payload
		},
		updatePositions: (state, action) => {
			state.positions = action.payload
			state.lastUpdate = new Date().toISOString()
			state.fakePositions =
				!action.payload || action.payload.length === 0 ? fakePositions : null
			state.serverStatus = 'success'
			state.errorMessage = null
			state.error = null
		},
		setError: (state, action) => {
			state.error = action.payload
			state.errorMessage = action.payload
			state.serverStatus = 'error'
			state.fakePositions = fakePositions
			state.positions = []
		},
		clearError: state => {
			state.error = null
			state.errorMessage = null
		},
		setConnectionStatusMessage: (state, action) => {
			state.connectionStatus = action.payload
		},
		setPosition: (state, action) => {
			state.position = action.payload
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
				state.fakePositions = fakePositions
			}
		},
		resetWebSocket: state => {
			state.isConnected = false
			state.isSubscribed = false
			state.positions = []
			state.error = null
			state.lastUpdate = null
			state.connectionStatus = null
			state.position = null
			state.fakePositions = null
			state.ordersByDay = []
			state.page = 1
			state.sort = { type: 'unrealisedPnl', value: 'desc' }
			state.serverStatus = ''
			state.errorMessage = null
		},
	},
})

export const {
	setConnectionStatus,
	setSubscriptionStatus,
	updatePositions,
	setError,
	clearError,
	setConnectionStatusMessage,
	setPosition,
	setPage,
	setSort,
	setServerStatus,
	resetWebSocket,
} = websocketSlice.actions

export default websocketSlice.reducer
