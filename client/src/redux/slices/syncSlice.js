import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	isSyncing: false,
	progress: 0,
	status: '',
	message: '',
	result: null,
	error: null,
	warning: '',
	isSynced: false,
}

const syncSlice = createSlice({
	name: 'sync',
	initialState,
	reducers: {
		setSyncStarted: state => {
			state.isSyncing = true
			state.progress = 0
			state.status = 'loading'
			state.message = ''
			state.error = null
		},
		setSyncProgress: (state, action) => {
			state.progress = action.payload.progress
			state.status = action.payload.status
			state.message = action.payload.message || ''
		},
		setSyncCompleted: (state, action) => {
			state.isSyncing = false
			state.progress = 100
			state.status = 'success'
			state.message = ''
			state.result = action.payload
			state.error = null
		},
		setSyncError: (state, action) => {
			state.isSyncing = false
			state.status = 'error'
			state.message = action.payload.message || ''
			state.error = action.payload
		},
		setSyncCancelled: state => {
			state.isSyncing = false
			state.progress = 0
			state.status = ''
			state.message = ''
			state.error = null
			state.result = null
			state.isSynced = false
		},
		setSyncReset: state => {
			state.isSyncing = false
			state.progress = 0
			state.status = ''
			state.message = ''
			state.error = null
			state.result = null
		},
		setSyncWarning: (state, action) => {
			state.warning = action.payload
		},
		setIsSynced: (state, action) => {
			state.isSynced = action.payload
		},
		clearSyncWarning: state => {
			state.warning = ''
		},
	},
})

export const {
	setSyncStarted,
	setSyncProgress,
	setSyncCompleted,
	setSyncError,
	setSyncCancelled,
	setSyncReset,
	setSyncWarning,
	setIsSynced,
	clearSyncWarning,
} = syncSlice.actions

export default syncSlice.reducer
