import styles from './styles.module.scss'
import React from 'react'

export const H4 = React.memo(({ children }) => {
	return (
		<div className={styles.h4}>
			<h4>{children}</h4>
		</div>
	)
})
