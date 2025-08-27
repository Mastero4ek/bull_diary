import { lazy } from 'react'

export const LazyHomePage = lazy(() => import('@/pages/HomePage'))
export const LazyAuthCallback = lazy(() => import('@/pages/AuthCallback'))
export const LazyAuthError = lazy(() => import('@/pages/AuthError'))
export const LazyWalletPage = lazy(() => import('@/pages/WalletPage'))
export const LazyWalletDetailsPage = lazy(() =>
	import('@/pages/WalletDetailsPage')
)
export const LazyDiaryPage = lazy(() => import('@/pages/DiaryPage'))
export const LazyTablePage = lazy(() => import('@/pages/TablePage'))
export const LazyPositionPage = lazy(() => import('@/pages/PositionPage'))
export const LazyBattlePage = lazy(() => import('@/pages/BattlePage'))
export const LazyBookmarksPage = lazy(() => import('@/pages/BookmarksPage'))
export const LazyUsersPage = lazy(() => import('@/pages/UsersPage'))
export const LazyProfilePage = lazy(() => import('@/pages/ProfilePage'))
export const LazySettingsPage = lazy(() => import('@/pages/SettingsPage'))
export const LazyContactsPage = lazy(() => import('@/pages/ContactsPage'))
export const LazyPrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
export const LazyTermsPage = lazy(() => import('@/pages/TermsPage'))
export const LazyNotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

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
