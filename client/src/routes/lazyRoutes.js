import { lazy } from 'react'

export const LazyHomePage = lazy(() => import('@/pages/main/HomePage'))
export const LazyAuthCallback = lazy(() => import('@/pages/auth/AuthCallback'))
export const LazyAuthError = lazy(() => import('@/pages/auth/AuthError'))
export const LazyWalletPage = lazy(() => import('@/pages/main/WalletPage'))
export const LazyWalletDetailsPage = lazy(() =>
	import('@/pages/main/WalletDetailsPage')
)
export const LazyDiaryPage = lazy(() => import('@/pages/main/DiaryPage'))
export const LazyTablePage = lazy(() => import('@/pages/main/TablePage'))
export const LazyPositionPage = lazy(() => import('@/pages/main/PositionPage'))
export const LazyBattlePage = lazy(() => import('@/pages/main/BattlePage'))
export const LazyBookmarksPage = lazy(() =>
	import('@/pages/main/BookmarksPage')
)
export const LazyUsersPage = lazy(() => import('@/pages/main/UsersPage'))
export const LazyProfilePage = lazy(() => import('@/pages/main/ProfilePage'))
export const LazySettingsPage = lazy(() => import('@/pages/main/SettingsPage'))
export const LazyContactsPage = lazy(() => import('@/pages/info/ContactsPage'))
export const LazyPrivacyPage = lazy(() => import('@/pages/info/PrivacyPage'))
export const LazyTermsPage = lazy(() => import('@/pages/info/TermsPage'))
export const LazyNotFoundPage = lazy(() => import('@/pages/info/NotFoundPage'))

export const lazyComponents = {
	HomePage: LazyHomePage,
	AuthCallback: LazyAuthCallback,
	AuthError: LazyAuthError,
	WalletPage: LazyWalletPage,
	WalletDetailsPage: LazyWalletDetailsPage,
	DiaryPage: LazyDiaryPage,
	TablePage: LazyTablePage,
	PositionPage: LazyPositionPage,
	BattlePage: LazyBattlePage,
	BookmarksPage: LazyBookmarksPage,
	UsersPage: LazyUsersPage,
	ProfilePage: LazyProfilePage,
	SettingsPage: LazySettingsPage,
	ContactsPage: LazyContactsPage,
	PrivacyPage: LazyPrivacyPage,
	TermsPage: LazyTermsPage,
	NotFoundPage: LazyNotFoundPage,
}

export const getLazyComponent = componentName => {
	return lazyComponents[componentName] || LazyNotFoundPage
}

export const createLazyComponent = importFn => {
	return lazy(() =>
		importFn().then(module => ({
			default: module.default || module,
		}))
	)
}
