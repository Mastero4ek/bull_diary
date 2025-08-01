import Cookies from 'js-cookie'

import { createSlice } from '@reduxjs/toolkit'

const getTheme = () => {
	const theme = Cookies.get('dark_theme') === 'true' ? true : false
	if ([false, true].includes(theme)) return theme

	const userMedia = window.matchMedia('(prefers-color-scheme: light)')
	if (userMedia.matches) return false

	return false
}

const getSetting = cookie => {
	if (Cookies.get(cookie)) {
		return Cookies.get(cookie) === 'true' ? true : false
	} else {
		return true
	}
}

const initialState = {
	isMobile: window.innerWidth < 768,
	width: window.innerWidth,
	sideBar: {
		open: false,
		blocked_value: Cookies.get('sidebar') || 'unblock',
		blocked_name: Cookies.get('sidebar') || 'unblock',
	},
	theme: getTheme(),
	isLoadingTheme: false,
	mark: getSetting('mark'),
	amount: getSetting('amount'),
	color: getSetting('color'),
	language: Cookies.get('language') || 'en',
}

export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setSideBar(state, action) {
			state.sideBar = action.payload
		},
		setIsMobile(state, action) {
			state.isMobile = action.payload
		},
		setWidth(state, action) {
			state.width = action.payload
		},
		setTheme(state, action) {
			state.theme = action.payload
		},
		setIsLoadingTheme(state, action) {
			state.isLoadingTheme = action.payload
		},
		setMark(state, action) {
			state.mark = action.payload
		},
		setColor(state, action) {
			state.color = action.payload
		},
		setAmount(state, action) {
			state.amount = action.payload
		},
		setLanguage(state, action) {
			state.language = action.payload
		},
		setScreenParams(state, action) {
			state.isMobile = action.payload.isMobile
			state.width = action.payload.width
		},
	},
})

export const {
	setSideBar,
	setIsMobile,
	setWidth,
	setTheme,
	setLanguage,
	setMark,
	setAmount,
	setColor,
	setIsLoadingTheme,
	setScreenParams,
} = settingsSlice.actions

export default settingsSlice.reducer
