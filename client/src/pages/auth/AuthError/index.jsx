import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useNotification } from '@/components/layouts/specialized/NotificationLayout/NotificationProvider'
import { Loader } from '@/components/ui/feedback/Loader'

export const AuthError = () => {
	const navigate = useNavigate()
	const { t } = useTranslation()
	const { showError } = useNotification()

	useEffect(() => {
		showError(t('auth.oauth.error'))

		const timer = setTimeout(() => {
			navigate('/home')
		}, 3500)

		return () => clearTimeout(timer)
	}, [navigate, showError, t])

	return <Loader />
}
