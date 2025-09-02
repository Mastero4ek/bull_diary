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
	} else if (cookie === 'help') {
		return false
	} else {
		return true
	}
}

const initialState = {
	isTablet: window.innerWidth < 768,
	isMobile: window.innerWidth < 460,
	width: window.innerWidth,
	sideBar: {
		open: false,
		blocked_value: Cookies.get('sidebar') || 'unblock',
		blocked_name: Cookies.get('sidebar') || 'unblock',
	},
	theme: getTheme(),
	isLoadingTheme: false,
	isLoadingLanguage: false,
	mark: getSetting('mark'),
	amount: getSetting('amount'),
	color: getSetting('color'),
	help: getSetting('help'),
	language: Cookies.get('language') || 'en',
}

export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setSideBar(state, action) {
			state.sideBar = { ...state.sideBar, ...action.payload }
		},
		setIsTablet(state, action) {
			state.isTablet = action.payload
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
		setHelp(state, action) {
			state.help = action.payload
		},
		setLanguage(state, action) {
			state.language = action.payload
		},
		setIsLoadingLanguage(state, action) {
			state.isLoadingLanguage = action.payload
		},
		setScreenParams(state, action) {
			state.isMobile = action.payload.isMobile
			state.isTablet = action.payload.isTablet
			state.width = action.payload.width
		},
	},
})

export const {
	setSideBar,
	setIsTablet,
	setIsMobile,
	setWidth,
	setTheme,
	setLanguage,
	setMark,
	setAmount,
	setColor,
	setHelp,
	setIsLoadingTheme,
	setIsLoadingLanguage,
	setScreenParams,
} = settingsSlice.actions

export default settingsSlice.reducer
