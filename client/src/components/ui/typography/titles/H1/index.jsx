import React from 'react'

import styles from './styles.module.scss'

export const H1 = React.memo(({ children }) => {
	return (
		<div className={styles.h1}>
			<h1>{children}</h1>
		</div>
	)
})
