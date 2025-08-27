import React from 'react';

import { useSelector } from 'react-redux';

import { RootDesc } from '@/components/ui/descriptions/RootDesc';

import styles from './styles.module.scss';

export const DotList = React.memo(({ listArr, direction = 'left' }) => {
	const { isTablet, isMobile } = useSelector(state => state.settings)

	return (
		<ul
			className={`${styles.dot_list} ${
				isTablet || isMobile ? styles.center : ''
			}`}
		>
			{listArr &&
				listArr.length > 0 &&
				listArr.map(item => (
					<li
						key={item.id}
						className={
							(!isTablet || !isMobile) && direction === 'left'
								? styles.left
								: styles.right
						}
					>
						<RootDesc>
							<span dangerouslySetInnerHTML={{ __html: item.text }} />
						</RootDesc>
					</li>
				))}
		</ul>
	)
})
