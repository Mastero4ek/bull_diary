import { Icon } from '@/components/ui/general/Icon'
import { H4 } from '@/components/ui/titles/H4'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import React from 'react'
import styles from './styles.module.scss'

export const DescLayout = React.memo(props => {
	const { icon, title, description, children } = props

	return (
		<div className={styles.desc_wrapper}>
			<div className={styles.desc_head}>
				{icon && <Icon id={icon} />}

				{title && (
					<H4>
						<span>{title}</span>
					</H4>
				)}
			</div>

			{description && (
				<RootDesc>
					<span>{description}</span>
				</RootDesc>
			)}

			{children}
		</div>
	)
})
