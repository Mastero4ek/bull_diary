import React, { useCallback } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PopupDescLayout } from '@/components/layouts/PopupLayout/PopupDescLayout'
import { PopupFormLayout } from '@/components/layouts/PopupLayout/PopupFormLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { ErrorForm } from '@/components/ui/general/ErrorForm'
import { RootInput } from '@/components/ui/inputs/RootInput'
import { signIn } from '@/redux/slices/candidateSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import { ForgotPopup } from '../ForgotPopup'
import { SignUpPopup } from '../SignUpPopup'
import styles from './styles.module.scss'

export const SignInPopup = React.memo(() => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { closePopup, openPopup } = usePopup()
	const { showError, showSuccess } = useNotification()
	const { errorMessage, errorArray } = useSelector(state => state.candidate)

	const {
		reset,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm()

	const handleSignUp = useCallback(() => {
		closePopup()

		setTimeout(() => {
			openPopup(<SignUpPopup />)
		}, 150)
	}, [])

	const handleClickForgot = useCallback(() => {
		closePopup()

		setTimeout(() => {
			openPopup(<ForgotPopup />, { shared: true })
		}, 150)
	}, [])

	const submit = async data => {
		try {
			const { email, password } = data

			const resultAction = await dispatch(signIn({ email, password }))
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				reset()
				navigate('/wallet')
				closePopup()
				showSuccess(t('popup.signin.success'))
			} else {
				showError(t('popup.signin.error'))
			}
		} catch (e) {
			showError(t('popup.signin.error'))
			console.log(e)
		}
	}

	return (
		<>
			<PopupDescLayout
				title={t('popup.signin.title_signup')}
				text={t('popup.signin.subtitle_signup')}
			>
				<RootButton
					onClickBtn={handleSignUp}
					text={t('button.sign_up')}
					icon='sign-up'
				/>
			</PopupDescLayout>

			<PopupFormLayout
				title={t('popup.signin.title')}
				socials={true}
				subtitle={t('popup.signin.subtitle')}
			>
				<form
					className={styles.signin_form_wrapper}
					onSubmit={handleSubmit(data => submit(data))}
				>
					<RootInput
						name='email'
						label={t('form.label.email')}
						errorMessage={t('form.error.email')}
						errorArray={errorArray}
						errors={errors}
						type='email'
						register={{
							...register('email', {
								required: true,
								pattern:
									/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
							}),
						}}
					/>

					<RootInput
						name='password'
						label={t('form.label.password')}
						errorMessage={t('form.error.password')}
						errorArray={errorArray}
						errors={errors}
						type='text'
						register={{
							...register('password', {
								required: true,
							}),
						}}
					/>

					<RootDesc>
						<b onClick={handleClickForgot}>{t('popup.signin.forgot')}</b>
					</RootDesc>

					<RootButton
						type={'submit'}
						onClickBtn={() => console.log('')}
						text={t('button.sign_in')}
						icon='sign-in'
					/>

					<ErrorForm error={errorMessage} bottom={60} />
				</form>
			</PopupFormLayout>
		</>
	)
})
