import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/general/Icon';
import { SideBarItem } from '@/components/ui/general/SideBarItem';

import styles from './styles.module.scss';

export const SettingsList = React.memo(() => {
	const selectRef = useRef()
	const { t } = useTranslation()
	const [open, setOpen] = useState(false)

	const themeItem = { name: t('sidebar.theme'), icon: 'theme' }
	const languageItem = { name: t('sidebar.language'), icon: 'language' }

	const toggleOpen = () => {
		setOpen(prev => !prev)
	}

	const handleClickOutside = useCallback(e => {
		const path = e.composedPath ? e.composedPath() : e.path

		if (!path.includes(selectRef.current)) {
			setOpen(false)
		}
	}, [])

	useEffect(() => {
		document.body.addEventListener('click', handleClickOutside)

		return () => document.body.removeEventListener('click', handleClickOutside)
	}, [handleClickOutside])

	return (
		<div ref={selectRef} className={styles.header_settings_wrap}>
			<div
				className={`${styles.header_settings_head} ${
					open ? styles.header_settings_head_active : ''
				}`}
				onClick={toggleOpen}
			>
				<Icon width={24} height={24} id={'settings'} />
			</div>

			<ul
				className={
					open
						? `${styles.header_settings_list_active} ${styles.header_settings_list}`
						: `${styles.header_settings_list}`
				}
			>
				<li>
					<SideBarItem item={themeItem} />
				</li>

				<li>
					<SideBarItem item={languageItem} />
				</li>
			</ul>
		</div>
	)
})
