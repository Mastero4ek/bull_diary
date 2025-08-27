import React from 'react';

import { useTranslation } from 'react-i18next';
import {
  Link,
  useLocation,
} from 'react-router-dom';

import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { Icon } from '@/components/ui/general/Icon';
import { OuterBlock } from '@/components/ui/general/OuterBlock';

import styles from './styles.module.scss';

export const BottomBar = () => {
	const { t } = useTranslation()
	const location = useLocation()

	const menuItems = [
		{ id: 0, name: t('sidebar.battle'), link: '/battle/users', icon: 'battle' },

		{
			id: 1,
			name: t('sidebar.diary'),
			link: '/diary/positions',
			icon: 'diary',
		},
		{
			id: 2,
			name: t('sidebar.table'),
			link: '/table/positions',
			icon: 'table',
		},
		{
			id: 3,
			name: t('sidebar.bookmarks'),
			link: '/bookmarks/positions',
			icon: 'bookmarks',
		},
		{ id: 4, name: t('sidebar.wallet'), link: '/wallet', icon: 'wallet' },
	]

	return (
		<div className={styles.bottom_bar_wrapper}>
			<OuterBlock>
				<ul className={styles.bottom_bar_list}>
					{menuItems.map(item => (
						<li
							key={item?.id}
							className={location.pathname === item?.link ? styles.active : ''}
						>
							<Link to={item?.link}>
								<Icon id={item?.icon} />

								<SmallDesc>
									<span>{item?.name}</span>
								</SmallDesc>
							</Link>
						</li>
					))}
				</ul>
			</OuterBlock>
		</div>
	)
}
