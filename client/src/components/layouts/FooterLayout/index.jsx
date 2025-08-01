import { Link } from 'react-router-dom'
import React from 'react'

import { Logo } from '@/components/ui/general/Logo'
import { Socials } from '@/components/ui/general/Socials'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc'

import styles from './styles.module.scss'

const FooterLink = React.memo(({ to, children }) => (
	<RootDesc>
		<Link to={to}>{children}</Link>
	</RootDesc>
))

export const FooterLayout = React.memo(() => {
	return (
		<footer className={styles.footer_wrapper}>
			<div className={styles.footer_logo}>
				<Logo />
			</div>

			<div className={styles.footer_content}>
				<RootDesc>
					<span>
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam
						esse facilis sit ipsam repellat aut est sunt! Sit, aspernatur?
						Sapiente tempora assumenda cum illum ea autem nulla beatae rerum
						quo.
					</span>
				</RootDesc>

				<div className={styles.footer_links}>
					<FooterLink to={'/privacy'}>Privacy</FooterLink>

					<FooterLink to={'/terms'}>Terms</FooterLink>
				</div>
			</div>

			<div className={styles.footer_socials}>
				<Socials />

				<SmallDesc>
					<span>© 2024. Created with love, Mastero4ek.</span>
				</SmallDesc>
			</div>
		</footer>
	)
})
