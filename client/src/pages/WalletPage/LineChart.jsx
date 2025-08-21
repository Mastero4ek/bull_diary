import React, {
  useCallback,
  useMemo,
} from 'react';

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
} from 'chart.js';
import _ from 'lodash';
import moment from 'moment/min/moment-with-locales';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootButton } from '@/components/ui/buttons/RootButton';

import styles from './styles.module.scss';

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

export const LineChart = React.memo(() => {
	const navigate = useNavigate()
	const { t } = useTranslation()
	const { theme, width, isMobile } = useSelector(state => state.settings)
	const { walletChangesByDay, fakeWalletChangesByDay, fakeWallet, wallet } =
		useSelector(state => state.wallet)
	const { filter, exchange } = useSelector(state => state.filters)

	const chartStyles = useMemo(
		() => ({
			// Base sizes
			margin: (width * 0.5) / 100,
			fontSize: (width * 0.9) / 100,
			border: (width * 0.25) / 100,
			font: "'IBM Plex Sans', sans-serif",

			// Text colors
			colorDark: 'rgba(185, 200, 215, 1)',
			colorLight: 'rgba(79, 104, 137, 1)',

			// Line chart colors
			lineColorLight: '#c270f8',
			lineColorDark: '#24eaa4',

			// Bar chart colors
			barColorLight: 'rgba(60, 70, 78, 0.5)',
			barColorDark: 'rgba(128, 128, 128, 1)',

			// Tooltip colors
			tooltipBgDark: 'rgba(38, 46, 54, 0.75)',
			tooltipBgLight: 'rgba(241, 247, 255, 0.75)',

			// Sizes for large screens
			largeScreen: width >= 1920 || isMobile,

			// Animation
			animationDuration: fakeWallet ? 0 : 1500,

			// Bar chart
			barPercentage: 0.5,
			barBorderWidth: 0,

			// Line chart
			lineTension: 0,
			lineFill: false,
			capBezierPoints: false,

			// Tooltip settings
			tooltipTitleAlign: 'center',
			tooltipBodyAlign: 'right',

			// Legend settings
			legendPosition: 'top',
			usePointStyle: true,

			// Grid settings
			gridLineWidth: 0,

			// Scales settings
			scaleType: 'linear',
			scaleDisplay: true,
			scalePosition: 'left',
		}),
		[width, isMobile, fakeWallet]
	)

	const getLastKnownBalance = useCallback(() => {
		const allBalances =
			walletChangesByDay ||
			fakeWalletChangesByDay
				.filter(item => item.cashBalance != null)
				.sort((a, b) => moment(a.date).diff(moment(b.date)))

		return allBalances.length > 0
			? allBalances[allBalances.length - 1].cashBalance
			: wallet.total_balance || 0
	}, [walletChangesByDay, fakeWalletChangesByDay, wallet.total_balance])

	const getFirstKnownBalance = useCallback(() => {
		const allBalances =
			walletChangesByDay ||
			fakeWalletChangesByDay
				.filter(item => item.cashBalance != null)
				.sort((a, b) => moment(a.date).diff(moment(b.date)))

		return allBalances.length > 0
			? allBalances[0].cashBalance
			: wallet.total_balance || 0
	}, [walletChangesByDay, fakeWalletChangesByDay, wallet.total_balance])

	const hasTransactionData = useCallback(() => {
		const dataSource = walletChangesByDay || fakeWalletChangesByDay

		if (!dataSource || dataSource.length === 0) return false

		return dataSource.some(
			item =>
				(item.change && item.change !== 0) || (item.count && item.count > 0)
		)
	}, [walletChangesByDay, fakeWalletChangesByDay])

	const normalizeDate = useCallback(dateStr => {
		if (!dateStr) return dateStr

		if (dateStr.includes('T') || dateStr.includes('Z')) {
			return dateStr
		}

		if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
			return moment(dateStr).toISOString()
		}

		return dateStr
	}, [])

	const periodConfig = useMemo(
		() => ({
			year: {
				getLabels: () =>
					Array.from({ length: 12 }, (_, i) =>
						moment({ year: moment().year(), month: i })
					),
				getGroupKey: item => moment(item.date).format('YYYY-MM'),
				getLabelFormat: label => label.format('MMM'),
				getFutureCheck: (label, index) => index > moment().month(),
				getTimeUnit: 'month',
			},
			quarter: {
				getLabels: () => {
					const now = moment()
					const startOfQuarter = now.clone().startOf('quarter')
					const endOfQuarter = now.clone().endOf('quarter')
					const labels = []
					let currentWeek = startOfQuarter.clone().startOf('isoWeek')

					while (currentWeek.isSameOrBefore(endOfQuarter)) {
						labels.push(currentWeek.clone())
						currentWeek.add(1, 'week')
					}

					return labels
				},
				getGroupKey: item => moment(item.date).format('GGGG-WW'),
				getLabelFormat: label => `${label.isoWeek()}`,
				getFutureCheck: label => label.isAfter(moment(), 'week'),
				getTimeUnit: 'week',
			},
			month: {
				getLabels: () => {
					const now = moment()
					const startOfMonth = now.clone().startOf('month')
					const endOfMonth = now.clone().endOf('month')
					const daysInMonth = endOfMonth.diff(startOfMonth, 'days') + 1

					return Array.from({ length: daysInMonth }, (_, i) =>
						startOfMonth.clone().add(i, 'days')
					)
				},
				getGroupKey: item => moment(item.date).format('YYYY-MM-DD'),
				getLabelFormat: label => label.format('DD'),
				getFutureCheck: label => label.isAfter(moment(), 'day'),
				getTimeUnit: 'day',
			},
			week: {
				getLabels: () =>
					Array.from({ length: 7 }, (_, i) =>
						moment().clone().startOf('isoWeek').add(i, 'days')
					),
				getGroupKey: item => moment(item.date).format('YYYY-MM-DD'),
				getLabelFormat: label => label.format('ddd'),
				getFutureCheck: label => label.isAfter(moment(), 'day'),
				getTimeUnit: 'day',
			},
		}),
		[]
	)

	const processPeriodData = useCallback(
		period => {
			const config = periodConfig[period]

			if (!config) return { labels: [], lineChartData: [], barChartData: [] }

			const dataSource = walletChangesByDay || fakeWalletChangesByDay

			if (!dataSource || dataSource.length === 0) {
				return { labels: [], chartData: [] }
			}

			const normalizedDataSource = dataSource.map(item => ({
				...item,
				date: normalizeDate(item.date),
			}))

			const labels = config.getLabels()

			const filteredDataSource = normalizedDataSource.filter(item => {
				const itemDate = moment(item.date)
				const firstLabel = labels[0]
				const lastLabel = labels[labels.length - 1]

				return (
					itemDate.isSameOrAfter(firstLabel, 'day') &&
					itemDate.isSameOrBefore(lastLabel, 'day')
				)
			})

			const groupedData = _.groupBy(filteredDataSource, config.getGroupKey)

			const filteredBalances = filteredDataSource
				.filter(item => item.cashBalance != null)
				.sort((a, b) => moment(a.date).diff(moment(b.date)))

			const firstKnownBalance =
				filteredBalances.length > 0
					? filteredBalances[0].cashBalance
					: getFirstKnownBalance()

			const lineChartData = labels.map((label, index) => {
				const key = config.getGroupKey({ date: label.format('YYYY-MM-DD') })
				const data = groupedData[key] || []

				if (config.getFutureCheck(label, index)) {
					return null
				}

				if (data.length > 0) {
					const lastValidData = data
						.filter(item => item.cashBalance != null)
						.sort((a, b) => moment(a.date).diff(moment(b.date)))
						.pop()

					return lastValidData ? lastValidData.cashBalance : null
				}

				return null
			})

			const barChartData = labels.map((label, index) => {
				const key = config.getGroupKey({ date: label.format('YYYY-MM-DD') })
				const data = groupedData[key] || []

				if (config.getFutureCheck(label, index)) {
					return null
				}

				const totalCount = data.reduce(
					(sum, item) => sum + (item.count || 0),
					0
				)
				return totalCount
			})

			return {
				labels: labels.map(config.getLabelFormat),
				lineChartData,
				barChartData,
			}
		},
		[
			walletChangesByDay,
			fakeWalletChangesByDay,
			getLastKnownBalance,
			getFirstKnownBalance,
			periodConfig,
			normalizeDate,
			hasTransactionData,
		]
	)

	const formatTooltipLabel = useCallback(
		context => {
			if (context.dataset.type === 'line') {
				const balance = context.dataset.data[context.dataIndex]
				const balanceRounded =
					typeof balance === 'number' ? balance.toFixed(2) : balance

				return `USD: ~${balanceRounded}`
			} else if (context.dataset.type === 'bar') {
				const count = context.dataset.data[context.dataIndex]

				return `${t('page.wallet.chart_label_trans')}: ${count || 0}`
			}

			return context.dataset.label
		},
		[t]
	)

	const { labels, lineChartData, barChartData } = useMemo(() => {
		const period = filter?.value?.toLowerCase() || 'week'
		const result = processPeriodData(period)

		return {
			labels: result?.labels || [],
			lineChartData: result?.lineChartData || [],
			barChartData: result?.barChartData || [],
		}
	}, [
		filter,
		processPeriodData,
		walletChangesByDay,
		fakeWalletChangesByDay,
		getLastKnownBalance,
		hasTransactionData,
	])

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
					fill: chartStyles.lineFill,
					tension: chartStyles.lineTension,
					type: 'line',
					yAxisID: 'y',
				},
				{
					label: t('page.wallet.chart_label_trans'),
					data: barChartData || [],
					backgroundColor: (barChartData || []).map((value, index) => {
						return theme ? chartStyles.barColorDark : chartStyles.barColorLight
					}),
					borderRadius: chartStyles.margin,
					borderWidth: chartStyles.barBorderWidth,
					barPercentage: chartStyles.barPercentage,
					type: 'bar',
					yAxisID: 'y',
				},
			],
		}),
		[labels, lineChartData, barChartData, theme, chartStyles, t]
	)

	const options = useMemo(
		() => ({
			responsive: true,
			animation: {
				duration: chartStyles.animationDuration,
			},
			elements: {
				line: {
					borderWidth: chartStyles.largeScreen ? 5 : chartStyles.border,
					capBezierPoints: chartStyles.capBezierPoints,
				},
				point: {
					radius: chartStyles.largeScreen ? 5 : chartStyles.border,
					borderWidth: 0,
				},
			},
			plugins: {
				legend: {
					position: chartStyles.legendPosition,
					labels: {
						boxWidth: chartStyles.largeScreen ? 15 : chartStyles.margin,
						boxHeight: chartStyles.largeScreen ? 15 : chartStyles.margin,
						usePointStyle: chartStyles.usePointStyle,
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
					caretPadding: chartStyles.largeScreen ? 20 : chartStyles.margin,
					cornerRadius: chartStyles.largeScreen ? 20 : chartStyles.margin,
					boxPadding: chartStyles.largeScreen ? 20 : chartStyles.margin,
					titleAlign: chartStyles.tooltipTitleAlign,
					bodyAlign: chartStyles.tooltipBodyAlign,
					titleFont: {
						size: chartStyles.largeScreen ? 16 : chartStyles.fontSize,
						family: chartStyles.font,
					},
					bodyFont: {
						size: chartStyles.largeScreen ? 14 : chartStyles.fontSize,
						family: chartStyles.font,
					},
					callbacks: {
						label: formatTooltipLabel,
					},
				},
			},
			scales: {
				x: {
					grid: {
						lineWidth: chartStyles.gridLineWidth,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
					},
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
					type: chartStyles.scaleType,
					display: chartStyles.scaleDisplay,
					position: chartStyles.scalePosition,
					beginAtZero: true,
					grid: {
						lineWidth: chartStyles.gridLineWidth,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
					},
					ticks: {
						padding: chartStyles.fontSize,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
						font: {
							size: chartStyles.largeScreen ? 14 : chartStyles.fontSize,
							family: chartStyles.font,
						},
					},
					afterDataLimits: scale => {
						const max = scale.max
						const padding = max * 0.25

						scale.max = max + padding
						scale.min = 0
					},
				},
			},
		}),
		[theme, chartStyles, formatTooltipLabel]
	)

	return (
		<div
			className={styles.line_chart}
			style={{
				opacity: `${fakeWallet ? '0.2' : '1'}`,
				pointerEvents: `${fakeWallet ? 'none' : 'auto'}`,
			}}
		>
			<Line data={data} options={options} />

			<div className={styles.line_chart_details}>
				<RootButton
					icon={'details'}
					text={t('button.details')}
					onClickBtn={() => {
						navigate('/wallet/details')
					}}
				/>
			</div>
		</div>
	)
})
