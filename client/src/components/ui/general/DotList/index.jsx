import React from 'react'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'

import styles from './styles.module.scss'

export const DotList = React.memo(({ listArr, direction = 'left' }) => {
	return (
		<ul className={styles.dot_list}>
			{listArr &&
				listArr.length > 0 &&
				listArr.map(item => (
					<li
						key={item.id}
						className={direction === 'left' ? styles.left : styles.right}
					>
						<RootDesc>
							<span dangerouslySetInnerHTML={{ __html: item.text }} />
						</RootDesc>
					</li>
				))}
		</ul>
	)
})
