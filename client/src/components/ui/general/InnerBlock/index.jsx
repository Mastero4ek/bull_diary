import React from 'react'
import styles from './styles.module.scss'

export const InnerBlock = React.memo(({ children }) => {
	return <article className={styles.inner_block}>{children}</article>
})
