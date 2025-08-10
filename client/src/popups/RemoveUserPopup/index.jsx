import React, { useCallback, useEffect } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PopupDescLayout } from '@/components/layouts/PopupLayout/PopupDescLayout'
import { PopupFormLayout } from '@/components/layouts/PopupLayout/PopupFormLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc'
import { ErrorForm } from '@/components/ui/general/ErrorForm'
import { Icon } from '@/components/ui/general/Icon'
import { Loader } from '@/components/ui/general/Loader'
import {
	removeUser as removeUserCandidate,
	setChangeUser as setChangeUserCandidate,
} from '@/redux/slices/candidateSlice'
import {
	getUsers,
	removeUser as removeUserUsers,
	setChangeUser as setChangeUserUsers,
} from '@/redux/slices/usersSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import styles from './styles.module.scss'

export const RemoveUserPopup = React.memo(({ item }) => {
	const { t } = useTranslation()
	const { closePopup } = usePopup()
	const location = useLocation()
	const navigate = useNavigate()
	const isAdminContext = location.pathname.includes('/all-users')

	const { errorMessage, errorArray, serverStatus, isAuth } = useSelector(
		state => (isAdminContext ? state.users : state.candidate)
	)
	const currentUser = useSelector(state => state.candidate.user)
	const { sort, search, page, limit } = useSelector(state => state.users)
	const { date } = useSelector(state => state.filters)
	const dispatch = useDispatch()
	const { showSuccess, showError } = useNotification()

	const {
		reset,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm()

	const submit = async data => {
		try {
			const resultAction1 = await dispatch(
				isAdminContext
					? removeUserUsers({
							current_email: item.email,
							fill_email: data.email,
							userId: item.id,
					  })
					: removeUserCandidate({
							current_email: item.email,
							fill_email: data.email,
							userId: item.id,
					  })
			)
			const originalPromiseResult1 = unwrapResult(resultAction1)

			let originalPromiseResult2 = true

			if (isAdminContext) {
				const resultAction2 = await dispatch(
					getUsers({
						sort,
						search,
						page,
						limit,
						start_time: date.start_date,
						end_time: date.end_date,
					})
				)
				originalPromiseResult2 = unwrapResult(resultAction2)
			}

			if (
				originalPromiseResult1 &&
				(isAdminContext ? originalPromiseResult2 : true)
			) {
				showSuccess(
					isAdminContext
						? t('popup.remove_user.admin_success')
						: t('popup.remove_user.user_success')
				)
				reset()
				closePopup()

				if (location.pathname.match(/\/all-users\/[^\/]+$/)) {
					navigate(-1)
				}
			} else {
				showError(
					isAdminContext
						? t('popup.remove_user.admin_error')
						: t('popup.remove_user.user_error')
				)
			}
		} catch (rejectedValueOrSerializedError) {
			showError(
				isAdminContext
					? t('popup.remove_user.admin_error')
					: t('popup.remove_user.user_error')
			)
		}
	}

	const findErrorField = useCallback(
		field => {
			if (errorArray) {
				return errorArray.find(item => item.field === field)
			} else return false
		},
		[errorArray]
	)

	useEffect(() => {
		if (!isAdminContext && !isAuth) {
			dispatch(
				isAdminContext ? setChangeUserUsers(item) : setChangeUserCandidate(item)
			)

			closePopup()
		}
	}, [isAuth, dispatch, isAdminContext, item, closePopup])

	return (
		<>
			<PopupDescLayout
				title={`${t('popup.remove_user.title')} ${
					isAdminContext ? currentUser?.name : item?.name
				}!`}
				text={
					isAdminContext ? (
						<span
							dangerouslySetInnerHTML={{
								__html: t('popup.remove_user.admin_subtitle'),
							}}
						></span>
					) : (
						<span
							dangerouslySetInnerHTML={{
								__html: t('popup.remove_user.user_subtitle'),
							}}
						></span>
					)
				}
			/>

			<PopupFormLayout>
				<form
					className={styles.remove_form_wrapper}
					onSubmit={handleSubmit(data => submit(data))}
				>
					<label
						htmlFor='email'
						className={`${styles.remove_form_label} ${
							(errors.email || findErrorField('email')) && styles.error
						}`}
					>
						<div className={styles.remove_form_control}>
							<RootDesc>
								<span>
									{isAdminContext
										? t('form.label.user_email')
										: t('form.label.account_email')}
								</span>
							</RootDesc>

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
							value={isAdminContext ? item?.email || '' : ''}
							readOnly={isAdminContext}
							{...register('email', {
								required: true,
								pattern:
									/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
							})}
						/>
					</label>

					<RootDesc>
						<span>
							{isAdminContext
								? t('popup.remove_user.admin_description')
								: t('popup.remove_user.user_description')}
						</span>
					</RootDesc>

					<RootButton
						type={'submit'}
						text={
							isAdminContext
								? t('button.admin_yes_remove')
								: t('button.user_yes_remove')
						}
						disabled={serverStatus === 'loading' ? true : false}
					/>

					<ErrorForm error={errorMessage} bottom={85} />

					{serverStatus === 'loading' && <Loader logo={false} />}
				</form>
			</PopupFormLayout>
		</>
	)
})
