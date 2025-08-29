import React from 'react'

import { SmallDesc } from '@/components/ui/typography/descriptions/SmallDesc'

import styles from './styles.module.scss'

export const ErrorForm = React.memo(({ error, bottom }) => {
	return (
		<div style={{ bottom: `${bottom}rem` }} className={styles.error}>
			<SmallDesc>
				<span style={{ opacity: '1' }}>{error}</span>
			</SmallDesc>
		</div>
	)
})
