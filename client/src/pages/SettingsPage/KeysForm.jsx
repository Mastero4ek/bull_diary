import React, { useCallback } from 'react'

import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc'
import { ClosedContent } from '@/components/ui/general/ClosedContent'
import { Icon } from '@/components/ui/general/Icon'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { updateKeys } from '@/redux/slices/candidateSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import styles from './styles.module.scss'

export const KeysForm = ({ exchange }) => {
	const { user } = useSelector(state => state.candidate)
	const dispatch = useDispatch()
	const { showSuccess, showError } = useNotification()
	const { t } = useTranslation()

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
					showSuccess(t('page.settings.keys_removed_successfully'))
				} else {
					showError(t('page.settings.keys_error_removing'))
				}
			} catch (e) {
				showError(t('page.settings.keys_error_removing'))
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
					showSuccess(t('page.settings.keys_updated_successfully'))
				} else {
					showError(t('page.settings.keys_error_updating'))
				}
			} catch (e) {
				showError(t('page.settings.keys_error_updating'))
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
						text={t('button.save')}
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
								<p>{t('form.error.api_key')}</p>
							</SmallDesc>
						</div>
					)}

					<input
						disabled={exchange.name === 'mexc' || exchange.name === 'okx'}
						placeholder={
							exchange.api === '' ? t('form.placeholder.api_key') : exchange.api
						}
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
								<p>{t('form.error.secret_key')}</p>
							</SmallDesc>
						</div>
					)}

					<input
						disabled={exchange.name === 'mexc' || exchange.name === 'okx'}
						placeholder={
							exchange.secret === ''
								? t('form.placeholder.secret_key')
								: exchange.secret
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
