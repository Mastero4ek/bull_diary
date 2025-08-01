import React from 'react'

import { Icon } from '@/components/ui/general/icon'

import styles from './styles.module.scss'

export const ClosedContent = React.memo(({ width, title = 'Coming soon!' }) => {
	return (
		<i title={title} className={styles.closed}>
			<Icon width={width} height={width} id='close' />
		</i>
	)
})
