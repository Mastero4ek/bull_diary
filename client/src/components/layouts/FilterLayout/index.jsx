import React from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { setSearch } from '@/redux/slices/filtersSlice'

import { Buttons } from './Buttons'
import { Calendar } from './Calendar'
import { Entries } from './Entries'
import { Periods } from './Periods'
import { Search } from './Search'
import styles from './styles.module.scss'
import { Total } from './Total'

export const FilterLayout = React.memo(props => {
	const {
		periods,
		entries,
		calendar,
		search,
		searchOptions,
		onChange,
		total,
		update,
		disabled,
		minDate,
		placeholder,
		searchPlaceholder,
	} = props
	const { search: searchValue } = useSelector(state => state.filters)
	const dispatch = useDispatch()

	const handleSetSearch = value => {
		dispatch(setSearch(value))
	}

	const handleSearchChange = onChange || handleSetSearch

	return (
		<div
			className={
				disabled
					? `${styles.filter_wrapper} ${styles.filter_wrapper_dis}`
					: styles.filter_wrapper
			}
		>
			{periods && <Periods />}

			{total && <Total />}

			{calendar && <Calendar minDate={minDate} />}

			{search && (
				<Search
					inputSearch={searchValue}
					onChange={handleSearchChange}
					options={searchOptions || []}
					placeholder={placeholder}
					searchPlaceholder={searchPlaceholder}
				/>
			)}

			{entries && <Entries />}

			<Buttons onClickUpdate={update} />
		</div>
	)
})
