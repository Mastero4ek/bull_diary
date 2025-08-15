import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import moment from 'moment/min/moment-with-locales';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-scroll';

import avatarDefault from '@/assets/images/general/default_avatar.png';
import { NotificationLayout } from '@/components/layouts/NotificationLayout';
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { Logo } from '@/components/ui/general/Logo';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { useNavList } from '@/hooks/Navigation';
import { SignInPopup } from '@/popups/SignInPopup';

import { Exchange } from './Exchange';
import { SettingsList } from './SettingsList';
import styles from './styles.module.scss';

export const HeaderLayout = React.memo(() => {
	const { t } = useTranslation()
	const location = useLocation()
	const { openPopup } = usePopup()
	const { NAVLIST } = useNavList()
	const { isAuth, user } = useSelector(state => state.candidate)
	const [currentTime, setCurrentTime] = useState(
		moment().format('DD MMMM YYYY, HH:mm:ss')
	)

	const handleSignIn = useCallback(() => {
		openPopup(<SignInPopup />)
	})

	const renderUserSection = () => (
		<>
			<RootDesc>
				<span>{currentTime}</span>
			</RootDesc>

			<div className={styles.header_user_wrapper}>
				<OuterBlock>
					<div className={styles.header_user}>
						<RootDesc>
							<span>
								{`${user?.name} ${user?.last_name}` || t('user_default.name')}
							</span>
						</RootDesc>

						<div className={styles.header_avatar}>
							<img src={user?.cover || avatarDefault} alt='avatar' />
						</div>
					</div>
				</OuterBlock>
			</div>
		</>
	)

	const renderSettingsSection = () => (
		<div className={styles.header_settings}>
			<SettingsList />

			<RootButton
				onClickBtn={handleSignIn}
				text={t('button.sign_in')}
				icon='sign-in'
			/>
		</div>
	)

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

				{!isAuth &&
					!user.is_activated &&
					!location.pathname.includes('privacy') &&
					!location.pathname.includes('terms') && (
						<nav className={styles.header_nav}>
							<ul>
								{NAVLIST &&
									NAVLIST.length > 0 &&
									NAVLIST.map(nav => (
										<li key={nav?.id}>
											<RootDesc>
												<Link
													to={nav?.anchor}
													spy={true}
													smooth={true}
													duration={500}
												>
													<span>{nav?.name}</span>
												</Link>
											</RootDesc>
										</li>
									))}
							</ul>
						</nav>
					)}

				{isAuth && user.is_activated
					? renderUserSection()
					: renderSettingsSection()}

				<NotificationLayout />
			</div>
		</div>
	)
})
