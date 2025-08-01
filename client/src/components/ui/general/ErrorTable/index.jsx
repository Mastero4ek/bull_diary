import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import styles from './styles.module.scss'
import React from 'react'

export const ErrorTable = React.memo(({ error, width = 70, center = true }) => {
	return (
		<div
			className={styles.error}
			style={{ width: `${width}%`, textAlign: `${center ? 'center' : 'left'}` }}
		>
			<RootDesc>
				<span>{error}</span>
			</RootDesc>
		</div>
	)
})
