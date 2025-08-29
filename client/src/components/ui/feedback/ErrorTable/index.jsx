import React from 'react'

import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'

import styles from './styles.module.scss'

export const ErrorTable = React.memo(({ error, width = 70, center = true }) => {
	return (
		<div
			className={styles.error}
			style={{ width: `${width}%`, textAlign: `${center ? 'center' : 'left'}` }}
		>
			<RootDesc>
				<span dangerouslySetInnerHTML={{ __html: error }} />
			</RootDesc>
		</div>
	)
})
