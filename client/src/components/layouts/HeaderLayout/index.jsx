import React from 'react';

import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-scroll';

import { NotificationLayout } from '@/components/layouts/NotificationLayout';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { Logo } from '@/components/ui/general/Logo';
import { useNavList } from '@/hooks/useNavigation';

import { Exchange } from './Exchange';
import { SettingsWrapper } from './SettingsWrapper';
import styles from './styles.module.scss';
import { UserWrapper } from './UserWrapper';

export const HeaderLayout = React.memo(() => {
	const location = useLocation()
	const { NAVLIST } = useNavList()

	const { isTablet, isMobile } = useSelector(state => state.settings)
	const { isAuth, user } = useSelector(state => state.candidate)

	return (
		<header
			style={
				isAuth && user.is_activated
					? { paddingRight: isMobile ? '0' : isTablet ? '16rem' : '40rem' }
					: {}
			}
		>
			<div className={styles.header_wrapper}>
				{isAuth && user.is_activated ? (
					isMobile ||
					isTablet ||
					(!(
						location.pathname.includes('profile') ||
						location.pathname.includes('settings') ||
						location.pathname.includes('contacts')
					) && <Exchange />)
				) : (
					<div className={styles.header_logo}>
						<Logo desc={isMobile ? false : true} />
					</div>
				)}

				{!isAuth &&
					!isTablet &&
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

				{isAuth && user.is_activated ? <UserWrapper /> : <SettingsWrapper />}

				<NotificationLayout />
			</div>
		</header>
	)
})
