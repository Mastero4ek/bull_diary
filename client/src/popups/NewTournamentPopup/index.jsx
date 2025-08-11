import './calendar.scss'

import React, { useState } from 'react'

import moment from 'moment'
import DatePicker from 'react-date-picker'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import coverDefault from '@/assets/images/general/default_tournament.png'
import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PopupDescLayout } from '@/components/layouts/PopupLayout/PopupDescLayout'
import { PopupFormLayout } from '@/components/layouts/PopupLayout/PopupFormLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc'
import { Icon } from '@/components/ui/general/Icon'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { RootInput } from '@/components/ui/inputs/RootInput'
import { RootSelect } from '@/components/ui/inputs/RootSelect'
import { createTournament } from '@/redux/slices/tournamentSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import styles from './styles.module.scss'

export const NewTournamentPopup = () => {
	const { t } = useTranslation()
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		control,
		formState: { errors },
	} = useForm()
	const { language } = useSelector(state => state.settings)
	const { showSuccess, showError } = useNotification()
	const initialNextMonth = moment().add(1, 'month')
	const initialStartDate = initialNextMonth.clone().startOf('month').toDate()
	const initialEndDate = initialNextMonth.clone().endOf('month').toDate()

	const [registrationDate, setRegistrationDate] = useState(initialStartDate)
	const [startDate, setStartDate] = useState(initialStartDate)
	const [endDate, setEndDate] = useState(initialEndDate)
	const [cover, setCover] = useState(null)

	const { closePopup } = usePopup()

	const dispatch = useDispatch()

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
				description: data.description,
				exchange: data.exchange,
				cover,
				start_date: startDate.toISOString(),
				end_date: endDate.toISOString(),
				registration_date: registrationDate.toISOString(),
			}

			const resultAction = await dispatch(createTournament({ data: fullData }))
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				reset()
				setCover(null)
				setStartDate(initialStartDate)
				setEndDate(initialEndDate)
				setRegistrationDate(initialStartDate)

				closePopup()
				showSuccess(t('popup.new_battle.create_success'))
			} else {
				showError(t('popup.new_battle.create_error'))
			}
		} catch (e) {
			console.log(e)
			if (e?.payload?.message) {
				showError(e.payload.message)
			} else {
				showError(t('popup.new_battle.create_error'))
			}
		}
	}

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

	return (
		<>
			<PopupDescLayout title={t('popup.new_battle.title')}>
				<label htmlFor='exchange' className={styles.tournament_form_label}>
					<div className={styles.tournament_form_control}>
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
									className={`${styles.tournament_form_select} ${
										fieldState.error ? styles.error : ''
									}`}
									options={EXCHANGE_OPTIONS}
									value={field.value}
									onChange={field.onChange}
									getLabel={item => item.name}
									getValue={item => item.value}
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

				<label htmlFor='cover' className={`${styles.tournament_form_label}`}>
					<div className={styles.tournament_form_control}>
						<RootDesc>
							<span>{t('form.label.cover')}</span>
						</RootDesc>

						<div className={styles.tournament_photo}>
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
								text={t('button.remove_cover')}
							/>
						</div>
					</div>
				</label>
			</PopupDescLayout>

			<PopupFormLayout>
				<form
					className={styles.tournament_form_wrapper}
					onSubmit={handleSubmit(data => submit(data))}
				>
					<RootInput
						name='name'
						label={t('form.label.battle_name')}
						errorMessage={t('form.error.battle_name')}
						errors={errors}
						type='text'
						register={register('name', { required: true })}
					/>

					<RootInput
						name='description'
						label={t('form.label.description')}
						type='textarea'
						register={register('description')}
					/>

					<label
						htmlFor='registrationDate'
						className={styles.tournament_form_label}
					>
						<div className={styles.tournament_form_control}>
							<RootDesc>
								<span>{t('form.label.registr_date')}</span>
							</RootDesc>

							<div className={styles.calendar_wrapper}>
								<DatePicker
									value={registrationDate}
									locale={language === 'ru' ? 'ru-RU' : 'en-EN'}
									calendarIcon={<Icon id='calendar' />}
									onChange={date => {
										setRegistrationDate(date)
										setValue('registrationDate', date ? date.toISOString() : '')
									}}
								/>
							</div>
						</div>
					</label>

					<label htmlFor='startDate' className={styles.tournament_form_label}>
						<div className={styles.tournament_form_control}>
							<RootDesc>
								<span>{t('form.label.start_date')}</span>
							</RootDesc>

							<div className={styles.calendar_wrapper}>
								<DatePicker
									value={startDate}
									locale={language === 'ru' ? 'ru-RU' : 'en-EN'}
									calendarIcon={<Icon id='calendar' />}
									onChange={date => {
										setStartDate(date)
										setValue('startDate', date ? date.toISOString() : '')
									}}
								/>
							</div>
						</div>
					</label>

					<label htmlFor='endDate' className={styles.tournament_form_label}>
						<div className={styles.tournament_form_control}>
							<RootDesc>
								<span>{t('form.label.start_date')}</span>
							</RootDesc>

							<div className={styles.calendar_wrapper}>
								<DatePicker
									value={endDate}
									locale={language === 'ru' ? 'ru-RU' : 'en-EN'}
									calendarIcon={<Icon id='calendar' />}
									onChange={date => {
										setEndDate(date)
										setValue('endDate', date ? date.toISOString() : '')
									}}
								/>
							</div>
						</div>
					</label>

					<RootButton
						type='submit'
						text={t('button.create_battle')}
						icon='join'
					/>
				</form>
			</PopupFormLayout>
		</>
	)
}
