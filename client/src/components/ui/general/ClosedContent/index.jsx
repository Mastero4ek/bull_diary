import React from 'react'

import { useTranslation } from 'react-i18next'

import { Icon } from '@/components/ui/general/icon'

import styles from './styles.module.scss'

export const ClosedContent = React.memo(({ width, title }) => {
	const { t } = useTranslation()

	title = t('closed_title.coming')

	return (
		<i title={title} className={styles.closed}>
			<Icon width={width} height={width} id='close' />
		</i>
	)
})
