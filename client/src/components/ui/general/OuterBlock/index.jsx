import React from 'react'
import styles from './styles.module.scss'

export const OuterBlock = React.memo(({ children }) => {
	return <article className={styles.outer_block}>{children}</article>
})
