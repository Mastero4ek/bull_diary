import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	isConnected: false,
	isSubscribed: false,
	status: null,
	error: null,
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
		setConnectionStatusMessage: (state, action) => {
			state.status = action.payload
		},
		setConnectionError: (state, action) => {
			state.error = action.payload
		},
		clearConnectionError: state => {
			state.error = null
		},
		setWebSocketReset: state => {
			return {
				...initialState,
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
	setWebSocketReset,
} = websocketSlice.actions

export default websocketSlice.reducer
