import React from 'react'

import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { RootSelect } from '@/components/ui/inputs/RootSelect'
import { setLimit, setRemoveBtn } from '@/redux/slices/filtersSlice'

import styles from './styles.module.scss'

export const Entries = React.memo(() => {
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const { limit } = useSelector(state => state.filters)

	const ENTRIES_OPTIONS = [5, 10, 25, 50].map(num => ({
		name: `${num} ${t('filter.entries.item')}`,
		value: num,
	}))

	return (
		<div className={styles.entries}>
			<RootSelect
				iconId='entries'
				placeholder={t('filter.entries.placeholder')}
				getLabel={item => item.name}
				getValue={item => item.value}
				dropdownClassName={styles.entries_list}
				options={ENTRIES_OPTIONS}
				value={limit}
				onChange={val => {
					dispatch(setLimit(val))
					dispatch(setRemoveBtn(false))
				}}
			/>
		</div>
	)
})
