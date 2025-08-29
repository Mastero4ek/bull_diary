import React from 'react'

import { useTranslation } from 'react-i18next'

import { Icon } from '@/components/ui/media/Icon'

import styles from './styles.module.scss'

export const ClosedContent = React.memo(({ width, title }) => {
	const { t } = useTranslation()

	title = !title ? t('closed_title.coming') : title

	return (
		<i title={title} className={styles.closed}>
			<Icon width={width} height={width} id='close' />
		</i>
	)
})
