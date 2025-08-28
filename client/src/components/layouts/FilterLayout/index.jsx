import React from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useSliderScroll } from '@/hooks/useSliderScroll'
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
	const { isMobile } = useSelector(state => state.settings)

	const dispatch = useDispatch()

	const { containerRef, handleScrollWithDebounce } = useSliderScroll()

	const handleSetSearch = value => {
		dispatch(setSearch(value))
	}

	const handleSearchChange = onChange || handleSetSearch

	const hasElements =
		periods || total || calendar || search || entries || update

	if (!hasElements) return null

	return (
		<div className={styles.filter_layout}>
			{isMobile && (
				<div
					className={`${styles.filter_mask} ${styles.filter_mask_left} filter_mask_left`}
				></div>
			)}

			<div
				ref={containerRef}
				onScroll={handleScrollWithDebounce}
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

				{typeof update === 'function' && <Buttons onClickUpdate={update} />}
			</div>

			{isMobile && (
				<div
					className={`${styles.filter_mask} ${styles.filter_mask_right} filter_mask_right`}
				></div>
			)}
		</div>
	)
})
