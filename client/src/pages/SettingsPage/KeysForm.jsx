import React, { useCallback } from 'react';

import { useForm } from 'react-hook-form';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  useNotification,
} from '@/components/layouts/NotificationLayout/NotificationProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { ClosedContent } from '@/components/ui/general/ClosedContent';
import { Icon } from '@/components/ui/general/Icon';
import { InnerBlock } from '@/components/ui/general/InnerBlock';
import { updateKeys } from '@/redux/slices/candidateSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const KeysForm = ({ exchange }) => {
	const { user } = useSelector(state => state.candidate)
	const dispatch = useDispatch()
	const { showSuccess, showError } = useNotification()

	const {
		reset,
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm()

	const handleClickRemove = useCallback(
		async exchange => {
			try {
				const resultAction = await dispatch(
					updateKeys({
						exchange: exchange.name.toLowerCase(),
						api: '',
						secret: '',
					})
				)

				const originalPromiseResult = unwrapResult(resultAction)

				if (originalPromiseResult) {
					showSuccess('Key removed successfully!')
				} else {
					showError('Error removing key! Please try again.')
				}
			} catch (e) {
				showError('Error removing key! Please try again.')
				console.log(e)
			}
		},
		[dispatch, showError, showSuccess]
	)

	const submit = useCallback(
		async data => {
			try {
				const api = data[`${exchange.name.toLowerCase()}_api`]
				const secret = data[`${exchange.name.toLowerCase()}_secret`]

				const resultAction = await dispatch(
					updateKeys({
						exchange: exchange.name.toLowerCase(),
						api,
						secret,
					})
				)

				const originalPromiseResult = unwrapResult(resultAction)

				if (originalPromiseResult) {
					showSuccess('Keys updated successfully!')
				} else {
					showError('Error updating keys! Please try again.')
				}
			} catch (e) {
				showError('Error updating keys! Please try again.')
				console.log(e)
			}

			reset()
		},
		[dispatch, showError, showSuccess, reset, exchange.name]
	)

	const currentExchangeName = exchange.name.toLowerCase()
	const apiValue = watch(`${currentExchangeName}_api`, '')
	const secretValue = watch(`${currentExchangeName}_secret`, '')
	const exchangeObj = user?.keys.find(key => key.name === exchange.name)

	return (
		<div className={styles.keys_item_content}>
			<div className={styles.keys_item_controls}>
				<InnerBlock>
					<div className={styles.keys_item_logo}>
						<Icon id={`${exchange?.name.toLowerCase()}-logo`} />
					</div>
				</InnerBlock>

				<div className={styles.keys_inputs_btns}>
					<RootButton
						onClickBtn={
							exchange.name === 'mexc' || exchange.name === 'okx'
								? undefined
								: () => handleClickRemove(exchange)
						}
						disabled={
							exchangeObj &&
							(exchangeObj?.api === '' || exchangeObj?.secret === '')
						}
						icon='remove'
					/>

					<RootButton
						onClickBtn={
							exchange.name === 'mexc' || exchange.name === 'okx'
								? undefined
								: handleSubmit(submit)
						}
						text={'Save'}
						icon='update'
						disabled={apiValue === '' || secretValue === ''}
					/>
				</div>
			</div>

			<form>
				{(exchange.name === 'mexc' || exchange.name === 'okx') && (
					<ClosedContent width={20} />
				)}

				<label
					htmlFor={`${currentExchangeName}_api`}
					className={`${styles.keys_form_label} ${
						errors[`${currentExchangeName}_api`] && styles.error
					}`}
				>
					{errors[`${currentExchangeName}_api`] && (
						<div className={styles.keys_form_control}>
							<Icon id={'error-icon'} />

							<SmallDesc>
								<p>Api-key is required.</p>
							</SmallDesc>
						</div>
					)}

					<input
						disabled={exchange.name === 'mexc' || exchange.name === 'okx'}
						placeholder={exchange.api === '' ? 'Your api key' : exchange.api}
						{...register(`${currentExchangeName}_api`, { required: true })}
					/>
				</label>

				<label
					htmlFor={`${currentExchangeName}_secret`}
					className={`${styles.keys_form_label} ${
						errors[`${currentExchangeName}_secret`] && styles.error
					}`}
				>
					{errors[`${currentExchangeName}_secret`] && (
						<div className={styles.keys_form_control}>
							<Icon id={'error-icon'} />

							<SmallDesc>
								<p>Secret-key is required.</p>
							</SmallDesc>
						</div>
					)}

					<input
						disabled={exchange.name === 'mexc' || exchange.name === 'okx'}
						placeholder={
							exchange.secret === '' ? 'Your secret key' : exchange.secret
						}
						{...register(`${currentExchangeName}_secret`, {
							required: true,
						})}
					/>
				</label>
			</form>
		</div>
	)
}
