import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  useNotification,
} from '@/components/layouts/NotificationLayout/NotificationProvider';
import { Loader } from '@/components/ui/general/Loader';
import { checkAuth } from '@/redux/slices/candidateSlice';
import { unwrapResult } from '@reduxjs/toolkit';

export const AuthCallback = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { t } = useTranslation()
	const { showSuccess, showError } = useNotification()
	const { isAuth, user, serverStatus } = useSelector(state => state.candidate)

	useEffect(() => {
		const handleAuthCheck = async () => {
			try {
				const resultAction = await dispatch(checkAuth())
				const result = unwrapResult(resultAction)

				if (result?.user) {
					showSuccess(t('auth.oauth.success'))
					navigate('/wallet')
				}
				// else {
				// 	showError(t('auth.oauth.activation_required'))
				// 	navigate('/home')
				// }
			} catch (error) {
				if (process.env.NODE_ENV === 'dev') {
					console.error('OAuth callback error:', error)
				}
				showError(t('auth.oauth.error'))
				navigate('/home')
			}
		}

		handleAuthCheck()
	}, [dispatch, navigate, showSuccess, showError, t])

	if (serverStatus === 'loading') {
		return <Loader />
	}

	return <Loader />
}
