import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export const useNotification = () => {
	return useContext(NotificationContext)
}

export const NotificationProvider = React.memo(({ children }) => {
	const [notifications, setNotifications] = useState([])

	const showNotification = (message, type = 'info', duration = 5000) => {
		const id = Date.now() + Math.random()
		const newNotification = {
			id,
			message,
			type, // 'success', 'error', 'warning', 'info'
			duration,
		}

		setNotifications(prev => [...prev, newNotification])

		if (duration > 0) {
			setTimeout(() => {
				removeNotification(id)
			}, duration)
		}

		return id
	}

	const removeNotification = id => {
		setNotifications(prev =>
			prev.filter(notification => notification.id !== id)
		)
	}

	const clearAllNotifications = () => {
		setNotifications([])
	}

	const showSuccess = (message, duration) =>
		showNotification(message, 'success', duration)
	const showError = (message, duration) =>
		showNotification(message, 'error', duration)
	const showWarning = (message, duration) =>
		showNotification(message, 'warning', duration)
	const showInfo = (message, duration) =>
		showNotification(message, 'info', duration)

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				showNotification,
				removeNotification,
				clearAllNotifications,
				showSuccess,
				showError,
				showWarning,
				showInfo,
			}}
		>
			{children}
		</NotificationContext.Provider>
	)
})
