import { Suspense, useCallback, useEffect, useMemo } from 'react'

import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'

import { FooterLayout } from '@/components/layouts/FooterLayout'
import { HeaderLayout } from '@/components/layouts/HeaderLayout'
import { SideBarLayout } from '@/components/layouts/SideBarLayout'
import { Loader } from '@/components/ui/general/Loader'
import { BattlePage } from '@/pages/BattlePage'
import { BookmarksPage } from '@/pages/BookmarksPage'
import { ContactsPage } from '@/pages/ContactsPage'
import { DiaryPage } from '@/pages/DiaryPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TablePage } from '@/pages/TablePage'
import { TablePositionPage } from '@/pages/TablePositionPage'
import { TermsPage } from '@/pages/TermsPage'
import { UsersPage } from '@/pages/UsersPage'
import { WalletDetailsPage } from '@/pages/WalletDetailsPage'
import { WalletPage } from '@/pages/WalletPage'
import { checkAuth } from '@/redux/slices/candidateSlice'
import { setScreenParams } from '@/redux/slices/settingsSlice'

import styles from './styles.module.scss'

export const App = () => {
	const { isAuth, user, serverStatus } = useSelector(state => state.candidate)
	const { language, theme, mark, amount, color, isLoadingTheme } = useSelector(
		state => state.settings
	)

	const dispatch = useDispatch()

	const handleResize = useCallback(() => {
		dispatch(
			setScreenParams({
				isMobile: window.innerWidth < 768,
				width: window.innerWidth,
			})
		)
	}, [dispatch])

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

		const favicon = document.querySelector("link[rel*='icon']")

		if (favicon) {
			favicon.href = theme ? '/favicon-dark.ico' : '/favicon-light.ico'
		}

		return () => {
			window.removeEventListener('resize', handleResize)
			window.removeEventListener('orientationchange', handleResize)
		}
	}, [handleResize, language, theme])

	useEffect(() => {
		dispatch(checkAuth())
	}, [dispatch])

	const routes = useMemo(
		() => (
			<Routes>
				<Route
					path='/'
					element={
						<Navigate
							to={isAuth && user.is_activated ? '/wallet' : '/home'}
							replace
						/>
					}
				/>
				<Route
					path='/home'
					element={
						isAuth && user.is_activated ? (
							<Navigate to='/wallet' replace />
						) : (
							<HomePage />
						)
					}
				/>

				{isAuth && user.is_activated ? (
					<>
						<Route path='/wallet' element={<WalletPage />} />
						<Route path='/wallet/details' element={<WalletDetailsPage />} />
						<Route path='/diary/positions' element={<DiaryPage />} />
						{/* <Route path='/diary/position/:id' element={<DiaryPositionPage />} /> */}
						<Route path='/table/positions' element={<TablePage />} />
						<Route path='/table/position/:id' element={<TablePositionPage />} />
						<Route path='/battle/users' element={<BattlePage />} />
						<Route path='/bookmarks/positions' element={<BookmarksPage />} />
						<Route
							path='/bookmarks/position/:id'
							element={<TablePositionPage />}
						/>
						<Route path='/all-users' element={<UsersPage />} />
						<Route path='/all-users/:id' element={<ProfilePage />} />
						<Route path='/profile' element={<ProfilePage />} />
						<Route path='/settings' element={<SettingsPage />} />
						<Route path='/contacts' element={<ContactsPage />} />
					</>
				) : (
					<Route path='*' element={<Navigate to='/home' replace />} />
				)}

				<Route path='/privacy' element={<PrivacyPage />} />
				<Route path='/terms' element={<TermsPage />} />
				<Route path='*' element={<NotFoundPage />} />
			</Routes>
		),
		[isAuth]
	)

	return (
		<div
			className={
				isAuth && user.is_activated ? styles.app_container : styles.container
			}
		>
			<Suspense fallback={<Loader />}>
				{(serverStatus === 'loading' || isLoadingTheme) && <Loader />}
				{isAuth && user.is_activated && <SideBarLayout />}

				<div
					className={
						isAuth && user.is_activated ? styles.app_screen : styles.screen
					}
				>
					<HeaderLayout />

					{routes}

					{(!isAuth || !user.is_activated) && <FooterLayout />}
				</div>
			</Suspense>
		</div>
	)
}
