import axios from 'axios'

import { getLanguage } from '@/helpers/languageHelper'

const API_URL = import.meta.env.VITE_API_URL

// Initialize axios instance
const $api = axios.create({
	withCredentials: true,
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Flag to track if we're currently refreshing
let isRefreshing = false
// Store pending requests
let failedQueue = []

const processQueue = (error = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error)
		} else {
			prom.resolve()
		}
	})

	failedQueue = []
}

// Function to handle token refresh
const refreshTokens = async () => {
	try {
		const response = await $api.get('/refresh')

		return response.data
	} catch (error) {
		throw error
	}
}

// Flag to prevent recursion when getting CSRF token
let isGettingCSRFToken = false

// Function to get CSRF token
const getCSRFToken = async () => {
	// Protection from recursion
	if (isGettingCSRFToken) {
		return null
	}

	try {
		isGettingCSRFToken = true

		const response = await $api.get('/v1/csrf-token')

		return response.data.csrfToken
	} catch (error) {
		return null
	} finally {
		isGettingCSRFToken = false
	}
}

// Initialize CSRF token when the application is loaded
let csrfToken = null

const initializeCSRF = async () => {
	csrfToken = await getCSRFToken()
}

initializeCSRF()

// Add request interceptor
$api.interceptors.request.use(
	async config => {
		const language = getLanguage()
		config.headers['Accept-Language'] = language

		// If CSRF token is not received, try to get it (except for the token request)
		if (!csrfToken && !config.url?.includes('/csrf-token')) {
			csrfToken = await getCSRFToken()
		}

		// Add CSRF token for POST/PUT/DELETE/PATCH requests (except logout)
		if (
			['post', 'put', 'delete', 'patch'].includes(
				config.method?.toLowerCase()
			) &&
			!config.url?.includes('/logout')
		) {
			if (csrfToken) {
				config.headers['X-CSRF-Token'] = csrfToken
				config.headers['x-xsrf-token'] = csrfToken
			} else {
				console.warn('No CSRF token available for request:', config.url)
			}
		}

		// The server will automatically get the tokens from HTTP-only cookies
		return config
	},
	error => {
		return Promise.reject(error)
	}
)

// Add response interceptor to handle refresh token
$api.interceptors.response.use(
	response => {
		return response
	},
	async error => {
		const originalRequest = error.config
		if (!originalRequest) return Promise.reject(error)

		// Don't retry if we're already on the refresh endpoint or if this is a retry
		if (originalRequest.url === '/refresh' || originalRequest._isRetry) {
			return Promise.reject(error)
		}

		if (error.response?.status === 401) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				})
					.then(() => $api(originalRequest))
					.catch(err => Promise.reject(err))
			}

			originalRequest._isRetry = true
			isRefreshing = true

			try {
				await refreshTokens()
				isRefreshing = false
				processQueue()
				return $api(originalRequest)
			} catch (e) {
				isRefreshing = false
				processQueue(e)
				window.location.href = '/'
				return Promise.reject(e)
			}
		}

		// If we get a CSRF error, try to update the token
		if (
			error.response?.status === 403 &&
			error.response?.data?.message === 'CSRF token validation failed'
		) {
			csrfToken = await getCSRFToken()

			if (csrfToken) {
				// Repeat the original request with a new token
				const originalRequest = error.config

				originalRequest.headers['X-CSRF-Token'] = csrfToken
				originalRequest.headers['x-xsrf-token'] = csrfToken

				return $api(originalRequest)
			}
		}

		return Promise.reject(error)
	}
)

export default $api
