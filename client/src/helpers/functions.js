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

export const resError = error => {
	const currentErrors =
		error?.response?.data?.errors?.map(item => {
			return { field: item?.path, value: item?.value }
		}) || []

	// Определяем тип ошибки
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
