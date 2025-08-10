import './phone_input.scss'

import React, { useCallback, useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import PhoneInput from 'react-phone-input-2'
import ru from 'react-phone-input-2/lang/ru.json'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'

import avatarDefault from '@/assets/images/general/default_avatar.png'
import { useNotification } from '@/components/layouts/NotificationLayout'
import { PageLayout } from '@/components/layouts/PageLayout'
import { DescLayout } from '@/components/layouts/PageLayout/DescLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc'
import { Icon } from '@/components/ui/general/Icon'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { AvatarUserPopup } from '@/popups/AvatarUserPopup'
import { RemoveUserPopup } from '@/popups/RemoveUserPopup'
import {
	editUser as editUserCandidate,
	getUser as getUserCandidate,
	removeCover as removeCoverCandidate,
	setChangeUser as setChangeUserCandidate,
	setPhone as setPhoneCandidate,
} from '@/redux/slices/candidateSlice'
import {
	editUser as editUserUsers,
	getUser as getUserUsers,
	removeCover as removeCoverUsers,
	setChangeUser as setChangeUserUsers,
	setPhone as setPhoneUsers,
} from '@/redux/slices/usersSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import { Level } from './Level'
import styles from './styles.module.scss'

export const ProfilePage = React.memo(() => {
	const { t } = useTranslation()
	const [popup, setPopup] = useState(false)
	const [password, setPassword] = useState('')
	const [photoFile, setPhotoFile] = useState(null)
	const { openPopup } = usePopup()
	const { showSuccess, showError } = useNotification()

	const location = useLocation()
	const params = useParams()
	const isAdminContext = location.pathname.includes('/all-users')
	const editUser = isAdminContext ? editUserUsers : editUserCandidate
	const getUser = isAdminContext ? getUserUsers : getUserCandidate
	const removeCover = isAdminContext ? removeCoverUsers : removeCoverCandidate
	const setChangeUser = isAdminContext
		? setChangeUserUsers
		: setChangeUserCandidate
	const setPhone = isAdminContext ? setPhoneUsers : setPhoneCandidate
	const { user, changeUser, serverStatus } = useSelector(state =>
		isAdminContext ? state.users : state.candidate
	)

	const dispatch = useDispatch()

	const hasChanges = useCallback(() => {
		if (!user || !changeUser) return false

		const userForComparison = {
			...user,
			phone: user.phone?.toString() || '',
		}

		const changeUserForComparison = {
			...changeUser,
			phone: changeUser.phone?.toString() || '',
		}

		const hasFieldChanges =
			JSON.stringify(userForComparison) !==
			JSON.stringify(changeUserForComparison)
		const hasPhotoChanges = !!photoFile
		const hasPasswordChanges = password !== ''

		return hasFieldChanges || hasPhotoChanges || hasPasswordChanges
	}, [user, changeUser, photoFile, password])

	const {
		reset,
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm()

	const submit = useCallback(
		async data => {
			try {
				if (!editUser) {
					showError(t('page.profile.edit_user_action_not_available'))
					return
				}

				const { name, last_name, email, password, phone, cover } = data
				const coverFile = photoFile || cover

				const resultAction = await dispatch(
					editUser({
						name,
						last_name,
						email,
						password,
						phone,
						cover: coverFile,
						userId: isAdminContext ? params.id : null,
					})
				)
				const originalPromiseResult = unwrapResult(resultAction)

				if (originalPromiseResult) {
					showSuccess(t('page.profile.updated_successfully'))
					setPassword('')
					setPhotoFile(null)

					if (isAdminContext && params.id && getUser) {
						dispatch(getUser(params.id))
					} else if (!isAdminContext && user?.id && getUser) {
						dispatch(getUser(user.id))
					}
				} else {
					showError(t('page.profile.error_updating'))
				}
			} catch (e) {
				showError(t('page.profile.error_updating'))
			}
		},
		[
			dispatch,
			photoFile,
			showSuccess,
			showError,
			editUser,
			isAdminContext,
			params.id,
			user?.id,
			getUser,
			t,
		]
	)

	const handleChangeField = useCallback(
		(e, field) => {
			if (setChangeUser && changeUser) {
				dispatch(setChangeUser({ ...changeUser, [field]: e.target.value }))
			}
		},
		[dispatch, setChangeUser, changeUser]
	)

	const handleClickRemove = useCallback(() => {
		openPopup(<RemoveUserPopup item={changeUser} />, { shared: true })
	}, [openPopup, changeUser])

	const handleClickChangePhoto = useCallback(() => {
		openPopup(<AvatarUserPopup setPhotoFile={setPhotoFile} />, { shared: true })
	}, [openPopup, setPhotoFile])

	const handleRemoveCover = useCallback(async () => {
		try {
			if (photoFile) {
				setValue('cover', null)
				setPhotoFile(null)
				showSuccess(t('page.profile.cover_removed_successfully'))
			} else if (changeUser?.cover && removeCover) {
				const lastSlashIndex = changeUser.cover.lastIndexOf('/')
				const filename = changeUser.cover.substring(lastSlashIndex + 1)
				const resultAction = await dispatch(
					removeCover({
						filename,
						userId: isAdminContext ? params.id : null,
					})
				)
				const originalPromiseResult = unwrapResult(resultAction)

				if (originalPromiseResult) {
					showSuccess(t('page.profile.cover_removed_successfully'))
					setValue('cover', null)

					if (isAdminContext && params.id && getUser) {
						dispatch(getUser(params.id))
					} else if (!isAdminContext && user?.id && getUser) {
						dispatch(getUser(user.id))
					}
				} else {
					showError(t('page.profile.error_removing_cover'))
				}
			}
		} catch (e) {
			showError(t('page.profile.error_removing_cover'))
		}
	}, [
		dispatch,
		photoFile,
		changeUser,
		setValue,
		showSuccess,
		showError,
		removeCover,
		isAdminContext,
		params.id,
		user?.id,
		getUser,
		t,
	])

	useEffect(() => {
		if (photoFile) {
			setValue('cover', photoFile)
		}

		return () => {
			if (photoFile && typeof photoFile === 'object') {
				URL.revokeObjectURL(photoFile)
			}
		}
	}, [photoFile, setValue])

	const imageSrc =
		photoFile && typeof photoFile === 'object'
			? URL.createObjectURL(photoFile)
			: changeUser?.cover || avatarDefault

	useEffect(() => {
		if (changeUser && Object.keys(changeUser).length > 0) {
			reset(changeUser)
		}
	}, [changeUser, reset])

	useEffect(() => {
		const popupElement = document.getElementById('popup')

		popupElement ? setPopup(true) : setPopup(false)

		return () => {
			if (user && setChangeUser) {
				dispatch(setChangeUser(user))
			}
		}
	}, [openPopup, user, dispatch, setChangeUser])

	useEffect(() => {
		if (isAdminContext && params.id && getUser) {
			dispatch(getUser(params.id))
		} else if (!isAdminContext && user?.id && getUser) {
			dispatch(getUser(user.id))
		}
	}, [dispatch, isAdminContext, params.id, user?.id, getUser])

	return (
		<PageLayout
			chartWidth={600}
			filter={isAdminContext ? true : false}
			entries={true}
			periods={true}
			disabled={true}
		>
			<div style={{ marginBottom: 'auto' }}>
				<OuterBlock>
					<div className={styles.profile_wrapper}>
						<div className={styles.profile_wrap}>
							<div className={styles.profile_photo}>
								<InnerBlock>
									<img
										style={{
											opacity: changeUser?.cover || photoFile ? 1 : 0.75,
										}}
										src={imageSrc}
										alt='avatar'
									/>

									<div onClick={handleClickChangePhoto}>
										<Icon id={'change-photo'} />
									</div>
								</InnerBlock>

								<div className={styles.profile_photo_buttons}>
									<RootButton
										onClickBtn={handleRemoveCover}
										icon={photoFile ? 'cancel' : 'cross'}
										disabled={
											serverStatus === 'loading' ||
											!(changeUser?.cover || photoFile)
										}
									/>

									<RootButton
										type={'submit'}
										onClickBtn={handleSubmit(data => submit(data))}
										text={t('button.save')}
										icon='save-changes'
										disabled={
											serverStatus === 'loading' ||
											!changeUser ||
											!user ||
											!hasChanges()
										}
									/>
								</div>
							</div>

							<form className={styles.profile_info}>
								<input
									type='hidden'
									{...register('cover', {
										value: photoFile || changeUser?.cover || '',
									})}
								/>

								<label
									htmlFor='name'
									className={`${styles.profile_form_label} ${
										errors.name && styles.error
									}`}
								>
									<div className={styles.profile_form_control}>
										{errors.name && (
											<>
												<Icon id={'error-icon'} />

												<SmallDesc>
													<p>{t('form.error.name')}</p>
												</SmallDesc>
											</>
										)}
									</div>

									<input
										placeholder={t('form.placeholder.name')}
										{...register('name', {
											required: true,
											value: changeUser?.name || '',
											onChange: e => handleChangeField(e, 'name'),
										})}
									/>
								</label>

								<label
									htmlFor='last_name'
									className={`${styles.profile_form_label} ${
										errors.last_name && styles.error
									}`}
								>
									<input
										placeholder={t('form.placeholder.last_name')}
										{...register('last_name', {
											value: changeUser?.last_name || '',
											onChange: e => handleChangeField(e, 'last_name'),
										})}
									/>
								</label>

								<label htmlFor='phone' className={styles.profile_form_label}>
									<PhoneInput
										localization={ru}
										disableSearchIcon={true}
										disableDropdown={true}
										enableSearch={true}
										value={
											changeUser?.phone ? changeUser?.phone.toString() : ''
										}
										onChange={number => {
											if (setPhone && changeUser) {
												dispatch(setPhone(number))
												dispatch(
													setChangeUser({ ...changeUser, phone: number })
												)
											}
										}}
										inputProps={{
											name: 'phone',
											required: true,
										}}
									/>
								</label>

								<label
									htmlFor='password'
									className={`${styles.profile_form_label} ${
										errors.password && styles.error
									} ${
										changeUser && !changeUser?.change_password && styles.warning
									}`}
								>
									<div className={styles.profile_form_control}>
										{errors.password && (
											<>
												<Icon id={'error-icon'} />

												<SmallDesc>
													<p>{t('form.error.password')}</p>
												</SmallDesc>
											</>
										)}

										{changeUser && !changeUser?.change_password && (
											<>
												<Icon id={'warning-icon'} />

												<SmallDesc>
													<p>
														{isAdminContext
															? t('form.warning.create_user_password')
															: t('form.warning.create_password')}
													</p>
												</SmallDesc>
											</>
										)}
									</div>

									<input
										placeholder={t('form.placeholder.password')}
										{...register('password', {
											value: password || '',
											onChange: e => setPassword(e.target.value),
										})}
									/>
								</label>

								{(isAdminContext || user?.role === 'admin') &&
								changeUser?.source === 'self' ? (
									<label
										htmlFor='email'
										className={`${styles.profile_form_label} ${
											errors.email && styles.error
										}`}
									>
										<div className={styles.profile_form_control}>
											{errors.email && (
												<>
													<Icon id={'error-icon'} />

													<SmallDesc>
														<p>{t('form.error.email')}</p>
													</SmallDesc>
												</>
											)}
										</div>

										<input
											placeholder={t('form.placeholder.email')}
											{...register('email', {
												required: true,
												pattern:
													/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
												value: changeUser?.email || '',
												onChange: e => handleChangeField(e, 'email'),
											})}
										/>
									</label>
								) : (
									<>
										<label className={styles.profile_form_label}>
											<div className={styles.profile_form_fake_input}>
												<RootDesc>
													<span>{changeUser?.email || ''}</span>
												</RootDesc>
											</div>
										</label>

										<input
											type='hidden'
											{...register('email', {
												value: changeUser?.email || '',
											})}
										/>
									</>
								)}
							</form>
						</div>

						<Level />
					</div>
				</OuterBlock>
			</div>

			<OuterBlock>
				<DescLayout
					icon={'profile'}
					title={
						<span
							dangerouslySetInnerHTML={{
								__html: t('page.profile.title'),
							}}
						></span>
					}
					description={
						<span
							dangerouslySetInnerHTML={{
								__html: t('page.profile.subtitle'),
							}}
						></span>
					}
				>
					<div className={styles.removeBtn}>
						<RootButton
							onClickBtn={handleClickRemove}
							text={t('button.remove')}
							icon={'remove'}
						/>
					</div>
				</DescLayout>
			</OuterBlock>
		</PageLayout>
	)
})
