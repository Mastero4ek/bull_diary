import React, { useMemo } from 'react';

import moment from 'moment/min/moment-with-locales';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';

import styles from './styles.module.scss';

export const LineChart = ({ syncWarning = '' }) => {
	const navigate = useNavigate()
	const { t } = useTranslation()
	const { theme, width, isTablet, isMobile } = useSelector(
		state => state.settings
	)
	const { transactions, fakeTransactions, serverStatus } = useSelector(
		state => state.transactions
	)
	const { filter } = useSelector(state => state.filters)

	const period = filter?.value?.toLowerCase() || 'week'

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
			lineColor: theme ? '#24eaa4' : '#c270f8',
			barColor: theme ? 'rgba(128, 128, 128, 1)' : 'rgba(60, 70, 78, 0.5)',
			gridColor: theme ? 'rgba(128, 128, 128, 0.2)' : 'rgba(60, 70, 78, 0.2)',
			text: theme ? 'rgba(185, 200, 215, 0.5)' : 'rgba(79, 104, 137, 0.5)',
		}),
		[width, isTablet, fakeTransactions, isMobile]
	)

	const getTooltipTitle = context => {
		const now = moment()

		if (period === 'year') {
			const monthIndex = parseInt(context[0].label) - 1
			return moment({ year: now.year(), month: monthIndex }).format('MMMM YYYY')
		} else if (period === 'quarter') {
			const weekNumber = parseInt(context[0].label)
			const currentYear = now.year()

			const weekStart = moment().isoWeek(weekNumber).startOf('isoWeek')
			const weekEnd = weekStart.clone().endOf('isoWeek')

			return `${weekStart.format('DD.MM.YYYY')} - ${weekEnd.format(
				'DD.MM.YYYY'
			)}`
		} else if (period === 'month') {
			const dayOfMonth = parseInt(context[0].label)
			const currentMonth = now.clone().startOf('month')

			return moment({
				year: currentMonth.year(),
				month: currentMonth.month(),
				date: dayOfMonth,
			}).format('DD MMMM YYYY')
		} else if (period === 'week') {
			const dayIndex = context[0].dataIndex
			const currentWeek = now.clone().startOf('isoWeek')
			const dayDate = currentWeek.add(dayIndex, 'days')
			return `${dayDate.format('dddd')} ${dayDate.format('DD.MM.YYYY')}`
		}

		return context[0].label
	}

	const checkIfFuture = (label, index, period) => {
		const now = moment()

		switch (period) {
			case 'year':
				const monthIndex = index
				const currentMonth = now.month()

				if (transactions.length === 0) {
					return monthIndex > 11
				}

				return monthIndex > currentMonth
			case 'quarter':
				const weekNumber = parseInt(label)
				const currentWeekNumber = now.isoWeek()

				if (transactions.length === 0) {
					return weekNumber > 53
				}

				return weekNumber > currentWeekNumber
			case 'month':
				const dayOfMonth = parseInt(label)
				const currentDayOfMonth = now.date()

				if (transactions.length === 0) {
					return dayOfMonth > 31
				}

				return dayOfMonth > currentDayOfMonth
			case 'week':
			default:
				const currentISOWeekday = now.isoWeekday()
				const dayOfWeekIndex = index
				const labelISOWeekday = dayOfWeekIndex + 1

				if (transactions.length === 0) {
					return labelISOWeekday > 7
				}

				return labelISOWeekday > currentISOWeekday
		}
	}

	const groupedData = useMemo(() => {
		const transactionData = syncWarning !== '' ? fakeTransactions : transactions

		if (transactionData.length === 0) return []

		const grouped = {}

		transactionData.forEach(transaction => {
			const day = moment(transaction.transactionTime).format('YYYY-MM-DD')

			if (!grouped[day]) {
				grouped[day] = {
					date: day,
					change: 0,
					count: 0,
					cashBalance: null,
					lastTransactionTime: null,
				}
			}

			const netChange = transaction.change || transaction.cashFlow || 0
			grouped[day].change += netChange
			grouped[day].count += 1

			const transactionTime = moment(transaction.transactionTime)
			if (
				transaction.cashBalance !== null &&
				transaction.cashBalance !== undefined &&
				(grouped[day].lastTransactionTime === null ||
					transactionTime.isAfter(grouped[day].lastTransactionTime))
			) {
				grouped[day].cashBalance = transaction.cashBalance
				grouped[day].lastTransactionTime = transactionTime
			}
		})

		return Object.values(grouped).sort((a, b) =>
			moment(a.date).diff(moment(b.date))
		)
	}, [transactions, fakeTransactions])

	const labels = useMemo(() => {
		const now = moment()

		switch (period) {
			case 'year':
				return Array.from({ length: 12 }, (_, i) =>
					(i + 1).toString().padStart(2, '0')
				)
			case 'quarter':
				const startOfQuarter = now.clone().startOf('quarter')
				const endOfQuarter = now.clone().endOf('quarter')
				const weeks = []
				let currentWeek = startOfQuarter.clone().startOf('isoWeek')

				while (currentWeek.isSameOrBefore(endOfQuarter)) {
					weeks.push(currentWeek.isoWeek().toString())
					currentWeek.add(1, 'week')
				}
				return weeks
			case 'month':
				const daysInMonth = now.daysInMonth()
				return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString())
			case 'week':
			default:
				return Array.from({ length: 7 }, (_, i) =>
					now.clone().startOf('isoWeek').add(i, 'days').format('ddd')
				)
		}
	}, [period])

	const { lineChartData, barChartData } = useMemo(() => {
		if (groupedData.length === 0) {
			return { lineChartData: [], barChartData: [] }
		}

		const findLastKnownBalance = () => {
			const now = moment()
			let lastKnownBalance = null
			let lastKnownDate = null

			for (let i = 1; i <= 10; i++) {
				let previousPeriodStart, previousPeriodEnd

				switch (period) {
					case 'year':
						previousPeriodStart = now
							.clone()
							.subtract(i, 'year')
							.startOf('year')
						previousPeriodEnd = now.clone().subtract(i, 'year').endOf('year')
						break
					case 'quarter':
						previousPeriodStart = now
							.clone()
							.subtract(i, 'quarter')
							.startOf('quarter')
						previousPeriodEnd = now
							.clone()
							.subtract(i, 'quarter')
							.endOf('quarter')
						break
					case 'month':
						previousPeriodStart = now
							.clone()
							.subtract(i, 'month')
							.startOf('month')
						previousPeriodEnd = now.clone().subtract(i, 'month').endOf('month')
						break
					case 'week':
					default:
						previousPeriodStart = now
							.clone()
							.subtract(i, 'week')
							.startOf('isoWeek')
						previousPeriodEnd = now.clone().subtract(i, 'week').endOf('isoWeek')
						break
				}

				const previousPeriodData = groupedData.filter(item => {
					const itemDate = moment(item.date)
					return itemDate.isBetween(
						previousPeriodStart,
						previousPeriodEnd,
						null,
						'[]'
					)
				})

				if (previousPeriodData.length > 0) {
					const sortedData = previousPeriodData.sort((a, b) =>
						moment(b.date).diff(moment(a.date))
					)

					for (const item of sortedData) {
						if (item.cashBalance !== null && item.cashBalance !== undefined) {
							lastKnownBalance = item.cashBalance
							lastKnownDate = moment(item.date)
							break
						}
					}

					if (lastKnownBalance !== null) {
						break
					}
				}
			}

			return { lastKnownBalance, lastKnownDate }
		}

		const { lastKnownBalance: previousPeriodBalance } = findLastKnownBalance()

		const filteredData = groupedData.filter(item => {
			const itemDate = moment(item.date)
			const now = moment()

			switch (period) {
				case 'year':
					return itemDate.year() === now.year()
				case 'quarter':
					return itemDate.isSame(now, 'quarter')
				case 'month':
					return itemDate.isSame(now, 'month')
				case 'week':
				default:
					return itemDate.isSame(now, 'isoWeek')
			}
		})

		const periodGroups = {}

		filteredData.forEach(item => {
			let key
			switch (period) {
				case 'year':
					key = (moment(item.date).month() + 1).toString().padStart(2, '0')
					break
				case 'quarter':
					key = moment(item.date).isoWeek().toString()
					break
				case 'month':
					key = moment(item.date).date().toString()
					break
				case 'week':
				default:
					key = moment(item.date).format('ddd')
					break
			}

			if (!periodGroups[key]) {
				periodGroups[key] = { balance: null, count: 0, lastDate: null }
			}

			periodGroups[key].count += item.count

			const itemDate = moment(item.date)
			if (
				item.cashBalance !== null &&
				(periodGroups[key].lastDate === null ||
					itemDate.isAfter(periodGroups[key].lastDate))
			) {
				periodGroups[key].balance = item.cashBalance
				periodGroups[key].lastDate = itemDate
			}
		})

		const lineChartData = []
		let lastKnownBalance = previousPeriodBalance

		labels.forEach((label, index) => {
			const periodData = periodGroups[label]
			const isFuture = checkIfFuture(label, index, period)

			if (isFuture) {
				lineChartData.push(null)
			} else if (periodData && periodData.balance !== null) {
				lastKnownBalance = periodData.balance
				lineChartData.push(periodData.balance)
			} else if (lastKnownBalance !== null) {
				lineChartData.push(lastKnownBalance)
			} else {
				lineChartData.push(null)
			}
		})

		const barChartData = labels.map(label => periodGroups[label]?.count || 0)

		return { lineChartData, barChartData }
	}, [groupedData, labels, period])

	const lineData = useMemo(() => {
		if (lineChartData.length === 0) return []

		return [
			{
				id: t('page.wallet.chart_label'),
				color: chartStyles.lineColor,
				data: labels.map((label, index) => ({
					x: label,
					y: lineChartData[index] || null,
				})),
			},
		]
	}, [labels, lineChartData, chartStyles, t])

	const barData = useMemo(() => {
		if (barChartData.length === 0) return []

		return labels.map((label, index) => ({
			label,
			[t('page.wallet.chart_label_trans')]: barChartData[index] || 0,
		}))
	}, [labels, barChartData, t])

	const CustomLegend = () => {
		return (
			<div className={styles.line_chart_legend}>
				<div className={styles.line_chart_legend_item}>
					<label
						style={{
							backgroundColor: chartStyles.lineColor,
						}}
					/>

					<RootDesc>
						<span>{t('page.wallet.chart_label')}</span>
					</RootDesc>
				</div>

				<div className={styles.line_chart_legend_item}>
					<label
						style={{
							backgroundColor: chartStyles.barColor,
						}}
					/>

					<RootDesc>
						<span>{t('page.wallet.chart_label_trans')}</span>
					</RootDesc>
				</div>
			</div>
		)
	}

	const CustomTooltip = ({ point, data }) => {
		if (!point && !data) return null

		let label, lineValue, barValue

		if (point) {
			label = point.data.x
			lineValue = point.data.y
			barValue = barChartData[labels.indexOf(label)] || 0
		} else if (data) {
			label = data.label
			barValue = data[t('page.wallet.chart_label_trans')] || 0
			lineValue = lineChartData[labels.indexOf(label)] || null
		}

		return (
			<div className={styles.line_chart_tooltip}>
				<RootDesc>
					<label>
						{getTooltipTitle([{ label, dataIndex: labels.indexOf(label) }])}
					</label>
				</RootDesc>

				<RootDesc>
					<div>
						<b>USD</b>: ~
						{typeof lineValue === 'number'
							? lineValue.toFixed(2)
							: lineValue || '0.00'}
					</div>

					<div>
						<b>{t('page.wallet.chart_label_trans')}</b>: {barValue}
					</div>
				</RootDesc>
			</div>
		)
	}

	return (
		<div className={styles.line_chart_wrapper}>
			<CustomLegend />

			<div
				className={styles.line_chart}
				style={{
					opacity: syncWarning !== '' || serverStatus === 'error' ? '0.2' : '1',
					pointerEvents:
						syncWarning !== '' || serverStatus === 'error' ? 'none' : 'auto',
				}}
			>
				<div className={styles.line_chart_bar}>
					<ResponsiveBar
						data={barData}
						keys={[t('page.wallet.chart_label_trans')]}
						indexBy='label'
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
						colors={chartStyles.barColor}
						axisBottom={null}
						axisLeft={{
							format: value => value,
							renderTick: ({ value, x, y }) => (
								<text
									x={x - chartStyles.margin}
									y={y}
									textAnchor='end'
									dominantBaseline='middle'
									style={{
										fill: chartStyles.text,
										fontFamily: chartStyles.font,
										fontSize: chartStyles.fontSize,
									}}
								>
									{value}
								</text>
							),
						}}
					/>

					<div className={styles.line_chart_line}>
						<ResponsiveLine
							data={lineData}
							margin={{
								top: chartStyles.paddingSmall,
								bottom: chartStyles.paddingBig,
								left: chartStyles.paddingBig,
							}}
							curve='monotoneX'
							axisTop={null}
							axisRight={null}
							axisBottom={null}
							axisLeft={null}
							enableGridX={false}
							enableGridY={false}
							enablePoints={false}
							useMesh={true}
							tooltip={CustomTooltip}
							legends={[]}
							yScale={{
								type: 'linear',
								min: 0,
								max: 'auto',
								stacked: false,
								reverse: false,
								nice: true,
							}}
							colors={chartStyles.lineColor}
						/>
					</div>
				</div>
			</div>

			<div className={styles.line_chart_details}>
				<RootButton
					icon={'details'}
					text={t('button.details')}
					onClickBtn={() => navigate('/wallet/details')}
				/>
			</div>
		</div>
	)
}
