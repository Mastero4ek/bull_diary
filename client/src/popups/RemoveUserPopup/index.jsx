import React, {
  useCallback,
  useEffect,
} from 'react';

import { useForm } from 'react-hook-form';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  useNotification,
} from '@/components/layouts/NotificationLayout/NotificationProvider';
import {
  PopupDescLayout,
} from '@/components/layouts/PopupLayout/PopupDescLayout';
import {
  PopupFormLayout,
} from '@/components/layouts/PopupLayout/PopupFormLayout';
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { ErrorForm } from '@/components/ui/general/ErrorForm';
import { Icon } from '@/components/ui/general/Icon';
import { Loader } from '@/components/ui/general/Loader';
import {
  removeUser as removeUserCandidate,
  setChangeUser as setChangeUserCandidate,
} from '@/redux/slices/candidateSlice';
import {
  getUsers,
  removeUser as removeUserUsers,
  setChangeUser as setChangeUserUsers,
} from '@/redux/slices/usersSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const RemoveUserPopup = React.memo(({ item }) => {
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
						? 'User removed successfully!'
						: 'Account removed successfully!'
				)
				reset()
				closePopup()

				if (location.pathname.match(/\/all-users\/[^\/]+$/)) {
					navigate(-1)
				}
			} else {
				showError(
					isAdminContext
						? 'User not removed! Please try again.'
						: 'Account not removed! Please try again.'
				)
			}
		} catch (rejectedValueOrSerializedError) {
			showError(
				isAdminContext
					? 'Error removing user! Please try again.'
					: 'Error removing account! Please try again.'
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
				title={`Dear ${
					isAdminContext ? currentUser?.name : item?.name || 'User'
				}!`}
				text={
					<>
						{isAdminContext
							? 'Are you sure you want to delete this user account?'
							: 'Enter the email to which this account is registered to delete your account!'}
						<br />
						Once the account is deleted, there is no going back.
					</>
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
								<span>{isAdminContext ? 'User Email' : 'Account Email'}</span>
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
							value={isAdminContext ? item?.email || '' : ''}
							readOnly={isAdminContext}
							placeholder={isAdminContext ? '' : 'Enter your email'}
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
								? 'Do you really want to delete this user account PERMANENTLY?'
								: 'Do you really want to delete this account PERMANENTLY?'}
						</span>
					</RootDesc>

					<RootButton
						type={'submit'}
						onClickBtn={() => {}}
						text={isAdminContext ? 'Yes, DELETE USER!' : 'Yes, REMOVE!'}
						disabled={serverStatus === 'loading' ? true : false}
					/>

					<ErrorForm error={errorMessage} bottom={85} />

					{serverStatus === 'loading' && <Loader logo={false} />}
				</form>
			</PopupFormLayout>
		</>
	)
})
