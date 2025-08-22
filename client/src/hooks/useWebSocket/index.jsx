import { useCallback, useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import {
	clearError,
	setConnectionStatus,
	setConnectionStatusMessage,
	setError,
	setSubscriptionStatus,
	updatePositions,
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
	} = useSelector(state => state.websocket)
	const { exchange } = useSelector(state => state.filters)
	const user = useSelector(state => state.candidate?.user)

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
			dispatch(updatePositions(data.positions))
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

	useEffect(() => {
		WebSocketService.addListener('connection', handleConnection)
		WebSocketService.addListener('positions_update', handlePositionsUpdate)
		WebSocketService.addListener('connection_status', handleConnectionStatus)
		WebSocketService.addListener('error', handleError)

		return () => {
			WebSocketService.removeListener('connection', handleConnection)
			WebSocketService.removeListener('positions_update', handlePositionsUpdate)
			WebSocketService.removeListener(
				'connection_status',
				handleConnectionStatus
			)
			WebSocketService.removeListener('error', handleError)
		}
	}, [
		handleConnection,
		handlePositionsUpdate,
		handleConnectionStatus,
		handleError,
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
	}
}
