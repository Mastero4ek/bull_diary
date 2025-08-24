import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { PageLayout } from '@/components/layouts/PageLayout'
import { DescLayout } from '@/components/layouts/PageLayout/DescLayout'
import { OuterBlock } from '@/components/ui/general/OuterBlock'

import { Keys } from './Keys'
import styles from './styles.module.scss'
import { Tuning } from './Tuning'

export const SettingsPage = React.memo(() => {
	const [changeDesc, setChangeDesc] = useState(false)
	const { t } = useTranslation()

	return (
		<PageLayout chartWidth={600} filter={false}>
			<div style={{ marginBottom: 'auto' }}>
				<div className={styles.settings_wrapper}>
					<Keys handleClickRadio={() => setChangeDesc(!changeDesc)} />
					<Tuning handleClickRadio={() => setChangeDesc(!changeDesc)} />
				</div>
			</div>

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
		</PageLayout>
	)
})
