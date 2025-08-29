import React from 'react'

import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { Link as LinkScroll } from 'react-scroll'

import { Socials } from '@/components/ui/forms/Socials'
import { Logo } from '@/components/ui/navigation/Logo'
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'
import { SmallDesc } from '@/components/ui/typography/descriptions/SmallDesc'
import { useNavList } from '@/hooks/useNavigation'

import styles from './styles.module.scss'

export const FooterLayout = React.memo(() => {
	const { t } = useTranslation()
	const location = useLocation()
	const { NAVLIST } = useNavList()

	return (
		<footer className={styles.footer_wrapper}>
			<div className={styles.footer_logo}>
				<Logo />
			</div>

			<div className={styles.footer_content}>
				<RootDesc>
					<span dangerouslySetInnerHTML={{ __html: t('footer.description') }} />
				</RootDesc>

				<div className={styles.footer_links}>
					<ul>
						{!location.pathname.includes('privacy') &&
							!location.pathname.includes('terms') &&
							NAVLIST &&
							NAVLIST.length > 0 &&
							NAVLIST.map(nav => (
								<li key={nav?.id}>
									<RootDesc>
										<LinkScroll
											to={nav?.anchor}
											spy={true}
											smooth={true}
											duration={500}
										>
											<span>{nav?.name}</span>
										</LinkScroll>
									</RootDesc>
								</li>
							))}

						{(location.pathname.includes('privacy') ||
							location.pathname.includes('terms')) && (
							<li>
								<RootDesc>
									<Link to={'/home'}>{t('nav.home')}</Link>
								</RootDesc>
							</li>
						)}

						<li>
							<RootDesc>
								<Link to={'/privacy'}>{t('nav.privacy')}</Link>
							</RootDesc>
						</li>

						<li>
							<RootDesc>
								<Link to={'/terms'}>{t('nav.terms')}</Link>
							</RootDesc>
						</li>
					</ul>
				</div>
			</div>

			<div className={styles.footer_socials}>
				<Socials />

				<SmallDesc>
					<span
						dangerouslySetInnerHTML={{
							__html: t('footer.copyright', { year: new Date().getFullYear() }),
						}}
					/>
				</SmallDesc>
			</div>
		</footer>
	)
})
