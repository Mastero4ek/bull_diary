import './calendar.scss'

import React, { useCallback } from 'react'

import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'

import { Icon } from '@/components/ui/general/Icon'
import { setDate, setFilter, setRemoveBtn } from '@/redux/slices/filtersSlice'
import DateRangePicker from '@wojtekmaj/react-daterange-picker'

import styles from './styles.module.scss'

export const Calendar = React.memo(({ minDate }) => {
	const dispatch = useDispatch()

	const { language } = useSelector(state => state.settings)
	const { start_date, end_date } = useSelector(state => state.filters.date)

	const onChangeDate = useCallback(
		value => {
			if (value === null) return
			dispatch(setRemoveBtn(false))

			dispatch(
				setDate({
					start_date: value[0].toISOString(),
					end_date: value[1].toISOString(),
				})
			)

			dispatch(
				setFilter({
					name: null,
					id: null,
				})
			)
		},
		[dispatch]
	)

	return (
		<div className={styles.calendar}>
			<DateRangePicker
				selectRange={true}
				maxDate={new Date()}
				minDate={minDate || moment().subtract(2, 'years').toDate()}
				showNeighboringMonth={false}
				locale={language === 'ru' ? 'ru-RU' : 'en-EN'}
				onChange={onChangeDate}
				calendarIcon={<Icon id='calendar' />}
				value={
					start_date && end_date
						? [new Date(start_date), new Date(end_date)]
						: null
				}
			></DateRangePicker>
		</div>
	)
})
