import React, { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import logoDark from '@/assets/images/logo-dark.svg'
import logoLight from '@/assets/images/logo-light.svg'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc'

import styles from './styles.module.scss'

export const Logo = React.memo(props => {
	const { desc = true } = props
	const { theme } = useSelector(state => state.settings)

	const logoSrc = useMemo(() => (theme ? logoDark : logoLight), [theme])

	const { t } = useTranslation()

	return (
		<div
			style={!desc ? { borderRadius: '50%' } : {}}
			className={styles.logo_wrapper}
		>
			<img src={logoSrc} alt='logo' />

			{desc && (
				<div className={styles.logo_desc}>
					<RootDesc>
						<span>
							<b>Bull</b> <span className={styles.lightWeight}>Diary</span>
						</span>
					</RootDesc>

					<SmallDesc>
						<span>
							<i
								className={styles.opacity}
								dangerouslySetInnerHTML={{ __html: t('logo.analyze_earn') }}
							/>
						</span>
					</SmallDesc>
				</div>
			)}
		</div>
	)
})
