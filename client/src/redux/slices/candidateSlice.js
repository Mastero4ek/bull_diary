import { resError } from '@/helpers/functions'
import AuthService from '@/services/AuthService'
import KeysService from '@/services/KeysService'
import UserService from '@/services/UserService'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const userDefault = {
	name: '',
	last_name: '',
	email: '',
	cover: '',
	phone: null,
	is_activated: false,
	change_password: false,
	level: { name: 'hamster', value: 0 },
	tournaments: [],
	source: 'self',
	keys: [
		{ id: 0, name: 'Bybit', api: '', secret: '' },
		{ id: 1, name: 'Mexc', api: '', secret: '' },
		{ id: 2, name: 'Okx', api: '', secret: '' },
	],
}

const updateUser = (state, action) => {
	if (action?.payload) {
		const {
			name,
			last_name,
			email,
			cover,
			source,
			is_activated,
			phone,
			change_password,
			updated_at,
			keys,
			level,
			tournaments,
		} = action?.payload

		state.user = {
			...state.user,
			name,
			last_name,
			email,
			source,
			cover,
			is_activated,
			phone,
			change_password,
			keys,
			level,
			updated_at,
			tournaments,
		}
	}
}

const handleTokens = response => {
	if (!response?.data) {
		console.error('No data in response:', response)
		return null
	}

	const userData = response.data.user || response.data

	const tokens = {
		access_token:
			response.data.tokens?.access_token || response.data.access_token,
		refresh_token:
			response.data.tokens?.refresh_token || response.data.refresh_token,
	}

	if (!userData) {
		console.error('Invalid response format: missing user data')
		return null
	}

	return {
		user: userData,
		tokens: tokens,
	}
}

const handleUserError = (state, action) => {
	state.errorMessage = action?.payload?.message
	state.serverStatus = 'error'
	state.errorArray = action?.payload?.errors || null
}

const handleUserLoading = (state, action) => {
	state.serverStatus = 'loading'
	state.errorMessage = null
	state.errorArray = null
}

export const checkAuth = createAsyncThunk(
	'user/check-auth',
	async (_, { rejectWithValue }) => {
		try {
			const { default: $api } = await import('@/http')
			const response = await $api.get('/v1/refresh')
			const processedData = handleTokens(response)

			if (!processedData?.user) {
				throw new Error('No user data in response')
			}

			return processedData
		} catch (e) {
			if (e?.response?.status === 401 || e?.message === 'UNAUTHORIZED') {
				return null
			}

			return rejectWithValue(resError(e))
		}
	}
)

export const signUp = createAsyncThunk(
	'user/sign-up',
	async (
		{ name, email, password, confirm_password, agreement },
		{ rejectWithValue }
	) => {
		try {
			const response = await AuthService.signUp(
				name,
				email,
				password,
				confirm_password,
				agreement
			)

			const result = handleTokens(response)
			if (!result) {
				throw new Error('Invalid response format: missing required data')
			}

			return result
		} catch (e) {
			if (process.env.NODE_ENV === 'dev') {
				console.log(e)
			}
			return rejectWithValue(resError(e))
		}
	}
)

export const signIn = createAsyncThunk(
	'user/sign-in',
	async ({ email, password, language }, { rejectWithValue }) => {
		try {
			const response = await AuthService.signIn(email, password, language)

			const result = handleTokens(response)
			if (!result) {
				throw new Error('Invalid response format: missing required data')
			}

			return result
		} catch (e) {
			if (process.env.NODE_ENV === 'dev') {
				console.log(e)
			}
			return rejectWithValue(resError(e))
		}
	}
)

export const logout = createAsyncThunk(
	'user/logout',
	async (_, { rejectWithValue }) => {
		try {
			await AuthService.logout()
			return null
		} catch (e) {
			if (process.env.NODE_ENV === 'dev') {
				console.error('Logout error:', e)
			}
			return null
		}
	}
)

