import { SmallDesc } from '@/components/ui/descriptions/SmallDesc'
import styles from './styles.module.scss'
import React from 'react'

export const ErrorForm = React.memo(({ error, bottom }) => {
	return (
		<div style={{ bottom: `${bottom}rem` }} className={styles.error}>
			<SmallDesc>
				<span style={{ opacity: '1' }}>{error}</span>
			</SmallDesc>
		</div>
	)
})
