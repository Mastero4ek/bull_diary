import { useSelector } from 'react-redux'
import { capitalize } from '@/helpers/functions'
import React, { createRef, useMemo } from 'react'
import moment from 'moment'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { H2 } from '@/components/ui/titles/H2'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { Mark } from '@/components/ui/general/Mark'
import { SharedPopupLayout } from '@/components/layouts/SharedPopupLayout'

import goodImage from '@/assets/images/general/good-position.svg'
import badImage from '@/assets/images/general/bad-position.svg'

import styles from './styles.module.scss'
import { useLocation } from 'react-router-dom'

export const SharedPositionPopup = React.memo(() => {
	const { amount, color, mark } = useSelector(state => state.settings)
	const position = useLocation()?.state?.item

	const ref = React.forwardRef(null)

	const positionFields = useMemo(
		() => [
			{
				id: 0,
				name: 'Direction',
				value: position?.direction,
			},
			{
				id: 1,
				name: 'Leverage',
				value: position?.leverage,
			},
			{
				id: 2,
				name: 'Quality',
				value: position?.quality,
			},
			{
				id: 3,
				name: 'Margin',
				value: position?.margin,
			},
			{
				id: 4,
				name: 'Pnl',
				value: position?.pnl,
			},
			{
				id: 5,
				name: 'Roe',
				value: position?.roe,
			},
			{
				id: 6,
				name: 'Open Time',
				value: position?.open_time,
			},
			{
				id: 7,
				name: 'Closed Time',
				value: position?.closed_time,
			},
		],
		[]
	)

	return (
		<SharedPopupLayout
			ref={ref}
			popup_id={'position-info'}
			popup_name={'position'}
		>
			<div className={styles.position_chart}>
				<OuterBlock>
					<img src={!position?.pnl >= 0 ? goodImage : badImage} alt='score' />
				</OuterBlock>
			</div>

			<div className={styles.position_list}>
				<H2>{position?.symbol}</H2>

				<ul>
					{positionFields &&
						positionFields.length > 0 &&
						positionFields.map(field => (
							<li key={field?.id}>
								<RootDesc>
									<span>{field?.name}</span>
								</RootDesc>

								<RootDesc>
									{field?.name === 'Direction' ? (
										<>
											{mark && (
												<Mark
													color={field?.value === 'long' ? 'green' : 'red'}
												/>
											)}

											<span>{capitalize(field?.value)}</span>
										</>
									) : field?.name === 'Pnl' || field?.name === 'Roe' ? (
										<>
											<span
												style={
													color
														? {
																color: `var(--${
																	field?.value < 0 ? 'red' : 'green'
																})`,
														  }
														: {}
												}
											>
												{amount ? '****' : field?.value}
											</span>{' '}
											<span>{field?.name === 'Pnl' ? 'USDT' : '%'}</span>
										</>
									) : field?.name === 'Quality' || field?.name === 'Margin' ? (
										<span>{amount ? '****' : field?.value}</span>
									) : field?.name.includes('Time') ? (
										<span>
											{moment(field?.value).format('DD/MM/YYYY - HH:mm:ss')}
										</span>
									) : (
										<span>{field?.value}</span>
									)}
								</RootDesc>
							</li>
						))}
				</ul>
			</div>
		</SharedPopupLayout>
	)
})
