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
	fakePositions: fakePositions,
	ordersByDay: [],
	page: 1,
	sort: { type: 'unrealisedPnl', value: 'desc' },
	serverStatus: '',
	errorMessage: null,
	isSyncing: false,
	syncProgress: 0,
	syncStatus: '',
	syncMessage: '',
	lastSyncResult: null,
	syncError: null,
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
		setPositions: (state, action) => {
			state.positions = action.payload
			state.lastUpdate = new Date().toISOString()
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
		setSyncStarted: state => {
			state.isSyncing = true
			state.syncProgress = 0
			state.syncStatus = 'loading'
			state.syncMessage = ''
			state.syncError = null
		},
		setSyncProgress: (state, action) => {
			state.syncProgress = action.payload.progress
			state.syncStatus = action.payload.status
			state.syncMessage = action.payload.message || ''
		},
		setSyncCompleted: (state, action) => {
			state.isSyncing = false
			state.syncProgress = 100
			state.syncStatus = 'success'
			state.syncMessage = ''
			state.lastSyncResult = action.payload
			state.syncError = null
		},
		setSyncError: (state, action) => {
			state.isSyncing = false
			state.syncStatus = 'error'
			state.syncMessage = action.payload.message || ''
			state.syncError = action.payload
		},
		setSyncCancelled: state => {
			state.isSyncing = false
			state.syncProgress = 0
			state.syncStatus = ''
			state.syncMessage = ''
			state.syncError = null
		},
		setSyncReset: state => {
			state.isSyncing = false
			state.syncProgress = 0
			state.syncStatus = ''
			state.syncMessage = ''
			state.syncError = null
			state.lastSyncResult = null
		},
		setWebSocketReset: state => {
			return { ...initialState, fakePositions: fakePositions }
		},
	},
})

export const {
	setConnectionStatus,
	setSubscriptionStatus,
	setPositions,
	setError,
	clearError,
	setConnectionStatusMessage,
	setPosition,
	setPage,
	setSort,
	setServerStatus,
	setSyncStarted,
	setSyncProgress,
	setSyncCompleted,
	setSyncError,
	setSyncCancelled,
	setSyncReset,
	setWebSocketReset,
} = websocketSlice.actions

export default websocketSlice.reducer
