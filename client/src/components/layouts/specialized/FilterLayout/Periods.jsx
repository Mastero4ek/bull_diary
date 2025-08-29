import React, { useCallback, useEffect } from 'react'

import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'

import { InnerBlock } from '@/components/layouts/utils/InnerBlock'
import { OuterBlock } from '@/components/layouts/utils/OuterBlock'
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'
import { usePeriods } from '@/hooks/usePeriods'
import { setDate, setFilter, setRemoveBtn } from '@/redux/slices/filtersSlice'

import styles from './styles.module.scss'

export const Periods = React.memo(() => {
	const { PERIODS } = usePeriods()
	const dispatch = useDispatch()
	const { id } = useSelector(state => state.filters.filter)

	const getStartDate = useCallback(filterId => {
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
	}, [])

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
		[dispatch, id, getStartDate]
	)

	const onChangeFilter = useCallback(
		filter => {
			dispatch(setFilter(filter))
			dispatch(setRemoveBtn(false))
			changeDate(filter.id)
		},
		[dispatch, id, changeDate]
	)

	useEffect(() => {
		changeDate(id)
	}, [id])

	return (
		<ul className={styles.periods}>
			{PERIODS &&
				PERIODS.length > 0 &&
				PERIODS.map(item => {
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
