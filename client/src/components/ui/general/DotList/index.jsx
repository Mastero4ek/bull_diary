import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import React from 'react'

import styles from './styles.module.scss'

export const DotList = React.memo(({ listArr }) => {
	return (
		<ul className={styles.dot_list}>
			{listArr &&
				listArr.length > 0 &&
				listArr.map(item => (
					<li key={item.id}>
						<RootDesc>
							<span>{item.text}</span>
						</RootDesc>
					</li>
				))}
		</ul>
	)
})
