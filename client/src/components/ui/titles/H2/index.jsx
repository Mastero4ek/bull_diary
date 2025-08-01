import styles from './styles.module.scss'
import React from 'react'

export const H2 = React.memo(({ children }) => {
	return (
		<div className={styles.h2}>
			<h2>{children}</h2>
		</div>
	)
})
