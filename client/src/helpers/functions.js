export const capitalize = str => {
	if (!str) return ''

	return str.charAt(0).toUpperCase() + str.slice(1)
}

export const resError = error => {
	const currentErrors =
		error?.response?.data?.errors?.map(item => {
			return { field: item?.path, value: item?.value }
		}) || []

	return {
		message:
			error?.response?.data?.message ||
			'An unknown error occurred, possibly due to too many requests from this IP. Please try again after 15 minutes.',
		errors: currentErrors.length > 0 ? currentErrors : null,
	}
}
