import React from 'react'
import styles from './styles.module.scss'

export const SmallDesc = React.memo(props => {
	const { children } = props

	return <div className={styles.small_desc}>{children}</div>
})
