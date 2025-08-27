export const capitalize = str => {
	if (!str) return ''

	return str.charAt(0).toUpperCase() + str.slice(1)
}

export const colorizedNum = (text, positive) => {
	if (!text || text === 0) return 'disabled'

	if (positive === true) {
		return text < 0 ? 'red' : 'green'
	} else if (positive === false) {
		return text < 0 ? 'green' : 'red'
	}
}

export const calculateFakeTotals = array => {
	if (!array)
		return {
			totalProfit: { value: 0, count: 0 },
			totalLoss: { value: 0, count: 0 },
		}

	const profitOrders = array.filter(order => order.roi > 0)
	const lossOrders = array.filter(order => order.roi < 0)

	return {
		totalProfit: {
			value: profitOrders.reduce((sum, order) => sum + order.pnl, 0),
			count: profitOrders.length,
		},
		totalLoss: {
			value: lossOrders.reduce((sum, order) => sum + order.pnl, 0),
			count: lossOrders.length,
		},
	}
}

export const resError = error => {
	if (!error) return { message: 'An unknown error occurred' }

	const currentErrors =
		error?.response?.data?.errors?.map(item => {
			return { field: item?.path, value: item?.value }
		}) || []

	let message = 'An unknown error occurred'

	if (error?.response?.data?.message) {
		message = error.response.data.message
	} else if (error?.code === 'NETWORK_ERROR') {
		message = 'Network error. Please check your internet connection.'
	} else if (error?.code === 'ECONNABORTED') {
		message = 'Request timeout. Please try again.'
	} else if (error?.response?.status === 429) {
		message = 'Too many requests. Please try again later.'
	} else if (error?.response?.status === 401) {
		message = 'Authentication required. Please log in again.'
	} else if (error?.response?.status === 403) {
		message = 'Access denied. You do not have permission for this action.'
	} else if (error?.response?.status === 404) {
		message = 'Resource not found.'
	} else if (error?.response?.status >= 500) {
		message = 'Server error. Please try again later.'
	}

	return {
		message,
		errors: currentErrors.length > 0 ? currentErrors : null,
	}
}
