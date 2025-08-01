import './tabs.scss';

import React, { useCallback } from 'react';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { ClosedContent } from '@/components/ui/general/ClosedContent';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { setExchange } from '@/redux/slices/filtersSlice';

const exchangesList = [
	{
		checked_id: 0,
		name: 'Bybit',
	},
	{
		checked_id: 1,
		name: 'Mexc',
	},
	{
		checked_id: 2,
		name: 'Okx',
	},
]

export const Exchange = React.memo(() => {
	const { exchange } = useSelector(state => state.filters)
	const dispatch = useDispatch()

	const handleChangeTab = useCallback(
		e => {
			const tabName = e.target.value.toLowerCase()

			dispatch(
				setExchange({
					checked_id: +e.target.id.slice(-1),
					name: tabName,
				})
			)
		},
		[dispatch, exchange]
	)

	return (
		<div className={'tabs_wrapper'}>
			<OuterBlock>
				<div className={'tabs'}>
					{exchangesList.map(tab => (
						<React.Fragment key={tab.checked_id}>
							<input
								onChange={handleChangeTab}
								type='radio'
								name='tabs'
								value={tab.name}
								id={`tab-${tab.checked_id}`}
								checked={tab.checked_id === exchange.checked_id ? true : false}
							/>

							<label
								htmlFor={`tab-${tab.checked_id}`}
								className={`tabs-control-${tab.checked_id}`}
								style={
									tab.name === 'Mexc' || tab.name === 'Okx'
										? { pointerEvents: 'none' }
										: {}
								}
							>
								<RootDesc>
									<b>{tab.name}</b>
								</RootDesc>

								{(tab.name === 'Mexc' || tab.name === 'Okx') && (
									<ClosedContent width={30} />
								)}
							</label>
						</React.Fragment>
					))}

					<div className='tabs-control-color'></div>
				</div>
			</OuterBlock>
		</div>
	)
})
