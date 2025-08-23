import { fakePositions } from '@/helpers/constants'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	connection: {
		isConnected: false,
		isSubscribed: false,
		status: null,
		error: null,
	},
	positions: {
		data: [],
		lastUpdate: null,
		fakeData: fakePositions,
		ordersByDay: [],
	},
	ui: {
		page: 1,
		sort: { type: 'unrealisedPnl', value: 'desc' },
		serverStatus: '',
		errorMessage: null,
	},
	sync: {
		isSyncing: false,
		progress: 0,
		status: '',
		message: '',
		result: null,
		error: null,
		warning: '',
		isSynced: false,
	},
}

const websocketSlice = createSlice({
	name: 'websocket',
	initialState,
	reducers: {
		setConnectionStatus: (state, action) => {
			state.connection.isConnected = action.payload
		},
		setSubscriptionStatus: (state, action) => {
			state.connection.isSubscribed = action.payload
		},
		setConnectionStatusMessage: (state, action) => {
			state.connection.status = action.payload
		},
		setConnectionError: (state, action) => {
			state.connection.error = action.payload
		},
		clearConnectionError: state => {
			state.connection.error = null
		},
		setPositions: (state, action) => {
			state.positions.data = action.payload
			state.positions.lastUpdate = new Date().toISOString()
			state.ui.serverStatus = 'success'
			state.ui.errorMessage = null
			state.connection.error = null
		},
		setFakePositions: (state, action) => {
			state.positions.fakeData = action.payload || fakePositions
		},
		setOrdersByDay: (state, action) => {
			state.positions.ordersByDay = action.payload
		},
		setPage: (state, action) => {
			state.ui.page = action.payload
		},
		setSort: (state, action) => {
			state.ui.sort = action.payload
		},
		setServerStatus: (state, action) => {
			state.ui.serverStatus = action.payload
			if (action.payload === 'loading') {
				state.positions.fakeData = fakePositions
			}
		},
		setErrorMessage: (state, action) => {
			state.ui.errorMessage = action.payload
		},
		clearErrorMessage: state => {
			state.ui.errorMessage = null
		},
		setSyncStarted: state => {
			state.sync.isSyncing = true
			state.sync.progress = 0
			state.sync.status = 'loading'
			state.sync.message = ''
			state.sync.error = null
		},
		setSyncProgress: (state, action) => {
			state.sync.progress = action.payload.progress
			state.sync.status = action.payload.status
			state.sync.message = action.payload.message || ''
		},
		setSyncCompleted: (state, action) => {
			state.sync.isSyncing = false
			state.sync.progress = 100
			state.sync.status = 'success'
			state.sync.message = ''
			state.sync.result = action.payload
			state.sync.error = null
		},
		setSyncError: (state, action) => {
			state.sync.isSyncing = false
			state.sync.status = 'error'
			state.sync.message = action.payload.message || ''
			state.sync.error = action.payload
		},
		setSyncCancelled: state => {
			state.sync.isSyncing = false
			state.sync.progress = 0
			state.sync.status = ''
			state.sync.message = ''
			state.sync.error = null
			state.sync.result = null
			state.sync.isSynced = false
		},
		setSyncReset: state => {
			state.sync.isSyncing = false
			state.sync.progress = 0
			state.sync.status = ''
			state.sync.message = ''
			state.sync.error = null
			state.sync.result = null
		},
		setSyncWarning: (state, action) => {
			state.sync.warning = action.payload
		},
		setIsSynced: (state, action) => {
			state.sync.isSynced = action.payload
		},
		clearSyncWarning: state => {
			state.sync.warning = ''
		},
		setWebSocketReset: state => {
			return {
				...initialState,
				positions: { ...initialState.positions, fakeData: fakePositions },
			}
		},
	},
})

export const {
	setConnectionStatus,
	setSubscriptionStatus,
	setConnectionStatusMessage,
	setConnectionError,
	clearConnectionError,
	setPositions,
	setFakePositions,
	setOrdersByDay,
	setPage,
	setSort,
	setServerStatus,
	setErrorMessage,
	clearErrorMessage,
	setSyncStarted,
	setSyncProgress,
	setSyncCompleted,
	setSyncError,
	setSyncCancelled,
	setSyncReset,
	setSyncWarning,
	setIsSynced,
	clearSyncWarning,
	setWebSocketReset,
} = websocketSlice.actions

export default websocketSlice.reducer

export const selectWebSocketConnection = state => state.websocket.connection
export const selectWebSocketPositions = state => state.websocket.positions
export const selectWebSocketUI = state => state.websocket.ui
export const selectWebSocketSync = state => state.websocket.sync
export const selectIsConnected = state => state.websocket.connection.isConnected
export const selectIsSubscribed = state =>
	state.websocket.connection.isSubscribed
export const selectPositions = state => state.websocket.positions.data
export const selectFakePositions = state => state.websocket.positions.fakeData
export const selectOrdersByDay = state => state.websocket.positions.ordersByDay
export const selectPage = state => state.websocket.ui.page
export const selectSort = state => state.websocket.ui.sort
export const selectServerStatus = state => state.websocket.ui.serverStatus
export const selectErrorMessage = state => state.websocket.ui.errorMessage
export const selectIsSyncing = state => state.websocket.sync.isSyncing
export const selectSyncProgress = state => state.websocket.sync.progress
export const selectSyncStatus = state => state.websocket.sync.status
export const selectSyncMessage = state => state.websocket.sync.message
export const selectSyncWarning = state => state.websocket.sync.warning
export const selectIsSynced = state => state.websocket.sync.isSynced
