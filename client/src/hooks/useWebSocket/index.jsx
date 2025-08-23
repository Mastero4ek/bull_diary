import { useCallback, useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { updateKeySyncStatus } from '@/redux/slices/candidateSlice'
import {
	clearError,
	setConnectionStatus,
	setConnectionStatusMessage,
	setError,
	setPositions,
	setSubscriptionStatus,
	setSyncCancelled,
	setSyncCompleted,
	setSyncError,
	setSyncProgress,
	setSyncReset,
	setSyncStarted,
} from '@/redux/slices/websocketSlice'
import WebSocketService from '@/services/WebSocketService'

export const useWebSocket = () => {
	const dispatch = useDispatch()
	const {
		isConnected,
		isSubscribed,
		positions,
		error,
		lastUpdate,
		connectionStatus,
		isSyncing,
		syncProgress,
		syncStatus,
		syncMessage,
		lastSyncResult,
		syncError,
	} = useSelector(state => state.websocket)
	const { exchange } = useSelector(state => state.filters)
	const user = useSelector(state => state.candidate?.user)
	const { language } = useSelector(state => state.settings)

	const handleConnection = useCallback(
		data => {
			dispatch(setConnectionStatus(data.connected))
			if (data.connected) {
				dispatch(clearError())
			}
		},
		[dispatch]
	)

	const handlePositionsUpdate = useCallback(
		data => {
			dispatch(setPositions(data.positions))
			dispatch(clearError())
		},
		[dispatch]
	)

	const handleConnectionStatus = useCallback(
		data => {
			dispatch(setConnectionStatusMessage(data))
			dispatch(setConnectionStatus(data.connected))
		},
		[dispatch]
	)

	const handleError = useCallback(
		data => {
			dispatch(setError(data.message || 'WebSocket error'))
		},
		[dispatch]
	)

	const handleSyncProgress = useCallback(
		data => {
			dispatch(setSyncProgress(data))
		},
		[dispatch]
	)

	const handleSyncCompleted = useCallback(
		data => {
			dispatch(setSyncCompleted(data))
			if (exchange?.name) {
				dispatch(
					updateKeySyncStatus({ exchange: exchange.name, syncStatus: true })
				)
			}
		},
		[dispatch, exchange?.name]
	)

	const handleSyncError = useCallback(
		data => {
			dispatch(setSyncError(data))
			if (exchange?.name) {
				dispatch(
					updateKeySyncStatus({ exchange: exchange.name, syncStatus: false })
				)
			}
		},
		[dispatch, exchange?.name]
	)

	const handleSyncCancelled = useCallback(
		data => {
			dispatch(setSyncCancelled())
			dispatch(setConnectionStatus(false))
			dispatch(setSubscriptionStatus(false))
			if (exchange?.name) {
				dispatch(
					updateKeySyncStatus({ exchange: exchange.name, syncStatus: false })
				)
			}
		},
		[dispatch, exchange?.name]
	)

	useEffect(() => {
		WebSocketService.addListener('connection', handleConnection)
		WebSocketService.addListener('positions_update', handlePositionsUpdate)
		WebSocketService.addListener('connection_status', handleConnectionStatus)
		WebSocketService.addListener('error', handleError)
		WebSocketService.addListener('sync_progress', handleSyncProgress)
		WebSocketService.addListener('sync_completed', handleSyncCompleted)
		WebSocketService.addListener('sync_error', handleSyncError)
		WebSocketService.addListener('sync_cancelled', handleSyncCancelled)

		return () => {
			WebSocketService.removeListener('connection', handleConnection)
			WebSocketService.removeListener('positions_update', handlePositionsUpdate)
			WebSocketService.removeListener(
				'connection_status',
				handleConnectionStatus
			)
			WebSocketService.removeListener('error', handleError)
			WebSocketService.removeListener('sync_progress', handleSyncProgress)
			WebSocketService.removeListener('sync_completed', handleSyncCompleted)
			WebSocketService.removeListener('sync_error', handleSyncError)
			WebSocketService.removeListener('sync_cancelled', handleSyncCancelled)
		}
	}, [
		handleConnection,
		handlePositionsUpdate,
		handleConnectionStatus,
		handleError,
		handleSyncProgress,
		handleSyncCompleted,
		handleSyncError,
		handleSyncCancelled,
	])

	const connect = useCallback(() => {
		WebSocketService.connect()
	}, [])

	const disconnect = useCallback(() => {
		WebSocketService.disconnect()
		dispatch(setConnectionStatus(false))
		dispatch(setSubscriptionStatus(false))
	}, [dispatch])

	const subscribeToPositions = useCallback(() => {
		if (user?.id && exchange?.name) {
			WebSocketService.subscribeToPositions(user.id, exchange.name)
			dispatch(setSubscriptionStatus(true))
		}
	}, [user?.id, exchange?.name, dispatch])

	const unsubscribeFromPositions = useCallback(() => {
		if (user?.id) {
			WebSocketService.unsubscribeFromPositions(user.id)
			dispatch(setSubscriptionStatus(false))
		}
	}, [user?.id, dispatch])

	const getConnectionStatus = useCallback(() => {
		if (user?.id) {
			WebSocketService.getConnectionStatus(user.id)
		}
	}, [user?.id])

	const startDataSync = useCallback(
		(startDate, endDate) => {
			if (user?.id && exchange?.name) {
				dispatch(setSyncStarted())
				dispatch(
					updateKeySyncStatus({ exchange: exchange.name, syncStatus: false })
				)

				WebSocketService.startSync(
					user.id,
					exchange.name,
					startDate,
					endDate,
					language
				)
			}
		},
		[user?.id, exchange?.name, dispatch]
	)

	const getSyncProgress = useCallback(() => {
		if (user?.id) {
			WebSocketService.getSyncProgress(user.id)
		}
	}, [user?.id])

	const cancelSync = useCallback(() => {
		if (user?.id && exchange?.name) {
			WebSocketService.cancelSync(user.id, exchange.name)
		}
	}, [user?.id, exchange?.name])

	const resetSyncState = useCallback(() => {
		dispatch(setSyncReset())
	}, [dispatch])

	return {
		isConnected,
		isSubscribed,
		positions,
		error,
		lastUpdate,
		connectionStatus,
		connect,
		disconnect,
		subscribeToPositions,
		unsubscribeFromPositions,
		getConnectionStatus,
		isSyncing,
		syncProgress,
		syncStatus,
		syncMessage,
		lastSyncResult,
		syncError,
		startDataSync,
		getSyncProgress,
		cancelSync,
		resetSyncState,
	}
}
