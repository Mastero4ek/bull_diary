import React, { useMemo } from 'react'

import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js'
import moment from 'moment/min/moment-with-locales'
import { Line } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { RootButton } from '@/components/ui/buttons/RootButton'

import styles from './styles.module.scss'

ChartJS.register(
	LineElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Legend,
	Tooltip,
	Filler,
	BarElement
)

export const LineChart = React.memo(({ syncWarning = '' }) => {
	const navigate = useNavigate()
	const { t } = useTranslation()
	const { theme, width, isMobile } = useSelector(state => state.settings)
	const { transactions, fakeTransactions, serverStatus } = useSelector(
		state => state.transactions
	)
	const { filter } = useSelector(state => state.filters)

	const period = filter?.value?.toLowerCase() || 'week'

	const getTooltipTitle = context => {
		if (period === 'year') {
			const monthIndex = parseInt(context[0].label) - 1
			const now = moment()

			return moment({ year: now.year(), month: monthIndex }).format('MMMM')
		} else if (period === 'week') {
			const dayIndex = context[0].dataIndex
			const now = moment()

			return now.clone().startOf('isoWeek').add(dayIndex, 'days').format('dddd')
		} else if (period === 'quarter') {
			const weekNumber = context[0].label

			return `${weekNumber} ${t('filter.period.week')}`
		}

		return context[0].label
	}

	const getTooltipLabel = context => {
		if (context.dataset.type === 'line') {
			const balance = context.dataset.data[context.dataIndex]

			return `USD: ~${
				typeof balance === 'number' ? balance.toFixed(2) : balance
			}`
		} else {
			const count = context.dataset.data[context.dataIndex]

			return `${t('page.wallet.chart_label_trans')}: ${count || 0}`
		}
	}

	const handleAfterDataLimits = scale => {
		const max = scale.max

		scale.max = max + max * 0.75
		scale.min = 0
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

	const chartStyles = useMemo(
		() => ({
			margin: (width * 0.5) / 100,
			fontSize: (width * 0.9) / 100,
			border: (width * 0.25) / 100,
			font: "'IBM Plex Sans', sans-serif",
			colorDark: 'rgba(185, 200, 215, 1)',
			colorLight: 'rgba(79, 104, 137, 1)',
			lineColorLight: '#c270f8',
			lineColorDark: '#24eaa4',
			barColorLight: 'rgba(60, 70, 78, 0.5)',
			barColorDark: 'rgba(128, 128, 128, 1)',
			tooltipBgDark: 'rgba(38, 46, 54, 0.75)',
			tooltipBgLight: 'rgba(241, 247, 255, 0.75)',
			largeScreen: width >= 1920 || isMobile,
			animationDuration: fakeTransactions ? 0 : 1500,
		}),
		[width, isMobile, fakeTransactions]
	)

	const data = useMemo(
		() => ({
			labels,
			datasets: [
				{
					label: t('page.wallet.chart_label'),
					data: lineChartData,
					borderColor: theme
						? chartStyles.lineColorDark
						: chartStyles.lineColorLight,
					pointBackgroundColor: theme
						? chartStyles.lineColorDark
						: chartStyles.lineColorLight,
					fill: false,
					tension: 0,
					type: 'line',
					yAxisID: 'y',
				},
				{
					label: t('page.wallet.chart_label_trans'),
					data: barChartData,
					backgroundColor: theme
						? chartStyles.barColorDark
						: chartStyles.barColorLight,
					borderRadius: chartStyles.margin,
					borderWidth: 0,
					barPercentage: 0.5,
					type: 'bar',
					yAxisID: 'y1',
				},
			],
		}),
		[labels, lineChartData, barChartData, theme, chartStyles, t]
	)

	const options = useMemo(
		() => ({
			responsive: true,
			animation: { duration: chartStyles.animationDuration },
			elements: {
				line: {
					borderWidth: chartStyles.largeScreen ? 5 : chartStyles.border,
				},
				point: {
					radius: chartStyles.largeScreen ? 5 : chartStyles.border,
					borderWidth: 0,
				},
			},
			plugins: {
				legend: {
					position: 'top',
					labels: {
						boxWidth: chartStyles.largeScreen ? 15 : chartStyles.margin,
						boxHeight: chartStyles.largeScreen ? 15 : chartStyles.margin,
						usePointStyle: true,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
						font: {
							size: chartStyles.largeScreen ? 14 : chartStyles.fontSize,
							family: chartStyles.font,
						},
					},
				},
				tooltip: {
					backgroundColor: theme
						? chartStyles.tooltipBgDark
						: chartStyles.tooltipBgLight,
					titleColor: theme ? chartStyles.colorDark : chartStyles.colorLight,
					bodyColor: theme ? chartStyles.colorDark : chartStyles.colorLight,
					padding: chartStyles.largeScreen ? 20 : chartStyles.margin,
					cornerRadius: chartStyles.largeScreen ? 20 : chartStyles.margin,
					titleFont: {
						size: chartStyles.largeScreen ? 16 : chartStyles.fontSize,
						family: chartStyles.font,
					},
					bodyFont: {
						size: chartStyles.largeScreen ? 14 : chartStyles.fontSize,
						family: chartStyles.font,
					},
					callbacks: {
						title: getTooltipTitle,
						label: getTooltipLabel,
					},
				},
			},
			scales: {
				x: {
					grid: { lineWidth: 0 },
					ticks: {
						padding: chartStyles.fontSize,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
						font: {
							size: chartStyles.largeScreen ? 14 : chartStyles.fontSize,
							family: chartStyles.font,
						},
					},
				},
				y: {
					type: 'linear',
					display: true,
					position: 'left',
					beginAtZero: true,
					grid: { lineWidth: 0 },
					ticks: {
						padding: chartStyles.fontSize,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
						font: {
							size: chartStyles.largeScreen ? 14 : chartStyles.fontSize,
							family: chartStyles.font,
						},
					},
					afterDataLimits: handleAfterDataLimits,
				},
				y1: {
					type: 'linear',
					display: false,
					position: 'right',
					beginAtZero: true,
					grid: { lineWidth: 0 },
					ticks: {
						padding: chartStyles.fontSize,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
						font: {
							size: chartStyles.largeScreen ? 14 : chartStyles.fontSize,
							family: chartStyles.font,
						},
					},
					afterDataLimits: handleAfterDataLimits,
				},
			},
		}),
		[
			theme,
			chartStyles,
			t,
			period,
			getTooltipTitle,
			getTooltipLabel,
			handleAfterDataLimits,
		]
	)

	return (
		<div
			className={styles.line_chart}
			style={{
				opacity: syncWarning !== '' || serverStatus === 'error' ? '0.2' : '1',
				pointerEvents:
					syncWarning !== '' || serverStatus === 'error' ? 'none' : 'auto',
			}}
		>
			<Line data={data} options={options} />

			<div className={styles.line_chart_details}>
				<RootButton
					icon={'details'}
					text={t('button.details')}
					onClickBtn={() => navigate('/wallet/details')}
				/>
			</div>
		</div>
	)
})
