import React, { useMemo } from 'react'

import moment from 'moment'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { SharedButton } from '@/components/ui/buttons/SharedButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { Mark } from '@/components/ui/general/Mark'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { H2 } from '@/components/ui/titles/H2'
import { capitalize } from '@/helpers/functions'
import { SharedPositionPopup } from '@/popups/SharedPositionPopup'

import styles from './styles.module.scss'

export const PositionLayout = React.memo(() => {
	const { amount, color, mark } = useSelector(state => state.settings)
	const position = useLocation()?.state?.item

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
		<OuterBlock>
			<div className={styles.position_wrapper}>
				<InnerBlock>
					<div className={styles.position_chart}></div>
				</InnerBlock>

				<div className={styles.position_fields}>
					<div className={styles.position_fields_head}>
						<H2>
							<span>{position?.symbol}</span>
						</H2>

						<SharedButton popup={<SharedPositionPopup />} />
					</div>

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
										) : field?.name === 'Quality' ||
										  field?.name === 'Margin' ? (
											<span>{amount ? '****' : field?.value}</span>
										) : field?.name.includes('Time') ? (
											<span>
												{moment(field?.value).format('DD MMMM YYYY - HH:mm:ss')}
											</span>
										) : (
											<span>{field?.value}</span>
										)}
									</RootDesc>
								</li>
							))}
					</ul>
				</div>
			</div>
		</OuterBlock>
	)
})
