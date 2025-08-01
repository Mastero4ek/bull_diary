import React, { useCallback } from 'react'

import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'

import { RootButton } from '@/components/ui/buttons/RootButton'
import {
	setDate,
	setFilter,
	setLimit,
	setRemoveBtn,
	setSearch,
} from '@/redux/slices/filtersSlice'

import styles from './styles.module.scss'

export const Buttons = React.memo(({ onClickUpdate, setInputSearch }) => {
	const { remove_btn } = useSelector(state => state.filters)

	const dispatch = useDispatch()

	const handleClickRemove = useCallback(() => {
		dispatch(setLimit(5))

		dispatch(
			setFilter({
				name: 'week',
				id: 0,
			})
		)

		dispatch(
			setDate({
				start_date: moment().startOf('isoWeek').toISOString(),
				end_date: new Date().toISOString(),
			})
		)

		dispatch(setRemoveBtn(true))

		dispatch(setSearch(''))
		setInputSearch('')
	}, [dispatch])

	return (
		<div className={styles.filter_buttons}>
			<RootButton
				onClickBtn={handleClickRemove}
				disabled={remove_btn}
				icon='remove'
			/>

			<RootButton onClickBtn={onClickUpdate} icon='update' />
		</div>
	)
})
