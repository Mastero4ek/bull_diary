import React from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { RootSelect } from '@/components/ui/inputs/RootSelect'
import { setLimit, setRemoveBtn } from '@/redux/slices/filtersSlice'

import styles from './styles.module.scss'

const ENTRIES_OPTIONS = [3, 5, 10, 25, 50].map(num => ({
	name: `${num} entries`,
	value: num,
}))

export const Entries = React.memo(() => {
	const dispatch = useDispatch()
	const { limit } = useSelector(state => state.filters)

	return (
		<div className={styles.entries}>
			<RootSelect
				options={ENTRIES_OPTIONS}
				value={limit}
				onChange={val => {
					dispatch(setLimit(val))
					dispatch(setRemoveBtn(false))
				}}
				iconId='entries'
				placeholder='Entries'
				getLabel={item => item.name}
				getValue={item => item.value}
			/>
		</div>
	)
})
