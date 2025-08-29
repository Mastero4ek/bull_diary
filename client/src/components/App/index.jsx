import { useCallback, useEffect, useMemo, useState } from 'react'

import Cookies from 'js-cookie'
import moment from 'moment/min/moment-with-locales'
import { useDispatch, useSelector } from 'react-redux'

import { BottomBar } from '@/components/layouts/BottomBar'
import { FooterLayout } from '@/components/layouts/FooterLayout'
import { HeaderLayout } from '@/components/layouts/HeaderLayout'
import { SideBarLayout } from '@/components/layouts/SideBarLayout'
import { LazyLoader } from '@/components/ui/general/LazyLoader'
import { Loader } from '@/components/ui/general/Loader'
import { RouteRenderer } from '@/components/ui/general/RouteRenderer'
import { useSyncStatus } from '@/hooks/useSyncStatus'
import { useWebSocket } from '@/hooks/useWebSocket'
import { checkAuth } from '@/redux/slices/candidateSlice'
import { setScreenParams } from '@/redux/slices/settingsSlice'
import { createRoutes } from '@/routes/routeConfig.js'
import { unwrapResult } from '@reduxjs/toolkit'

import styles from './styles.module.scss'

export const App = () => {
	const [isLoading, setIsLoading] = useState(true)

	const { isAuth, user, serverStatus } = useSelector(state => state.candidate)
	const { exchange } = useSelector(state => state.filters)
	const {
		language,
		theme,
		mark,
		amount,
		help,
		color,
		isLoadingTheme,
		isLoadingLanguage,
		isMobile,
	} = useSelector(state => state.settings)

	const dispatch = useDispatch()

	const {
		connect,
		disconnect,
		subscribeToPositions,
		unsubscribeFromPositions,
	} = useWebSocket()

	useSyncStatus()

	const handleResize = useCallback(() => {
		dispatch(
			setScreenParams({
				isMobile: window.innerWidth < 460,
				isTablet: window.innerWidth < 768,
				width: window.innerWidth,
			})
		)
	}, [dispatch])

	const handleLoading = useCallback(async () => {
		try {
			const resultAction = await dispatch(checkAuth())

			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				setIsLoading(false)
			}
		} catch (error) {
			console.log(error)
		}
	}, [dispatch])

	useEffect(() => {
		moment.locale(language)
	}, [language])

	useEffect(() => {
		handleResize()

		window.addEventListener('resize', handleResize)
		window.addEventListener('orientationchange', handleResize)

		document.documentElement.setAttribute('language', language)
		document.documentElement.dataset.theme = theme

		Cookies.set('language', language)
		Cookies.set('dark_theme', theme)
		Cookies.set('mark', mark)
		Cookies.set('amount', amount)
		Cookies.set('color', color)
		Cookies.set('help', help)

		const favicon = document.querySelector("link[rel*='icon']")

		if (favicon) {
			favicon.href = theme ? '/favicon-dark.ico' : '/favicon-light.ico'
		}

		return () => {
			window.removeEventListener('resize', handleResize)
			window.removeEventListener('orientationchange', handleResize)
		}
	}, [handleResize, language, theme, mark, amount, color, help])

	useEffect(() => {
		handleLoading()
	}, [handleLoading])

	useEffect(() => {
		if (isAuth && user?.is_activated && user?.id && exchange?.name) {
			connect()

			const timer = setTimeout(() => {
				subscribeToPositions()
			}, 1000)

			return () => {
				clearTimeout(timer)
				unsubscribeFromPositions()
				disconnect()
			}
		}
	}, [
		isAuth,
		user?.is_activated,
		user?.id,
		exchange?.name,
		connect,
		subscribeToPositions,
		unsubscribeFromPositions,
		disconnect,
	])

	const routes = useMemo(() => createRoutes(isAuth, user), [isAuth, user])

	return (
		<div
			className={
				isAuth && user.is_activated ? styles.app_container : styles.container
			}
		>
			{isLoading ? (
				<Loader />
			) : (
				<LazyLoader>
					{(serverStatus === 'loading' ||
						isLoadingTheme ||
						isLoadingLanguage) && <Loader />}

					{isAuth && user.is_activated && !isMobile && <SideBarLayout />}

					<div
						className={
							isAuth && user.is_activated ? styles.app_screen : styles.screen
						}
					>
						<HeaderLayout />

						<RouteRenderer routes={routes} />

						{(!isAuth || !user.is_activated) && <FooterLayout />}
					</div>

					{isAuth && user.is_activated && isMobile && <BottomBar />}
				</LazyLoader>
			)}
		</div>
	)
}
