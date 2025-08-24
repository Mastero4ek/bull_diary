import React from 'react'

import { useTranslation } from 'react-i18next'

import { PopupDescLayout } from '@/components/layouts/PopupLayout/PopupDescLayout'
import { PopupFormLayout } from '@/components/layouts/PopupLayout/PopupFormLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { RootButton } from '@/components/ui/buttons/RootButton'

import styles from './styles.module.scss'

export const ConfirmPopup = React.memo(props => {
	const { subtitle, onClickConfirm } = props
	const { t } = useTranslation()
	const { closePopup } = usePopup()

	const handleClickConfirm = async () => {
		try {
			await onClickConfirm()
			closePopup()
		} catch (e) {
			console.log(e)
		}
	}

	return (
		<>
			<PopupDescLayout
				title={
					<span
						dangerouslySetInnerHTML={{
							__html: t('popup.confirm.title'),
						}}
					/>
				}
				text={
					<span
						dangerouslySetInnerHTML={{
							__html: subtitle,
						}}
					></span>
				}
			/>

			<PopupFormLayout>
				<div className={styles.confirm_btn}>
					<RootButton
						text={t('button.confirm')}
						onClickBtn={() => handleClickConfirm()}
					/>
				</div>
			</PopupFormLayout>
		</>
	)
})
