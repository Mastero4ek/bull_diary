import React from 'react'

import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PopupDescLayout } from '@/components/layouts/PopupLayout/PopupDescLayout'
import { PopupFormLayout } from '@/components/layouts/PopupLayout/PopupFormLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc'
import { Icon } from '@/components/ui/general/Icon'
import { setIsAuth } from '@/redux/slices/candidateSlice'

import styles from './styles.module.scss'

export const ForgotPopup = React.memo(() => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { closePopup } = usePopup()
	const { showSuccess, showError } = useNotification()

	const {
		reset,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm()

	const submit = async data => {
		try {
			console.log(data)
			showSuccess(
				'Instruction to reset your password has been sent to your email!'
			)

			reset()
			dispatch(setIsAuth(true))
			navigate('/wallet')
			closePopup()
		} catch (e) {
			showError('Error sending email! Please try again.')
			console.log(e)
		}
	}

	return (
		<>
			<PopupDescLayout
				title={'Dear friend!'}
				text={
					<>
						To change your password, enter the e-mail address specified when
						registering your account. <br /> <br /> We will send instructions
						for resetting your password to this address.
					</>
				}
			/>

			<PopupFormLayout>
				<form
					className={styles.forgot_form_wrapper}
					onSubmit={handleSubmit(data => submit(data))}
				>
					<label
						htmlFor='email'
						className={`${styles.forgot_form_label} ${
							errors.email && styles.error
						}`}
					>
						<div className={styles.forgot_form_control}>
							<RootDesc>
								<span>Email</span>
							</RootDesc>

							{errors.email && (
								<>
									<Icon id={'error-icon'} />

									<SmallDesc>
										<p>Incorrect email.</p>
									</SmallDesc>
								</>
							)}
						</div>

						<input
							{...register('email', {
								required: true,
								pattern:
									/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
							})}
						/>
					</label>

					<RootButton
						type={'submit'}
						onClickBtn={() => console.log('')}
						text={'Send'}
						icon='submit'
					/>
				</form>
			</PopupFormLayout>
		</>
	)
})
