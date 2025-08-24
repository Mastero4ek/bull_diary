import { fakeUsers } from '@/helpers/constants'
import { resError } from '@/helpers/functions'
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
	level: { name: 'hamster', value: 0 }, // level is earned for tournaments and challenges
	tournaments: [],
	source: 'self',
	keys: [
		{ id: 0, name: 'Bybit', api: '', secret: '' },
		{ id: 1, name: 'Mexc', api: '', secret: '' },
		{ id: 2, name: 'Okx', api: '', secret: '' },
	],
}

export const getUsers = createAsyncThunk(
	'get-users',
	async (
		{ sort, search, page, limit, start_time, end_time },
		{ rejectWithValue }
	) => {
		try {
			const response = await UserService.getUsers(
				sort,
				search,
				page,
				limit,
				start_time,
				end_time
			)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const removeUser = createAsyncThunk(
	'users/remove-user',
	async ({ current_email, fill_email, userId }, { rejectWithValue }) => {
		try {
			const response = await UserService.removeUser(
				current_email,
				fill_email,
				userId
			)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const getUser = createAsyncThunk(
	'users/getUser',
	async (id, { rejectWithValue }) => {
		try {
			const response = await UserService.getUser(id)

			return response?.data?.user
		} catch (e) {
			return rejectWithValue(e.response?.data || e.message)
		}
	}
)

export const editUser = createAsyncThunk(
	'users/edit-user',
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
	'users/remove-cover',
	async ({ filename, userId }, { rejectWithValue }) => {
		try {
			const response = await UserService.removeCover(filename, userId)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const activeUser = createAsyncThunk(
	'users/active-user',
	async (user, { rejectWithValue }) => {
		try {
			const response = await UserService.activeUser(user._id)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

export const inactiveUser = createAsyncThunk(
	'users/inactive-user',
	async (user, { rejectWithValue }) => {
		try {
			const response = await UserService.inactiveUser(user._id)

			return response?.data
		} catch (e) {
			return rejectWithValue(resError(e))
		}
	}
)

const handleUsersError = (state, action) => {
	state.errorMessage = action?.payload?.message
	state.serverStatus = 'error'
	state.errorArray = action?.payload?.errors || null
}

const initialState = {
	user: userDefault,
	changeUser: userDefault,
	fakeUsers: fakeUsers,
	users: [],
	page: 1,
	sort: { type: 'created_at', value: 'desc' },
	totalPages: 0,
	serverStatus: '',
	errorMessage: null,
	errorArray: null,
}

const usersSlice = createSlice({
	name: 'users',
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
		setServerStatus(state, action) {
			state.serverStatus = action.payload
		},
		setErrorArray(state, action) {
			state.errorArray = action.payload
		},
		setUsers(state, action) {
			state.users = action.payload
		},
		setFakeUsers(state, action) {
			state.fakeUsers = action.payload
		},
		setPage(state, action) {
			state.page = action.payload
		},
		setSort(state, action) {
			state.sort = action.payload
		},
		setTotalPages(state, action) {
			state.totalPages = action.payload
		},

		clearUser() {
			return { ...initialState, fakeUsers: fakeUsers }
		},
		clearUsers(state) {
			return { ...initialState, fakeUsers: fakeUsers }
		},
	},
	extraReducers: builder => {
		builder
			//get-users
			.addCase(getUsers.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
				state.errorArray = null
			})
			.addCase(getUsers.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.errorMessage = action.payload.message || null
				state.errorArray = null

				if (!action.payload.message) {
					state.users = action.payload.users
					state.totalPages = action.payload.total_pages
				}
			})
			.addCase(getUsers.rejected, handleUsersError)

			// remove user
			.addCase(removeUser.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
				state.errorArray = null
			})
			.addCase(removeUser.fulfilled, (state, action) => {
				state.errorMessage = null
				state.serverStatus = 'success'
				state.errorArray = null
			})
			.addCase(removeUser.rejected, handleUsersError)

			// get user
			.addCase(getUser.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
				state.errorArray = null
			})
			.addCase(getUser.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.user = {
					...userDefault,
					...action.payload,
				}
				state.changeUser = {
					...userDefault,
					...action.payload,
				}
				state.errorArray = null
			})
			.addCase(getUser.rejected, handleUsersError)

			// edit user
			.addCase(editUser.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
				state.errorArray = null
			})
			.addCase(editUser.fulfilled, (state, action) => {
				state.errorMessage = null
				state.serverStatus = 'success'
				state.user = {
					...userDefault,
					...action.payload,
				}
				state.changeUser = {
					...userDefault,
					...action.payload,
				}
				state.errorArray = null
			})
			.addCase(editUser.rejected, handleUsersError)

			// remove cover
			.addCase(removeCover.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
				state.errorArray = null
			})
			.addCase(removeCover.fulfilled, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'success'
				state.user.cover = null
				state.changeUser.cover = null
				state.errorArray = null
			})
			.addCase(removeCover.rejected, handleUsersError)

			// active user
			.addCase(activeUser.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
				state.errorArray = null
			})
			.addCase(activeUser.fulfilled, (state, action) => {
				state.errorMessage = null
				state.serverStatus = 'success'
				state.errorArray = null
			})
			.addCase(activeUser.rejected, handleUsersError)

			// inactive user
			.addCase(inactiveUser.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
				state.errorArray = null
			})
			.addCase(inactiveUser.fulfilled, (state, action) => {
				state.errorMessage = null
				state.serverStatus = 'success'
				state.errorArray = null
			})
			.addCase(inactiveUser.rejected, handleUsersError)
	},
})

export const {
	setUsers,
	setFakeUsers,
	setPage,
	setSort,
	setTotalPages,
	clearUsers,
	setPhone,
	setUser,
	setChangeUser,
	setErrorMessage,
	setServerStatus,
	clearUser,
} = usersSlice.actions

export default usersSlice.reducer
