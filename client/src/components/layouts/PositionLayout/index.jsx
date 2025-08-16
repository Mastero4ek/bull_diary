import React, { useMemo } from 'react';

import moment from 'moment/min/moment-with-locales';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { SharedButton } from '@/components/ui/buttons/SharedButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { InnerBlock } from '@/components/ui/general/InnerBlock';
import { Mark } from '@/components/ui/general/Mark';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { H2 } from '@/components/ui/titles/H2';
import {
  capitalize,
  colorizedNum,
} from '@/helpers/functions';
import { useFormatDuration } from '@/hooks/FormatDuration';
import { SharedPositionPopup } from '@/popups/SharedPositionPopup';

import styles from './styles.module.scss';

export const PositionLayout = React.memo(() => {
	const { t } = useTranslation()
	const { amount, color, mark } = useSelector(state => state.settings)
	const position = useLocation()?.state?.item
	const formatDuration = useFormatDuration()

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
				name: `${t('page.position.open_fee')} (USDT)`,
				value: position?.open_fee,
			},
			{
				id: 5,
				name: `${t('page.position.closed_fee')} (USDT)`,
				value: position?.closed_fee,
			},
			{
				id: 6,
				name: `${t('page.position.pnl')} (USDT)`,
				value: position?.pnl,
			},
			{
				id: 7,
				name: `${t('page.position.roi')} (%)`,
				value: position?.roi,
			},
			{
				id: 8,
				name: t('page.position.duration_time'),
				value: formatDuration(position?.open_time, position?.closed_time),
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
		[t, position, formatDuration]
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
							positionFields.map(item => (
								<li key={item?.id}>
									<RootDesc>
										<span>{item?.name}</span>
									</RootDesc>

									<RootDesc>
										{item?.value === position?.direction ? (
											<>
												{mark && (
													<Mark
														color={item?.value === 'long' ? 'green' : 'red'}
													/>
												)}

												<span>
													{capitalize(
														item?.value === 'long'
															? t('table.buy')
															: t('table.sell')
													)}
												</span>
											</>
										) : item?.value === position?.pnl ||
										  item?.value === position?.roi ? (
											<>
												<span
													style={{
														color: `var(--${
															color ? colorizedNum(item?.value, true) : 'text'
														})`,
													}}
												>
													{amount
														? '****'
														: item?.value === 0
														? '0.0000'
														: item?.value > 0
														? `+${item?.value}`
														: item?.value}
												</span>
											</>
										) : item?.value === position?.open_fee ||
										  item?.value === position?.closed_fee ? (
											<>
												<span
													style={{
														color: `var(--${
															color ? colorizedNum(item?.value, false) : 'text'
														})`,
													}}
												>
													{amount
														? '****'
														: item?.value > 0
														? `-${item?.value}`
														: item?.value}
												</span>
											</>
										) : item?.value === position?.quality ? (
											<span>{amount ? '****' : item?.value}</span>
										) : item?.value === position?.margin ? (
											<span>{amount ? '****' : item?.value}</span>
										) : item?.value === position?.open_time ||
										  item?.value === position?.closed_time ? (
											<span>
												{moment(item?.value).format('DD MMMM YYYY - HH:mm:ss')}
											</span>
										) : item?.value === position?.duration_time ? (
											<span>{item?.value}</span>
										) : item?.value === position?.leverage ? (
											<span>{item?.value}X</span>
										) : (
											<span>{item?.value}</span>
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
