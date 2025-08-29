import React from 'react'

import styles from './styles.module.scss'

export const Mark = React.memo(({ color }) => {
	return (
		<i className={styles.mark} style={{ background: `var(--${color})` }}></i>
	)
})
