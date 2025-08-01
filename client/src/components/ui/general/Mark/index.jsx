import styles from './styles.module.scss'
import React from 'react'

export const Mark = React.memo(({ color }) => {
	return (
		<i className={styles.mark} style={{ background: `var(--${color})` }}></i>
	)
})
