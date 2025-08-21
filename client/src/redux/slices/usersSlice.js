import { fakeUsers } from '@/helpers/constants';
import { resError } from '@/helpers/functions';
import UserService from '@/services/UserService';
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

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

const initialState = {
	user: userDefault,
	changeUser: userDefault,
	users: [],
	fakeUsers: null,
	page: 1,
	sort: { type: 'created_at', value: 'desc' },
	totalPages: 0,
	serverStatus: '',
	errorMessage: null,
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
		clearUser() {
			return initialState
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
		clearUsers(state) {
			state.users = []
			state.fakeUsers = null
			state.sort = { type: 'created_at', value: 'desc' } // descending
			state.totalPages = 0
			state.serverStatus = ''
			state.errorMessage = null
		},
	},
	extraReducers: builder => {
		builder
			//get-users
			.addCase(getUsers.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(getUsers.fulfilled, (state, action) => {
				state.serverStatus = 'success'
				state.errorMessage = action.payload.message || null
				state.fakeUsers = action.payload.users.length === 0 ? fakeUsers : null

				if (!action.payload.message) {
					state.users = action.payload.users
					state.totalPages = action.payload.total_pages
				}
			})
			.addCase(getUsers.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.fakeUsers = fakeUsers
				state.serverStatus = 'error'
				state.users = []
				state.totalPages = 0
			})

			// remove user
			.addCase(removeUser.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(removeUser.fulfilled, (state, action) => {
				state.errorMessage = null
				state.serverStatus = 'success'
			})
			.addCase(removeUser.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'error'
			})

			// get user
			.addCase(getUser.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
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
			})
			.addCase(getUser.rejected, (state, action) => {
				state.serverStatus = 'error'
				state.errorMessage = action.payload?.message || 'Failed to fetch user'
			})

			// edit user
			.addCase(editUser.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
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
			})
			.addCase(editUser.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'error'
			})

			// remove cover
			.addCase(removeCover.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(removeCover.fulfilled, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'success'
				state.user.cover = null
				state.changeUser.cover = null
			})
			.addCase(removeCover.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'error'
			})

			// active user
			.addCase(activeUser.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(activeUser.fulfilled, (state, action) => {
				state.errorMessage = null
				state.serverStatus = 'success'
			})
			.addCase(activeUser.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'error'
			})

			// inactive user
			.addCase(inactiveUser.pending, state => {
				state.serverStatus = 'loading'
				state.errorMessage = null
			})
			.addCase(inactiveUser.fulfilled, (state, action) => {
				state.errorMessage = null
				state.serverStatus = 'success'
			})
			.addCase(inactiveUser.rejected, (state, action) => {
				state.errorMessage = action?.payload?.message
				state.serverStatus = 'error'
			})
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
