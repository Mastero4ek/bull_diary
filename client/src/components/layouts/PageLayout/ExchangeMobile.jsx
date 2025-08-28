import React, { useCallback } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { RootSelect } from '@/components/ui/inputs/RootSelect'
import { EXCHANGES } from '@/helpers/constants'
import { setExchange } from '@/redux/slices/filtersSlice'

import styles from './styles.module.scss'

export const ExchangeMobile = React.memo(() => {
	const { exchange } = useSelector(state => state.filters)
	const dispatch = useDispatch()

	const exchangeOptions = EXCHANGES.map(exchange => ({
		label: exchange.name,
		value: exchange.name.toLowerCase(),
		checked_id: exchange.checked_id,
		name: exchange.name,
	}))

	const handleChangeTab = useCallback(
		value => {
			const selectedOption = exchangeOptions.find(
				option => option.value === value
			)

			if (selectedOption) {
				dispatch(
					setExchange({
						checked_id: selectedOption.checked_id,
						name: selectedOption.name.toLowerCase(),
					})
				)
			}
		},
		[dispatch, exchangeOptions]
	)

	return (
		<div className={styles.exchange_mobile_wrapper}>
			<RootSelect
				arrow={true}
				options={exchangeOptions}
				value={exchange.name}
				onChange={handleChangeTab}
				placeholder={exchange.name}
				getLabel={option => option.label ?? option}
				getValue={option => option.value ?? option}
				disabled={false}
				search={false}
				className={styles.exchange_mobile_select}
			/>
		</div>
	)
})
