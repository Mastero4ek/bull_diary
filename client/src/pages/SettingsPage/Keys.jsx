import React from 'react'

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { ControlButton } from '@/components/ui/buttons/ControlButton'
import { Loader } from '@/components/ui/general/Loader'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { H2 } from '@/components/ui/titles/H2'

import { KeysForm } from './KeysForm'
import styles from './styles.module.scss'

export const Keys = React.memo(({ handleClickRadio }) => {
	const { changeUser, serverStatus } = useSelector(state => state.candidate)
	const { t } = useTranslation()

	return (
		<OuterBlock>
			<div className={styles.keys_wrapper}>
				{serverStatus === 'loading' && <Loader />}

				<input
					id='keys_accordion'
					type='radio'
					name='accordion'
					className={styles.keys_radio}
					onChange={handleClickRadio}
				/>
				<label htmlFor='keys_accordion' className={styles.keys_header}>
					<H2>
						<span>{t('page.settings.keys_api_title')}</span>
					</H2>

					<ControlButton text={<i></i>} />
				</label>

				<ul>
					{changeUser?.keys &&
						changeUser.keys.length > 0 &&
						changeUser.keys.map(exchange => (
							<li key={exchange?.id}>
								<KeysForm exchange={exchange} />
							</li>
						))}
				</ul>
			</div>
		</OuterBlock>
	)
})
