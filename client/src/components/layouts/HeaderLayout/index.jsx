import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Cookies from 'js-cookie';
import moment from 'moment';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { useLocation } from 'react-router-dom';

import avatarDefault from '@/assets/images/general/default_avatar.png';
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { InnerBlock } from '@/components/ui/general/InnerBlock';
import { Logo } from '@/components/ui/general/Logo';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { CheckboxSwitch } from '@/components/ui/inputs/CheckboxSwitch';
import i18n from '@/i18n';
import { SignInPopup } from '@/popups/SignInPopup';
import {
  setIsLoadingLanguage,
  setIsLoadingTheme,
  setLanguage,
  setTheme,
} from '@/redux/slices/settingsSlice';

import { Exchange } from './Exchange';
import styles from './styles.module.scss';

export const HeaderLayout = React.memo(() => {
	const dispatch = useDispatch()
	const location = useLocation()
	const { openPopup } = usePopup()
	const { theme, language } = useSelector(state => state.settings)
	const { isAuth, user } = useSelector(state => state.candidate)

	const [currentTime, setCurrentTime] = useState(
		moment().format('DD MMMM YYYY, HH:mm:ss')
	)

	const languageList = ['ru', 'en']

	useEffect(() => {
		let timeoutId

		const updateTime = () => {
			setCurrentTime(
				<>
					<b>{moment().format('DD MMMM YYYY')}</b>
					<span>{moment().format(', HH:mm:ss')}</span>
				</>
			)

			const now = new Date()
			const msToNextSecond = 1000 - now.getMilliseconds()

			timeoutId = setTimeout(updateTime, msToNextSecond)
		}

		updateTime()

		return () => clearTimeout(timeoutId)
	}, [])

	const handleSignIn = useCallback(() => {
		openPopup(<SignInPopup />)
	})

	const changeTheme = useCallback(async () => {
		const currentTheme = theme === true ? false : true

		dispatch(setIsLoadingTheme(true))
		dispatch(setTheme(currentTheme))

		setTimeout(() => {
			dispatch(setIsLoadingTheme(false))
		}, 2000)
	}, [dispatch, theme])

	const changeLanguage = useCallback(
		value => {
			dispatch(setIsLoadingLanguage(true))
			document.documentElement.setAttribute('lang', value)
			Cookies.set('language', value)
			i18n.changeLanguage(value)

			dispatch(setLanguage(value))

			setTimeout(() => {
				dispatch(setIsLoadingLanguage(false))
			}, 2000)
		},
		[dispatch, language]
	)

	const renderUserSection = () => (
		<>
			<RootDesc>
				<span>{currentTime}</span>
			</RootDesc>

			<div className={styles.header_user_wrapper}>
				<OuterBlock>
					<div className={styles.header_user}>
						<RootDesc>
							<span>{`${user?.name} ${user?.last_name}` || 'User_name'}</span>
						</RootDesc>

						<div className={styles.header_avatar}>
							<img src={user?.cover || avatarDefault} alt='avatar' />
						</div>
					</div>
				</OuterBlock>
			</div>
		</>
	)

	const renderSignInButton = () => (
		<div className={styles.header_settings}>
			<ul className={styles.header_language}>
				{languageList &&
					languageList.length > 0 &&
					languageList.map(lang => {
						const ItemBlock = language === lang ? InnerBlock : OuterBlock

						return (
							<li key={lang}>
								<RootDesc>
									<ItemBlock>
										<b
											style={
												language === lang
													? {
															color: 'var(--primaryDef)',
															pointerEvents: 'none',
													  }
													: {}
											}
											onClick={() => changeLanguage(lang)}
										>
											{lang}
										</b>
									</ItemBlock>
								</RootDesc>
							</li>
						)
					})}
			</ul>

			<CheckboxSwitch
				icons={true}
				name={'theme'}
				onSwitch={changeTheme}
				checked={theme}
			/>

			<RootButton onClickBtn={handleSignIn} text={'Sign in'} icon='sign-in' />
		</div>
	)

	return (
		<div style={isAuth && user.is_activated ? { paddingRight: '40rem' } : {}}>
			<div className={styles.header_wrapper}>
				{isAuth && user.is_activated ? (
					!(
						location.pathname.includes('profile') ||
						location.pathname.includes('settings') ||
						location.pathname.includes('contacts')
					) && <Exchange />
				) : (
					<div className={styles.header_logo}>
						<Logo />
					</div>
				)}

				{isAuth && user.is_activated
					? renderUserSection()
					: renderSignInButton()}
			</div>
		</div>
	)
})
