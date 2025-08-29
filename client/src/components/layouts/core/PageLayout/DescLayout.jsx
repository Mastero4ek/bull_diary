import React from 'react'

import { Icon } from '@/components/ui/media/Icon'
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'
import { H4 } from '@/components/ui/typography/titles/H4'

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
				<div className={styles.desc_layout}>
					<RootDesc>
						<span>{description}</span>
					</RootDesc>
				</div>
			)}

			{children}
		</div>
	)
})
