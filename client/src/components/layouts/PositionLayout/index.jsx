import React, { useMemo } from 'react'

import moment from 'moment/min/moment-with-locales'
import { useTranslation } from 'react-i18next'
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
	const { t } = useTranslation()
	const { amount, color, mark } = useSelector(state => state.settings)
	const position = useLocation()?.state?.item

	const positionFields = useMemo(
		() => [
			{
				id: 0,
				name: t('page.position.direction'),
				value: position?.direction,
			},
			{
				id: 1,
				name: t('page.position.leverage'),
				value: position?.leverage,
			},
			{
				id: 2,
				name: t('page.position.qty'),
				value: position?.quality,
			},
			{
				id: 3,
				name: t('page.position.margin'),
				value: position?.margin,
			},
			{
				id: 4,
				name: t('page.position.open_fee'),
				value: position?.open_fee,
			},
			{
				id: 5,
				name: t('page.position.closed_fee'),
				value: position?.closed_fee,
			},
			{
				id: 6,
				name: t('page.position.pnl'),
				value: position?.pnl,
			},
			{
				id: 7,
				name: t('page.position.roi'),
				value: position?.roi,
			},
			{
				id: 8,
				name: t('page.position.duration_time'),
				value: position?.closed_time - position?.open_time, // TODO: сделать правильный расчет
			},
			{
				id: 9,
				name: t('page.position.open_time'),
				value: position?.open_time,
			},
			{
				id: 10,
				name: t('page.position.closed_time'),
				value: position?.closed_time,
			},
		],
		[t]
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
										{field?.name === t('page.position.direction') ? (
											<>
												{mark && (
													<Mark
														color={field?.value === 'long' ? 'green' : 'red'}
													/>
												)}

												<span>{capitalize(field?.value)}</span>
											</>
										) : field?.name === t('page.position.pnl') ||
										  field?.name === t('page.position.roi') ? (
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
												<span>
													{field?.name === t('page.position.pnl')
														? 'USDT'
														: '%'}
												</span>
											</>
										) : field?.name === t('page.position.qty') ? (
											<span>{amount ? '****' : field?.value}</span>
										) : field?.name === t('page.position.margin') ? (
											<span>{amount ? '****' : field?.value} USDT</span>
										) : field?.name === t('page.position.open_time') ||
										  field?.name === t('page.position.closed_time') ? (
											<span>
												{moment(field?.value).format('DD MMMM YYYY - HH:mm:ss')}
											</span>
										) : field?.name === t('page.position.duration_time') ? (
											<span>{moment(field?.value).format('HH:mm:ss')}</span> //  TODO: 3D 5H 32M 12S
										) : field?.name === t('page.position.leverage') ? (
											<span>{field?.value}X</span>
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
