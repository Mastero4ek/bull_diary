import axios from 'axios'
import Cookies from 'js-cookie'

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

// Add request interceptor
$api.interceptors.request.use(
	async config => {
		let language = 'en'
		try {
			// Динамический импорт store для избежания циклических зависимостей
			const { store } = await import('@/redux/store')
			language =
				store.getState().settings.language || Cookies.get('language') || 'en'
		} catch (e) {
			language = Cookies.get('language') || 'en'
		}
		config.headers['Accept-Language'] = language
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

		return Promise.reject(error)
	}
)

export default $api
