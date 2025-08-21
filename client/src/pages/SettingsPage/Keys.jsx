import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import moment from 'moment/min/moment-with-locales';
import {
  Controller,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  useNotification,
} from '@/components/layouts/NotificationLayout/NotificationProvider';
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider';
import { ControlButton } from '@/components/ui/buttons/ControlButton';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { Icon } from '@/components/ui/general/Icon';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { RootInput } from '@/components/ui/inputs/RootInput';
import { RootSelect } from '@/components/ui/inputs/RootSelect';
import { H2 } from '@/components/ui/titles/H2';
import { ConfirmPopup } from '@/popups/ConfirmPopup';
import { updateKeys } from '@/redux/slices/candidateSlice';
import {
  clearSyncProgress,
  getSyncProgress,
  syncData,
} from '@/redux/slices/syncSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const Keys = React.memo(({ handleClickRadio }) => {
	const { syncProgress, syncStatus, syncMessage } = useSelector(
		state => state.sync
	)
	const { user, errorArray } = useSelector(state => state.candidate)
	const { openPopup } = usePopup()

	const dispatch = useDispatch()
	const { showSuccess, showError } = useNotification()
	const { t } = useTranslation()

	const [selectedExchange, setSelectedExchange] = useState(null)

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		control,
		watch,
		formState: { errors, isValid },
	} = useForm({ mode: 'onChange' })

	const watchedExchange = watch('exchange')

	const hasNoSelectedExchange = !selectedExchange
	const hasNoApiKey = !selectedExchange?.api || selectedExchange.api === ''
	const hasNoSecretKey =
		!selectedExchange?.secret || selectedExchange.secret === ''
	const hasNoKeys = hasNoSelectedExchange || hasNoApiKey || hasNoSecretKey
	const hasKeys =
		selectedExchange &&
		selectedExchange.api &&
		selectedExchange.secret &&
		selectedExchange.api !== '' &&
		selectedExchange.secret !== ''

	const EXCHANGE_OPTIONS = [
		{
			name: (
				<>
					<Icon id='bybit-logo' /> (Bybit)
				</>
			),
			value: 'bybit',
		},
		{
			name: (
				<>
					<Icon id='mexc-logo' /> (Mexc)
				</>
			),
			value: 'mexc',
		},
		{
			name: (
				<>
					<Icon id='okx-logo' /> (OKX)
				</>
			),
			value: 'okx',
		},
	]

	const removeKeys = useCallback(
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
			}
		},
		[dispatch, showError, showSuccess]
	)

	const handleClickRemove = () => {
		if (!selectedExchange) return

		openPopup(
			<ConfirmPopup
				subtitle={t('popup.confirm.keys_remove_subtitle')}
				onClickConfirm={() => removeKeys(selectedExchange)}
			/>,
			{ shared: true }
		)
	}

	const submit = useCallback(
		async data => {
			if (!selectedExchange) {
				showError(t('page.settings.keys_error_no_exchange'))

				return
			}

			try {
				const api = data['api-key']
				const secret = data['secret-key']

				const resultAction = await dispatch(
					updateKeys({
						exchange: selectedExchange.name.toLowerCase(),
						api,
						secret,
					})
				)

				const originalPromiseResult = unwrapResult(resultAction)

				if (originalPromiseResult) {
					showSuccess(t('page.settings.keys_updated_successfully'))

					// Clear any existing progress before starting
					dispatch(clearSyncProgress())

					// Initial progress fetch
					await dispatch(getSyncProgress())

					const endDate = moment().toISOString()
					const startDate = moment().startOf('year').toISOString()

					// Start progress polling with error handling
					const progressInterval = setInterval(async () => {
						try {
							await dispatch(getSyncProgress())
						} catch (error) {
							console.error('Error fetching sync progress:', error)
							// Continue polling even if there's an error
						}
					}, 250)

					// Small delay to ensure UI updates before starting sync
					await new Promise(resolve => setTimeout(resolve, 100))

					try {
						const resultActionSync = await dispatch(
							syncData({
								exchange: selectedExchange.name.toLowerCase(),
								start_time: startDate,
								end_time: endDate,
							})
						)

						clearInterval(progressInterval)

						const originalPromiseResultSync = unwrapResult(resultActionSync)

						if (originalPromiseResultSync) {
							setTimeout(() => {
								showSuccess(t('page.settings.keys_success_synchronization'))
							}, 500) // Increased delay to ensure progress bar reaches 100%
						} else {
							console.error('Sync failed - no result')
							showError(t('page.settings.keys_error_synchronization'))
						}
					} catch (error) {
						console.error('Sync error:', error)
						clearInterval(progressInterval)
						showError(t('page.settings.keys_error_synchronization'))
					} finally {
						// Clear progress after a longer delay to ensure user sees completion
						setTimeout(() => {
							dispatch(clearSyncProgress())
						}, 2000)
					}
				} else {
					showError(t('page.settings.keys_error_updating'))
				}
			} catch (e) {
				console.error('Keys update error:', e)
				showError(t('page.settings.keys_error_updating'))
			}
		},
		[dispatch, showError, showSuccess, reset, t, selectedExchange]
	)

	useEffect(() => {
		if (watchedExchange && user?.keys) {
			const exchangeKey = watchedExchange.toLowerCase()
			const exchangeData = user.keys.find(
				key => key.name.toLowerCase() === exchangeKey
			)

			if (exchangeData) {
				setSelectedExchange(exchangeData)

				if (
					!exchangeData.api ||
					!exchangeData.secret ||
					exchangeData.api === '' ||
					exchangeData.secret === ''
				) {
					setValue('api-key', exchangeData.api || '')
					setValue('secret-key', exchangeData.secret || '')
				} else {
					setValue('api-key', '')
					setValue('secret-key', '')
				}
			}
		}
	}, [watchedExchange, user?.keys, setValue])

	return (
		<OuterBlock>
			<div className={styles.keys_wrapper}>
				<input
					id='keys_accordion'
					type='radio'
					name='accordion'
					className={styles.keys_radio}
					onChange={handleClickRadio}
				/>

				<label htmlFor='keys_accordion' className={styles.keys_header}>
					<H2>
						<span>{t('page.settings.keys_api_title')}</span>
					</H2>

					<ControlButton text={<i></i>} />
				</label>

				<form className={styles.keys_form} onSubmit={handleSubmit(submit)}>
					<div className={styles.keys_warning}>
						<SmallDesc>
							<Icon id='warning-icon' />

							<span
								dangerouslySetInnerHTML={{
									__html: t('page.settings.keys_warning'),
								}}
								style={{ color: 'var(--orange)' }}
							></span>
						</SmallDesc>
					</div>

					<label htmlFor='exchange' className={styles.keys_label}>
						<div className={styles.keys_control}>
							<RootDesc>
								<span>{t('form.label.exchange')}</span>
							</RootDesc>

							<Controller
								name='exchange'
								control={control}
								rules={{ required: true }}
								render={({ field, fieldState }) => (
									<RootSelect
										arrow={!fieldState.error}
										className={`${styles.keys_select} ${
											fieldState.error ? styles.error : ''
										}`}
										options={EXCHANGE_OPTIONS}
										value={field.value}
										onChange={field.onChange}
										getLabel={item => item.name}
										getValue={item => item.value}
										disabled={syncStatus === 'loading'}
									>
										{fieldState.error && (
											<>
												<SmallDesc>
													<p>{t('form.error.exchange')}</p>
												</SmallDesc>

												<Icon id='error-icon' />
											</>
										)}
									</RootSelect>
								)}
							/>
						</div>
					</label>

					<RootInput
						label={t('form.label.api_key')}
						name={`api-key`}
						errorMessage={t('form.error.api_key')}
						errorArray={errorArray}
						errors={errors}
						type='text'
						register={register(`api-key`, { required: hasNoKeys })}
						placeholder={hasKeys ? selectedExchange?.api || '' : ''}
						value={hasKeys ? '' : undefined}
						disabled={syncStatus === 'loading'}
					/>

					<RootInput
						label={t('form.label.secret_key')}
						name={`secret-key`}
						errorMessage={t('form.error.secret_key')}
						errors={errors}
						errorArray={errorArray}
						type='text'
						register={register(`secret-key`, {
							required: hasNoKeys,
						})}
						placeholder={hasKeys ? selectedExchange?.secret || '' : ''}
						value={hasKeys ? '' : undefined}
						disabled={syncStatus === 'loading'}
					/>

					<RootInput
						name='agreement-key'
						errorMessage={t('form.error.agreement_key')}
						errorArray={errorArray}
						errors={errors}
						type='checkbox'
						label={
							<span style={{ opacity: '0.75' }}>
								{t('form.label.agreement_key')}
							</span>
						}
						register={{
							...register('agreement-key', {
								required: hasNoKeys,
							}),
						}}
						disabled={syncStatus === 'loading' || !hasNoKeys}
					/>

					{syncStatus === 'loading' && (
						<div className={styles.sync_progress}>
							<div className={styles.sync_progress_header}>
								<SmallDesc>
									<b>{syncMessage || t('page.settings.keys_synchronizing')}</b>
								</SmallDesc>

								<SmallDesc>
									<b>{Math.round(syncProgress || 0)}%</b>
								</SmallDesc>
							</div>

							<div className={styles.sync_progress_bar}>
								<div
									className={styles.sync_progress_fill}
									style={{
										width: `${Math.max(0, Math.min(100, syncProgress || 0))}%`,
										transition: 'width 0.3s ease-in-out',
									}}
								/>
							</div>
						</div>
					)}

					<div className={styles.keys_inputs_btns}>
						<RootButton
							disabled={hasNoKeys || syncStatus === 'loading'}
							text={t('button.remove')}
							icon='remove'
							onClickBtn={() =>
								hasNoKeys || syncStatus === 'loading'
									? undefined
									: handleClickRemove()
							}
						/>

						<RootButton
							disabled={hasKeys || syncStatus === 'loading'}
							text={t('button.save')}
							icon='update'
							type='submit'
						/>
					</div>
				</form>
			</div>
		</OuterBlock>
	)
})
