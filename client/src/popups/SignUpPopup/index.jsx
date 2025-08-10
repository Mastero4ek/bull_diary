import React, { useCallback } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PopupDescLayout } from '@/components/layouts/PopupLayout/PopupDescLayout'
import { PopupFormLayout } from '@/components/layouts/PopupLayout/PopupFormLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { ErrorForm } from '@/components/ui/general/ErrorForm'
import { RootInput } from '@/components/ui/inputs/RootInput'
import { signUp } from '@/redux/slices/candidateSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import { SignInPopup } from '../SignInPopup'
import { SuccessSignUpPopup } from '../SuccessSignUpPopup'
import styles from './styles.module.scss'

export const SignUpPopup = React.memo(() => {
	const { t } = useTranslation()
	const dispatch = useDispatch()

	const { closePopup, openPopup } = usePopup()
	const { errorMessage, errorArray } = useSelector(state => state.candidate)
	const { showError, showSuccess } = useNotification()

	const {
		reset,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm()

	const handleSignIn = useCallback(() => {
		closePopup()

		setTimeout(() => {
			openPopup(<SignInPopup />)
		}, 150)
	}, [])

	const submit = async data => {
		try {
			const { name, email, password, confirm_password, agreement } = data
			const resultAction = await dispatch(
				signUp({ name, email, password, confirm_password, agreement })
			)
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				reset()
				closePopup()

				setTimeout(() => {
					openPopup(<SuccessSignUpPopup />, { shared: true })
				}, 150)
				showSuccess(t('popup.signup.success'))
			} else {
				showError(t('popup.signup.error'))
			}
		} catch (e) {
			showError(t('popup.signup.error'))
			console.log(e)
		}
	}

	return (
		<>
			<PopupFormLayout
				socials={true}
				title={t('popup.signup.title')}
				subtitle={t('popup.signup.subtitle')}
			>
				<form
					className={styles.signup_form_wrapper}
					onSubmit={handleSubmit(data => submit(data))}
				>
					<RootInput
						name='name'
						label={t('form.label.name')}
						errorMessage={t('form.error.name')}
						errorArray={errorArray}
						errors={errors}
						type='text'
						register={register('name', { required: true })}
					/>

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

					<RootInput
						name='confirm_password'
						label={t('form.label.confirm_password')}
						errorMessage={t('form.error.confirm_password')}
						errorArray={errorArray}
						errors={errors}
						type='text'
						register={{
							...register('confirm_password', {
								required: true,
							}),
						}}
					/>

					<RootInput
						name='agreement'
						label={
							<>
								{t('popup.signup.agreement')}
								<Link to={'/privacy'} onClick={() => closePopup()}>
									{t('popup.signup.privacy_statement')}
								</Link>
							</>
						}
						errorMessage={t('form.error.agreement')}
						errorArray={errorArray}
						errors={errors}
						type='checkbox'
						register={{
							...register('agreement', {
								required: true,
							}),
						}}
					/>

					<div className={styles.signup_form_btn}>
						<RootButton
							type={'submit'}
							text={t('button.sign_up')}
							icon='sign-up'
						/>
					</div>

					<ErrorForm error={errorMessage} bottom={60} />
				</form>
			</PopupFormLayout>

			<PopupDescLayout
				title={t('popup.signup.title_signin')}
				text={t('popup.signup.subtitle_signin')}
			>
				<RootButton
					onClickBtn={handleSignIn}
					text={t('button.sign_in')}
					icon='sign-in'
				/>
			</PopupDescLayout>
		</>
	)
})
