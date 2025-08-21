import { resError } from '@/helpers/functions';
import OrdersService from '@/services/OrdersService';
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

export const getSyncProgress = createAsyncThunk(
	'get-sync-progress',
	async (_, { rejectWithValue }) => {
		try {
			const response = await OrdersService.getSyncProgress()
			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const syncData = createAsyncThunk(
	'sync-data',
	async ({ exchange, start_time, end_time }, { rejectWithValue }) => {
		try {
			const response = await OrdersService.syncData(
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
	syncProgress: 0,
	syncStatus: '',
	syncMessage: '',
}

const syncSlice = createSlice({
	name: 'sync',
	initialState,
	reducers: {
		clearSyncProgress: state => {
			state.syncProgress = 0
			state.syncStatus = ''
			state.syncMessage = ''
		},
	},
	extraReducers: builder => {
		builder
			// get-sync-progress
			.addCase(getSyncProgress.pending, (state, action) => {
				// Keep existing progress while fetching new progress
			})
			.addCase(getSyncProgress.fulfilled, (state, action) => {
				if (action.payload) {
					state.syncProgress = action.payload.progress || 0
					state.syncStatus = action.payload.status || ''
					state.syncMessage = action.payload.message || ''
				}
			})
			.addCase(getSyncProgress.rejected, (state, action) => {
				// Keep existing progress on error, don't reset
			})

			// sync-data
			.addCase(syncData.pending, state => {
				state.syncStatus = 'loading'
				state.syncProgress = 0
				state.syncMessage = ''
			})
			.addCase(syncData.fulfilled, (state, action) => {
				state.syncStatus = 'success'
				state.syncProgress = 100
				state.syncMessage = ''
			})
			.addCase(syncData.rejected, (state, action) => {
				state.syncStatus = 'error'
				state.syncProgress = 0
				state.syncMessage = ''
			})
	},
})

export const { clearSyncProgress } = syncSlice.actions

export default syncSlice.reducer
