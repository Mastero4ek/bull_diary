import React, { useState } from 'react'

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
		total,
		update,
		disabled,
		minDate,
	} = props
	const [inputSearch, setInputSearch] = useState('')

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
				<Search inputSearch={inputSearch} setInputSearch={setInputSearch} />
			)}

			{entries && <Entries />}

			<Buttons onClickUpdate={update} setInputSearch={setInputSearch} />
		</div>
	)
})
