import React, { useCallback, useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { RootButton } from '@/components/ui/buttons/RootButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { ClosedContent } from '@/components/ui/general/ClosedContent'
import { Icon } from '@/components/ui/general/Icon'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { Logo } from '@/components/ui/general/logo'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { CheckboxSwitch } from '@/components/ui/inputs/CheckboxSwitch'
import { logout } from '@/redux/slices/candidateSlice'
import {
	setIsLoadingTheme,
	setSideBar,
	setTheme,
} from '@/redux/slices/settingsSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import styles from './styles.module.scss'

const SideBarItem = React.memo(({ item }) => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const location = useLocation()

	const { theme, sideBar } = useSelector(state => state.settings)
	const { user } = useSelector(state => state.candidate)

	const handleClickItem = useCallback(async () => {
		if (item?.link) {
			navigate(item.link)
		}

		if (item?.icon === 'logout') {
			try {
				const resultAction = await dispatch(logout())
				const originalPromiseResult = unwrapResult(resultAction)

				if (!originalPromiseResult) return

				navigate('/login')
			} catch (rejectedValueOrSerializedError) {
				console.log(rejectedValueOrSerializedError)
			}
		}
	}, [dispatch, location])

	const changeTheme = useCallback(() => {
		const currentTheme = theme === true ? false : true

		dispatch(setIsLoadingTheme(true))
		dispatch(setTheme(currentTheme))

		setTimeout(() => {
			dispatch(setIsLoadingTheme(false))
		}, 2000)
	}, [theme])

	const isActive = location.pathname.includes(item?.icon)
	const ItemBlock = isActive ? InnerBlock : OuterBlock

	return (
		<ItemBlock>
			{item?.link &&
				item?.link.includes('battle') &&
				user?.role !== 'admin' && <ClosedContent width={20} />}

			<div
				onClick={
					item?.link && item?.link.includes('battle') && user?.role !== 'admin'
						? undefined
						: handleClickItem
				}
				className={`${item?.icon === 'theme' ? styles.item_theme : ''} ${
					styles.sidebar_body_item
				} ${isActive ? styles.active : ''}`}
			>
				<Icon id={item?.icon} />

				{(sideBar.open || sideBar.blocked_value === 'open') && (
					<div className={styles.sidebar_item_desc}>
						<RootDesc>
							<span>{item?.name}</span>
						</RootDesc>

						{item?.icon === 'theme' && (
							<div style={{ marginLeft: 'auto' }}>
								<CheckboxSwitch
									name={'theme'}
									onSwitch={changeTheme}
									checked={theme}
								/>
							</div>
						)}
					</div>
				)}
			</div>
		</ItemBlock>
	)
})

export const SideBarLayout = React.memo(() => {
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const location = useLocation()
	const navigate = useNavigate()
	const { user } = useSelector(state => state.candidate)
	const { sideBar, language } = useSelector(state => state.settings)

	const themeItem = { name: t('sidebar.theme'), icon: 'theme' }
	const logoutItem = { name: t('sidebar.logout'), icon: 'logout' }

	const sideBarItems = [
		{ id: 0, name: t('sidebar.wallet'), link: '/wallet', icon: 'wallet' },
		{
			id: 1,
			name: t('sidebar.diary'),
			link: '/diary/positions',
			icon: 'diary',
		},
		{
			id: 2,
			name: t('sidebar.table'),
			link: '/table/positions',
			icon: 'table',
		},
		{
			id: 3,
			name: t('sidebar.bookmarks'),
			link: '/bookmarks/positions',
			icon: 'bookmarks',
		},
		{ id: 4, name: t('sidebar.battle'), link: '/battle/users', icon: 'battle' },
		user?.role === 'admin' && {
			id: 5,
			name: t('sidebar.users'),
			link: '/all-users',
			icon: 'all-users',
		},
		{ id: 6, name: t('sidebar.profile'), link: '/profile', icon: 'profile' },
		{ id: 7, name: t('sidebar.settings'), link: '/settings', icon: 'settings' },
		{ id: 8, name: t('sidebar.contacts'), link: '/contacts', icon: 'contacts' },
	]

	const handleBackClick = useCallback(() => {
		navigate(-1)
	}, [navigate])

	useEffect(() => {
		if (sideBar.blocked_value === 'unblock') {
			dispatch(setSideBar({ ...sideBar, open: false }))
		}
	}, [])

	const shouldShowBackButton = item => {
		return (
			(location.pathname.includes('/wallet/details') && item.id === 0) ||
			(location.pathname.includes('/diary/position/') && item.id === 1) ||
			(location.pathname.includes('/table/position/') && item.id === 2) ||
			(location.pathname.includes('/bookmarks/position/') && item.id === 3) ||
			(location.pathname.includes('/all-users/') && item.id === 5)
		)
	}

	return (
		<div
			onMouseEnter={() =>
				sideBar.blocked_value === 'unblock' &&
				dispatch(setSideBar({ ...sideBar, open: true }))
			}
			onMouseLeave={() =>
				sideBar.blocked_value === 'unblock' &&
				dispatch(setSideBar({ ...sideBar, open: false }))
			}
			className={`${styles.sidebar_wrapper} ${
				sideBar.open || sideBar.blocked_value === 'open'
					? styles.sidebar_open
					: ''
			}`}
		>
			<div className={styles.sidebar_header}>
				<Logo desc={sideBar.open || sideBar.blocked_value === 'open'} />
			</div>

			<ul className={styles.sidebar_body}>
				{sideBarItems.map(
					item =>
						item && (
							<li key={item.id}>
								{shouldShowBackButton(item) ? (
									<div className={styles.sidebar_back_button}>
										<RootButton
											onClickBtn={handleBackClick}
											text={`${t('sidebar.back_to')} ${
												language === 'en' ? item.name.toLowerCase() : ''
											}`}
											icon='back-arrow'
										/>
									</div>
								) : (
									<SideBarItem item={item} />
								)}
							</li>
						)
				)}
			</ul>

			<div className={styles.sidebar_footer}>
				<SideBarItem item={themeItem} />
				<SideBarItem item={logoutItem} />
			</div>
		</div>
	)
})
