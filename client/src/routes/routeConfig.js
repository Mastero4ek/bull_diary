import { AuthCallback } from '@/pages/AuthCallback'
import { AuthError } from '@/pages/AuthError'
import { BattlePage } from '@/pages/BattlePage'
import { BookmarksPage } from '@/pages/BookmarksPage'
import { ContactsPage } from '@/pages/ContactsPage'
import { DiaryPage } from '@/pages/DiaryPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PositionPage } from '@/pages/PositionPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TablePage } from '@/pages/TablePage'
import { TermsPage } from '@/pages/TermsPage'
import { UsersPage } from '@/pages/UsersPage'
import { WalletDetailsPage } from '@/pages/WalletDetailsPage'
import { WalletPage } from '@/pages/WalletPage'

export const publicRoutes = [
	{
		path: '/home',
		component: HomePage,
	},
	{
		path: '/auth/success',
		component: AuthCallback,
	},
	{
		path: '/auth/error',
		component: AuthError,
	},
	{
		path: '/privacy',
		component: PrivacyPage,
	},
	{
		path: '/terms',
		component: TermsPage,
	},
]

export const protectedRoutes = [
	{
		path: '/wallet',
		component: WalletPage,
	},
	{
		path: '/wallet/details',
		component: WalletDetailsPage,
	},
	{
		path: '/diary/positions',
		component: DiaryPage,
	},
	{
		path: '/table/positions',
		component: TablePage,
	},
	{
		path: '/table/position/:id',
		component: PositionPage,
	},
	{
		path: '/battle/users',
		component: BattlePage,
	},
	{
		path: '/bookmarks/positions',
		component: BookmarksPage,
	},
	{
		path: '/bookmarks/position/:id',
		component: PositionPage,
	},
	{
		path: '/all-users',
		component: UsersPage,
	},
	{
		path: '/all-users/:id',
		component: ProfilePage,
	},
	{
		path: '/profile',
		component: ProfilePage,
	},
	{
		path: '/settings',
		component: SettingsPage,
	},
	{
		path: '/contacts',
		component: ContactsPage,
	},
]

export const specialRoutes = [
	{
		path: '/',
		redirect: (isAuth, user) =>
			isAuth && user?.is_activated ? '/wallet' : '/home',
	},
	{
		path: '*',
		component: NotFoundPage,
	},
]

export const createRoutes = (isAuth, user) => {
	const routes = []

	specialRoutes.forEach(route => {
		if (route.redirect && typeof route.redirect === 'function') {
			const redirectPath = route.redirect(isAuth, user)
			routes.push({
				...route,
				redirect: redirectPath,
			})
		} else if (route.component) {
			routes.push(route)
		}
	})

	publicRoutes.forEach(route => {
		if (route.component) {
			routes.push(route)
		}
	})

	if (isAuth && user?.is_activated) {
		protectedRoutes.forEach(route => {
			if (route.component) {
				routes.push(route)
			}
		})
	} else {
		routes.push({
			path: '*',
			redirect: '/home',
		})
	}

	return routes.filter(route => route && route.path)
}
