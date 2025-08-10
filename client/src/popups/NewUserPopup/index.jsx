import './phone_input.scss'

import React, { useCallback, useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import PhoneInput from 'react-phone-input-2'
import ru from 'react-phone-input-2/lang/ru.json'
import { useDispatch, useSelector } from 'react-redux'

import coverDefault from '@/assets/images/general/default_tournament.png'
import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PopupDescLayout } from '@/components/layouts/PopupLayout/PopupDescLayout'
import { PopupFormLayout } from '@/components/layouts/PopupLayout/PopupFormLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { Icon } from '@/components/ui/general/Icon'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { RootSelect } from '@/components/ui/inputs/RootSelect'
import { createUser } from '@/redux/slices/candidateSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import styles from './styles.module.scss'

export const NewUserPopup = () => {
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		control,
		formState: { errors },
	} = useForm()

	const { showSuccess, showError } = useNotification()
	const { errorArray } = useSelector(state => state.candidate)
	const [cover, setCover] = useState(null)
	const { closePopup } = usePopup()
	const dispatch = useDispatch()

	const ROLE_OPTIONS = [
		{ name: 'Admin', value: 'admin' },
		{ name: 'User', value: 'user' },
	]

	const handleCoverChange = e => {
		const file = e.target.files[0]

		if (file) {
			setCover(file)
			setValue('cover', file)
		}
	}

	const handleRemoveCover = () => {
		setCover(null)
		setValue('cover', null)
	}

	const submit = async data => {
		try {
			const fullData = {
				name: data.name,
				last_name: data.last_name,
				email: data.email,
				password: data.password,
				cover,
				phone: data.phone,
				role: data.role,
			}

			const resultAction = await dispatch(createUser({ data: fullData }))
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				reset()
				setCover(null)

				closePopup()
				showSuccess('User created successfully!')
			} else {
				showError('Error creating user! Please try again.')
			}
		} catch (e) {
			console.log('User creation error:', e)

			if (e?.payload?.message) {
				showError(e.payload.message)
			} else {
				showError('Error creating user! Please try again.')
			}
		}
	}

	const findErrorField = useCallback(field => {
		if (errorArray) {
			return errorArray.find(item => item.field === field)
		} else return false
	}, [])

	return (
		<>
			<PopupDescLayout title={'New User'}>
				<label
					htmlFor='name'
					className={`${styles.user_form_label} ${
						(errors.name || findErrorField('name')) && styles.error
					}`}
				>
					<div className={styles.user_form_control}>
						<RootDesc>
							<span>Name</span>
						</RootDesc>

						{(errors.name || findErrorField('name')) && (
							<Icon id={'error-icon'} />
						)}
					</div>

					<input {...register('name', { required: true })} />
				</label>

				<label htmlFor='last_name' className={`${styles.user_form_label}`}>
					<div className={styles.user_form_control}>
						<RootDesc>
							<span>Last Name</span>
						</RootDesc>
					</div>

					<input type='text' {...register('last_name')} />
				</label>

				<label htmlFor='cover' className={`${styles.user_form_label}`}>
					<div className={styles.user_form_control}>
						<div className={styles.user_photo}>
							<InnerBlock>
								<img
									style={{ opacity: cover ? 1 : 0.5 }}
									src={cover ? URL.createObjectURL(cover) : coverDefault}
									alt='cover'
								/>

								<label>
									<input
										type='file'
										accept='image/*'
										onChange={handleCoverChange}
										style={{ display: 'none' }}
									/>
									<Icon id='change-photo' />
								</label>
							</InnerBlock>

							<RootButton
								disabled={!cover}
								onClickBtn={handleRemoveCover}
								icon='cancel'
								text='Remove cover'
							/>
						</div>
					</div>
				</label>
			</PopupDescLayout>

			<PopupFormLayout>
				<form
					className={styles.user_form_wrapper}
					onSubmit={handleSubmit(data => submit(data))}
				>
					<label
						htmlFor='email'
						className={`${styles.user_form_label} ${
							(errors.email || findErrorField('email')) && styles.error
						}`}
					>
						<div className={styles.user_form_control}>
							<RootDesc>
								<span>Email</span>
							</RootDesc>

							{(errors.email || findErrorField('email')) && (
								<Icon id={'error-icon'} />
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

					<label
						htmlFor='password'
						className={`${styles.user_form_label} ${
							(errors.password || findErrorField('password')) && styles.error
						}`}
					>
						<div className={styles.user_form_control}>
							<RootDesc>
								<span>Password</span>
							</RootDesc>

							{(errors.password || findErrorField('password')) && (
								<Icon id={'error-icon'} />
							)}
						</div>

						<input {...register('password', { required: true })} />
					</label>

					<label htmlFor='phone' className={styles.user_form_label}>
						<div className={styles.user_form_control}>
							<RootDesc>
								<span>Phone</span>
							</RootDesc>
						</div>

						<Controller
							name='phone'
							control={control}
							render={({ field, fieldState }) => (
								<PhoneInput
									localization={ru}
									disableSearchIcon={true}
									disableDropdown={true}
									enableSearch={true}
									value={field.value ? field.value.toString() : ''}
									onChange={field.onChange}
									inputProps={{
										name: 'phone',
									}}
								/>
							)}
						/>
					</label>

					<div className={styles.user_form_label}>
						<div className={styles.user_form_control}>
							<RootDesc>
								<span>Role</span>
							</RootDesc>
						</div>

						<Controller
							name='role'
							control={control}
							rules={{ required: true }}
							render={({ field, fieldState }) => (
								<RootSelect
									arrow={true}
									className={`${styles.user_form_select} ${
										fieldState.error ? styles.error : ''
									}`}
									options={ROLE_OPTIONS}
									value={field.value}
									onChange={field.onChange}
									getLabel={item => item.name}
									getValue={item => item.value}
								>
									{(errors.role || findErrorField('role')) && (
										<Icon id={'error-icon'} />
									)}
								</RootSelect>
							)}
						/>
					</div>

					<RootButton type='submit' text='Create User' icon='join' />
				</form>
			</PopupFormLayout>
		</>
	)
}
