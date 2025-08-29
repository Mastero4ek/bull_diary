import React, { useCallback } from 'react'

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { usePopup } from '@/components/layouts/popups/PopupLayout/PopupProvider'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { SignInPopup } from '@/popups/auth/SignInPopup'

import { SettingsList } from './SettingsList'
import styles from './styles.module.scss'

export const SettingsWrapper = React.memo(() => {
	const { t } = useTranslation()
	const { openPopup } = usePopup()
	const { isTablet } = useSelector(state => state.settings)

	const handleSignIn = useCallback(() => {
		openPopup(<SignInPopup />, { direction: isTablet ? 'reverse' : '' })
	}, [isTablet, openPopup])

	return (
		<div className={styles.header_settings}>
			<SettingsList />

			<RootButton
				onClickBtn={handleSignIn}
				text={t('button.sign_in')}
				icon='sign-in'
			/>
		</div>
	)
})
