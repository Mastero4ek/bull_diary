import React from 'react'

import styles from './styles.module.scss'

export const RootDesc = React.memo(props => {
	const { style, children } = props

	return (
		<div style={{ ...style }} className={styles.root_desc}>
			{children}
		</div>
	)
})
