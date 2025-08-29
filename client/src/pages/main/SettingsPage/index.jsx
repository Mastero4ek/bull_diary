import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { PageLayout } from '@/components/layouts/core/PageLayout'
import { DescLayout } from '@/components/layouts/core/PageLayout/DescLayout'
import { OuterBlock } from '@/components/layouts/utils/OuterBlock'

import { Keys } from './Keys'
import styles from './styles.module.scss'
import { Tuning } from './Tuning'

export const SettingsPage = React.memo(() => {
	const [changeDesc, setChangeDesc] = useState(false)
	const { t } = useTranslation()
	const { help, isTablet, isMobile } = useSelector(state => state.settings)

	return (
		<PageLayout
			chartWidth={help && (isTablet || isMobile) ? 0 : 600}
			filter={false}
		>
			<div style={{ marginBottom: 'auto' }}>
				<div className={styles.settings_wrapper}>
					<Keys handleClickRadio={() => setChangeDesc(!changeDesc)} />
					<Tuning handleClickRadio={() => setChangeDesc(!changeDesc)} />
				</div>
			</div>

			{(!help || (!isTablet && !isMobile)) && (
				<OuterBlock>
					{!changeDesc ? (
						<DescLayout
							icon={'settings'}
							title={
								<span
									dangerouslySetInnerHTML={{
										__html: t('page.settings.tuning_title'),
									}}
								/>
							}
							description={
								<span
									dangerouslySetInnerHTML={{
										__html: t('page.settings.tuning_description'),
									}}
								/>
							}
						/>
					) : (
						<DescLayout
							icon={'keys'}
							title={
								<span
									dangerouslySetInnerHTML={{
										__html: t('page.settings.keys_title'),
									}}
								/>
							}
							description={
								<span
									dangerouslySetInnerHTML={{
										__html: t('page.settings.keys_description'),
									}}
								/>
							}
						/>
					)}
				</OuterBlock>
			)}
		</PageLayout>
	)
})
