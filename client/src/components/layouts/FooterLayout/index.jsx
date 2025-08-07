import React from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { Logo } from '@/components/ui/general/Logo';
import { Socials } from '@/components/ui/general/Socials';

import styles from './styles.module.scss';

const FooterLink = React.memo(({ to, children }) => (
	<RootDesc>
		<Link to={to}>{children}</Link>
	</RootDesc>
))

export const FooterLayout = React.memo(() => {
	const { t } = useTranslation()

	return (
		<footer className={styles.footer_wrapper}>
			<div className={styles.footer_logo}>
				<Logo />
			</div>

			<div className={styles.footer_content}>
				<RootDesc>
					<span>{t('footer.description')}</span>
				</RootDesc>

				<div className={styles.footer_links}>
					<FooterLink to={'/privacy'}>{t('footer.privacy')}</FooterLink>

					<FooterLink to={'/terms'}>{t('footer.terms')}</FooterLink>
				</div>
			</div>

			<div className={styles.footer_socials}>
				<Socials />

				<SmallDesc>
					<span>{t('footer.copyright')}</span>
				</SmallDesc>
			</div>
		</footer>
	)
})
