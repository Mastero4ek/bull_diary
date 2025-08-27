import React, { useMemo } from 'react'

import moment from 'moment/min/moment-with-locales'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { ResponsiveBar } from '@nivo/bar'

import styles from './styles.module.scss'

export const BarChart = React.memo(({ syncWarning = '' }) => {
	const { t } = useTranslation()
	const { theme, width, isTablet, isMobile } = useSelector(
		state => state.settings
	)
	const { fakeOrdersByDay, ordersByDay } = useSelector(state => state.positions)
	const { serverStatus } = useSelector(state => state.positions)

	const chartStyles = useMemo(
		() => ({
			paddingSmall:
				width >= 1920
					? 20
					: isTablet
					? 15
					: isMobile
					? 10
					: (width * 1.5) / 100,
			paddingBig:
				width >= 1920
					? 40
					: isTablet
					? 30
					: isMobile
					? 20
					: (width * 2.5) / 100,
			margin:
				width >= 1920 ? 10 : isTablet ? 8 : isMobile ? 6 : (width * 0.5) / 100,
			fontSize:
				width >= 1920 || isTablet ? 16 : isMobile ? 14 : (width * 0.9) / 100,
			font: "'IBM Plex Sans', sans-serif",
			barColorPositive: theme ? '#11958d' : '#28d5ca',
			barColorNegative: theme
				? 'rgba(255, 55, 55, 1)'
				: 'rgba(255, 51, 100, 1)',
			gridColor: theme ? 'rgba(128, 128, 128, 0.2)' : 'rgba(60, 70, 78, 0.2)',
			textColor: theme ? 'rgba(185, 200, 215, 1)' : 'rgba(79, 104, 137, 1)',
		}),
		[width, isTablet, isMobile, theme]
	)

	const getTooltipTitle = day => {
		const now = moment()
		const dayMap = {
			Mon: 0,
			Tue: 1,
			Wed: 2,
			Thu: 3,
			Fri: 4,
			Sat: 5,
			Sun: 6,
		}

		const currentWeek = now.clone().startOf('isoWeek')
		const dayOfWeek = dayMap[day]
		const targetDate = currentWeek.clone().add(dayOfWeek, 'days')

		return `${targetDate.format('dddd')} ${targetDate.format('DD.MM.YYYY')}`
	}

	const data = useMemo(() => {
		const dataSource = syncWarning !== '' ? fakeOrdersByDay : ordersByDay

		return dataSource.map((order, index) => ({
			day: order.day,
			[t('page.diary.chart_label')]: order.net_profit,
			color:
				order.net_profit < 0
					? chartStyles.barColorNegative
					: chartStyles.barColorPositive,
		}))
	}, [syncWarning, fakeOrdersByDay, ordersByDay, chartStyles, t])

	const CustomTooltip = ({ data }) => {
		if (!data) return null

		return (
			<div className={styles.bar_chart_tooltip}>
				<RootDesc>
					<label>{getTooltipTitle(data.day)}</label>
				</RootDesc>

				<RootDesc>
					<div>
						<b>{t('page.diary.chart_label')}</b>:{' '}
						{data[t('page.diary.chart_label')]}
					</div>
				</RootDesc>
			</div>
		)
	}

	const CustomLegend = () => {
		return (
			<div className={styles.bar_chart_legend}>
				<div className={styles.bar_chart_legend_item}>
					<label
						style={{
							backgroundColor: chartStyles.barColorPositive,
						}}
					/>
					<RootDesc>
						<span>{t('page.diary.chart_label')}</span>
					</RootDesc>
				</div>
			</div>
		)
	}

	return (
		<div className={styles.bar_chart_wrapper}>
			<CustomLegend />

			<div
				className={styles.bar_chart}
				style={{
					opacity: syncWarning !== '' || serverStatus === 'error' ? '0.2' : '1',
					pointerEvents:
						syncWarning !== '' || serverStatus === 'error' ? 'none' : 'auto',
				}}
			>
				<ResponsiveBar
					data={data}
					keys={[t('page.diary.chart_label')]}
					indexBy='day'
					borderRadius={chartStyles.margin}
					margin={{
						top: chartStyles.paddingSmall,
						bottom: chartStyles.paddingSmall,
						left: chartStyles.paddingBig,
					}}
					padding={0.3}
					indexScale={{ type: 'band', round: true, nice: true }}
					enableGridX={false}
					enableGridY={true}
					enableLabel={false}
					theme={{
						grid: {
							line: {
								stroke: chartStyles.gridColor,
								strokeWidth: 1,
							},
						},
					}}
					animate={true}
					motionConfig='wobbly'
					motionStiffness={90}
					motionDamping={15}
					tooltip={CustomTooltip}
					colors={({ data }) => data.color}
					axisBottom={null}
					axisLeft={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						legend: '',
						legendOffset: -40,
						legendPosition: 'middle',
						format: value => value,
						renderTick: ({ value, x, y }) => (
							<text
								x={x - chartStyles.margin}
								y={y}
								textAnchor='end'
								dominantBaseline='middle'
								style={{
									fill: chartStyles.textColor,
									fontFamily: chartStyles.font,
									fontSize: chartStyles.fontSize,
								}}
							>
								{value}
							</text>
						),
					}}
					legends={[]}
					valueScale={{
						type: 'linear',
						min: 'auto',
						max: 'auto',
						nice: true,
					}}
				/>
			</div>
		</div>
	)
})