export const editUser = createAsyncThunk(
	'user/edit-user',
	async (
		{ name, last_name, email, password, phone, cover, userId },
		{ rejectWithValue }
	) => {
		try {
			const response = await UserService.editUser(
				name,
				last_name,
				email,
				password,
				phone,
				cover,
				userId
			)

			return response?.data?.user
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const removeCover = createAsyncThunk(
	'user/remove-cover',
	async ({ filename, userId }, { rejectWithValue }) => {
		try {
			const response = await UserService.removeCover(filename, userId)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const removeUser = createAsyncThunk(
	'user/remove-user',
	async ({ current_email, fill_email }, { rejectWithValue }) => {
		try {
			const response = await UserService.removeUser(current_email, fill_email)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const updateKeys = createAsyncThunk(
	'user/api-keys',
	async ({ exchange, api, secret }, { rejectWithValue }) => {
		try {
			const response = await KeysService.updateKeys(exchange, api, secret)
			return response?.data?.keys || response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const getUser = createAsyncThunk(
	'candidate/getUser',
	async (id, { rejectWithValue }) => {
		try {
			const response = await UserService.getUser(id)

			return response?.data?.user
		} catch (e) {
			return rejectWithValue(e.response?.data || e.message)
		}
	}
)

export const createUser = createAsyncThunk(
	'candidate/createUser',
	async ({ data }, { rejectWithValue }) => {
		try {
			const response = await UserService.createUser(data)

			return response?.data?.user
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

const initialState = {
	user: userDefault,
	changeUser: userDefault,
	isAuth: false,
	serverStatus: 'idle',
	errorMessage: '',
	errorArray: null,
}

const candidateSlice = createSlice({
	name: 'candidate',
	initialState,
	reducers: {
		setPhone(state, action) {
			state.changeUser.phone = action.payload
		},
		setUser(state, action) {
			state.user = action.payload
		},
		setChangeUser(state, action) {
			state.changeUser = action.payload
		},
		setErrorMessage(state, action) {
			state.errorMessage = action.payload
		},
		setErrorArray(state, action) {
			state.errorArray = action.payload
		},
		setIsAuth(state, action) {
			state.isAuth = action.payload
		},
		setServerStatus(state, action) {
			state.serverStatus = action.payload
		},
		updateKeySyncStatus(state, action) {
			const { exchange, syncStatus } = action.payload
			if (state.user?.keys) {
				const keyIndex = state.user.keys.findIndex(key => key.name === exchange)
				if (keyIndex !== -1) {
					state.user.keys[keyIndex].sync = syncStatus
				}
			}
			if (state.changeUser?.keys) {
				const keyIndex = state.changeUser.keys.findIndex(
					key => key.name === exchange
				)
				if (keyIndex !== -1) {
					state.changeUser.keys[keyIndex].sync = syncStatus
				}
			}
		},

		clearUser() {
			return { ...initialState, user: userDefault, changeUser: userDefault }
		},
	},
	extraReducers: builder => {
		builder
			// Sign Up
			.addCase(signUp.pending, state => handleUserLoading(state))
			.addCase(signUp.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.isAuth = false

				if (action.payload?.user) {
					updateUser(state, { payload: action.payload.user })
				}

				if (action.payload?.tokens) {
					state.tokens = action.payload.tokens
				}

				state.errorMessage = ''
				state.errorArray = null
			})
			.addCase(signUp.rejected, handleUserError)

			// sign in
			.addCase(signIn.pending, state => handleUserLoading(state))
			.addCase(signIn.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.errorMessage = null
				state.errorArray = null

				if (action.payload?.user) {
					state.user = {
						...userDefault,
						...action.payload.user,
					}
					state.changeUser = { ...state.user }
					state.isAuth = action.payload.user.is_activated === true

					if (action.payload.tokens) {
						state.tokens = action.payload.tokens
					}
				}
			})
			.addCase(signIn.rejected, handleUserError)

			// check auth
			.addCase(checkAuth.pending, state => handleUserLoading(state))
			.addCase(checkAuth.fulfilled, (state, action) => {
				if (action.payload?.user) {
					state.isAuth = action.payload.user.is_activated === true
					state.errorMessage = null
					state.errorArray = null
					state.user = {
						...userDefault,
						...action.payload.user,
					}
					state.changeUser = { ...state.user }

					if (action.payload.tokens) {
						state.tokens = action.payload.tokens
					}
				} else {
					state.isAuth = false
					state.user = userDefault
					state.changeUser = userDefault
					state.tokens = null
				}

				state.serverStatus = 'success'
			})
			.addCase(checkAuth.rejected, handleUserError)

			// logout
			.addCase(logout.pending, state => handleUserLoading(state))
			.addCase(logout.fulfilled, state => {
				state.serverStatus = 'success'
				state.user = userDefault
				state.changeUser = userDefault
				state.isAuth = false
				state.errorMessage = null
				state.errorArray = null
				state.tokens = null
			})
			.addCase(logout.rejected, handleUserError)

			// edit user
			.addCase(editUser.pending, state => handleUserLoading(state))
			.addCase(editUser.fulfilled, (state, action) => {
				state.errorMessage = null
				state.errorArray = null
				state.serverStatus = 'success'
				updateUser(state, action)
				state.changeUser = state.user
			})
			.addCase(editUser.rejected, handleUserError)

			// remove cover
			.addCase(removeCover.pending, state => handleUserLoading(state))
			.addCase(removeCover.fulfilled, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'success'
				state.user.cover = null
				state.changeUser.cover = null
			})
			.addCase(removeCover.rejected, handleUserError)

			// remove user
			.addCase(removeUser.pending, state => handleUserLoading(state))
			.addCase(removeUser.fulfilled, (state, action) => {
				state.user = userDefault
				state.changeUser = userDefault
				state.errorMessage = null
				state.errorArray = null
				state.isAuth = false
				state.serverStatus = 'success'
			})
			.addCase(removeUser.rejected, handleUserError)

			// create keys
			.addCase(updateKeys.pending, state => handleUserLoading(state))
			.addCase(updateKeys.fulfilled, (state, action) => {
				const updatedKeys = action.payload.map(key => ({
					...key,
					sync: false,
				}))

				state.user = { ...state.user, keys: updatedKeys }
				state.changeUser = { ...state.changeUser, keys: updatedKeys }
				state.errorMessage = null
				state.errorArray = null
				state.serverStatus = 'success'
			})
			.addCase(updateKeys.rejected, handleUserError)

			// get user
			.addCase(getUser.pending, state => handleUserLoading(state))
			.addCase(getUser.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.user = {
					...userDefault,
					...action.payload,
				}
			})
			.addCase(getUser.rejected, handleUserError)

			// create user
			.addCase(createUser.pending, state => handleUserLoading(state))
			.addCase(createUser.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.errorMessage = null
				state.errorArray = null
			})
			.addCase(createUser.rejected, handleUserError)
	},
})

export const {
	setUser,
	setChangeUser,
	setErrorMessage,
	setErrorArray,
	setIsAuth,
	setServerStatus,
	setPhone,
	updateKeySyncStatus,
} = candidateSlice.actions

export default candidateSlice.reducer
