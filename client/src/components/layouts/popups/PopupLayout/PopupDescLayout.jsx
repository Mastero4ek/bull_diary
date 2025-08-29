import React from 'react'

import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'
import { H1 } from '@/components/ui/typography/titles/H1'

import styles from './styles.module.scss'

export const PopupDescLayout = React.memo(props => {
	const { title, text, image, children } = props

	return (
		<div className={styles.desc_layout}>
			{title && <H1>{title}</H1>}

			{(image || text) && (
				<div className={styles.desc_content}>
					{image && (
						<div className={styles.desc_image}>
							<img src={image} alt='image' />
						</div>
					)}

					{text && (
						<div className={styles.desc_text}>
							<RootDesc>
								<span>{text}</span>
							</RootDesc>
						</div>
					)}
				</div>
			)}

			{children}
		</div>
	)
})
