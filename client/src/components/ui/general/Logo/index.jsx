import React, { useMemo } from 'react'
import styles from './styles.module.scss'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc'
import logoLight from '@/assets/images/logo-light.svg'
import logoDark from '@/assets/images/logo-dark.svg'
import { useSelector } from 'react-redux'

export const Logo = React.memo(props => {
	const { desc = true } = props
	const { theme } = useSelector(state => state.settings)

	const logoSrc = useMemo(() => (theme ? logoDark : logoLight), [theme])

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
							<i className={styles.opacity}>analyze & earn</i>
						</span>
					</SmallDesc>
				</div>
			)}
		</div>
	)
})
