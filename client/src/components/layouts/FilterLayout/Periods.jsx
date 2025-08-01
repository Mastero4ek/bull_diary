import React, { useCallback, useEffect } from 'react'

import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { setDate, setFilter, setRemoveBtn } from '@/redux/slices/filtersSlice'

import styles from './styles.module.scss'

const periods = [
	{ name: 'Week', id: 0 },
	{ name: 'Month', id: 1 },
	{ name: 'Quarter', id: 2 },
	{ name: 'Year', id: 3 },
]

const getStartDate = filterId => {
	switch (filterId) {
		case 0:
			return moment().startOf('isoWeek').toISOString()
		case 1:
			return moment().startOf('month').toISOString()
		case 2:
			return moment().startOf('quarter').toISOString()
		case 3:
			return moment().startOf('year').toISOString()
		default:
			return null
	}
}

export const Periods = React.memo(() => {
	const dispatch = useDispatch()
	const { id } = useSelector(state => state.filters.filter)

	const changeDate = useCallback(
		filterId => {
			const start_date = getStartDate(filterId)

			if (start_date !== null) {
				dispatch(
					setDate({
						start_date,
						end_date: new Date().toISOString(),
					})
				)
			}
		},
		[dispatch, id]
	)

	const onChangeFilter = useCallback(
		filter => {
			dispatch(setFilter(filter))
			dispatch(setRemoveBtn(false))
			changeDate(filter.id)
		},
		[dispatch, id]
	)

	useEffect(() => {
		changeDate(id)
	}, [id])

	return (
		<ul className={styles.periods}>
			{periods &&
				periods.length > 0 &&
				periods.map(item => {
					const ItemBlock = item?.id === id ? InnerBlock : OuterBlock

					return (
						<li key={item?.id}>
							<ItemBlock>
								<div
									onClick={() => onChangeFilter(item)}
									className={styles.periods_item}
									style={
										item?.id === id
											? { pointerEvents: 'none', color: 'var(--primaryDef)' }
											: {}
									}
								>
									<RootDesc>
										<span>{item?.name}</span>
									</RootDesc>
								</div>
							</ItemBlock>
						</li>
					)
				})}
		</ul>
	)
})
