import React, {
  useCallback,
  useMemo,
} from 'react';

import {
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

import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { Icon } from '@/components/ui/general/Icon';

import styles from './styles.module.scss';

ChartJS.register(
	LineElement,
	CategoryScale,
	LinearScale,
	PointElement,
	Legend,
	Tooltip,
	Filler
)

export const LineChart = React.memo(() => {
	const { t } = useTranslation()
	const { theme, width, isMobile } = useSelector(state => state.settings)
	const { walletChangesByDay, fakeWalletChangesByDay, fakeWallet, wallet } =
		useSelector(state => state.wallet)
	const { filter, exchange } = useSelector(state => state.filters)
	const navigate = useNavigate()

	const chartStyles = useMemo(
		() => ({
			margin: (width * 0.5) / 100,
			fontSize: (width * 0.9) / 100,
			border: (width * 0.25) / 100,
			font: "'IBM Plex Sans', sans-serif",
			colorDark: 'rgba(185, 200, 215, 1)',
			colorLight: 'rgba(79, 104, 137, 1)',
		}),
		[width]
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

			if (!config) return { labels: [], chartData: [] }

			const dataSource = walletChangesByDay || fakeWalletChangesByDay

			if (!dataSource || dataSource.length === 0) {
				return { labels: [], chartData: [] }
			}

			const normalizedDataSource = dataSource.map(item => ({
				...item,
				date: normalizeDate(item.date),
			}))

			const labels = config.getLabels()
			const groupedData = _.groupBy(normalizedDataSource, config.getGroupKey)
			const lastKnownBalance = getLastKnownBalance()

			const chartData = labels.map((label, index) => {
				const key = config.getGroupKey({ date: label.format('YYYY-MM-DD') })
				const data = groupedData[key] || []

				// console.log(data)

				if (config.getFutureCheck(label, index)) {
					return null // Future dates should be null or 0 for visual purposes
				}

				if (data.length > 0) {
					const lastValidData = data
						.filter(item => item.cashBalance != null)
						.sort((a, b) => moment(a.date).diff(moment(b.date)))
						.pop()

					return lastValidData ? lastValidData.cashBalance : lastKnownBalance
				}

				return lastKnownBalance
			})

			return {
				labels: labels.map(config.getLabelFormat),
				chartData,
			}
		},
		[
			walletChangesByDay,
			fakeWalletChangesByDay,
			getLastKnownBalance,
			periodConfig,
			normalizeDate,
			hasTransactionData,
		]
	)

	const getTransactionCount = useCallback(
		context => {
			const period = filter?.value?.toLowerCase()
			const idx = context.dataIndex
			const dataSource = walletChangesByDay || fakeWalletChangesByDay
			const normalizedDataSource = dataSource.map(item => ({
				...item,
				date: normalizeDate(item.date),
			}))

			if (!hasTransactionData()) {
				return 0
			}

			if (period === 'year') {
				const year = moment().year()
				const monthKey = moment({ year, month: idx }).format('YYYY-MM')

				return normalizedDataSource
					.filter(item => moment(item.date).format('YYYY-MM') === monthKey)
					.reduce((acc, item) => acc + (item.count || 0), 0)
			}

			if (period === 'month') {
				const day = context.label
				const month = moment().month()
				const year = moment().year()
				const dayKey = moment({ year, month, day: Number(day) }).format(
					'YYYY-MM-DD'
				)

				return (
					normalizedDataSource.find(
						item => moment(item.date).format('YYYY-MM-DD') === dayKey
					)?.count || 0
				)
			}

			const dayKey = context.label

			return (
				normalizedDataSource.find(
					item => moment(item.date).format('ddd') === dayKey
				)?.count || 0
			)
		},
		[
			walletChangesByDay,
			fakeWalletChangesByDay,
			filter,
			normalizeDate,
			hasTransactionData,
		]
	)

	const formatTooltipLabel = useCallback(
		context => {
			const balance = context.dataset.data[context.dataIndex]
			const balanceRounded =
				typeof balance === 'number' ? balance.toFixed(2) : balance
			const count = getTransactionCount(context)

			return `USDT: ${balanceRounded}, ${t('page.wallet.chart_label_trans')} ${
				count || 0
			}`
		},
		[getTransactionCount, hasTransactionData]
	)

	const { labels, chartData } = useMemo(() => {
		const period = filter?.value?.toLowerCase() || 'week'
		const result = processPeriodData(period)

		return result
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
					data: chartData,
					borderColor: theme ? '#24eaa4' : '#c270f8',
					pointBackgroundColor: theme ? '#24eaa4' : '#c270f8',
					fill: false,
					tension: 0,
				},
			],
		}),
		[labels, chartData, theme, chartStyles, t]
	)

	const options = useMemo(
		() => ({
			responsive: true,
			animation: {
				duration: fakeWallet ? 0 : 1500,
			},
			elements: {
				line: {
					borderWidth: width >= 1920 || isMobile ? 5 : chartStyles.border,
					capBezierPoints: false,
				},
				point: {
					radius: width >= 1920 || isMobile ? 5 : chartStyles.border,
					borderWidth: 0,
				},
			},
			plugins: {
				legend: {
					position: 'top',
					labels: {
						boxWidth: width >= 1920 || isMobile ? 15 : chartStyles.margin,
						boxHeight: width >= 1920 || isMobile ? 15 : chartStyles.margin,
						usePointStyle: true,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
						font: {
							size: width >= 1920 || isMobile ? 14 : chartStyles.fontSize,
							family: chartStyles.font,
						},
					},
				},
				tooltip: {
					backgroundColor: theme
						? 'rgba(38, 46, 54, 0.75)'
						: 'rgba(241, 247, 255, 0.75)',
					titleColor: theme ? chartStyles.colorDark : chartStyles.colorLight,
					bodyColor: theme ? chartStyles.colorDark : chartStyles.colorLight,
					padding: width >= 1920 || isMobile ? 20 : chartStyles.margin,
					caretPadding: width >= 1920 || isMobile ? 20 : chartStyles.margin,
					cornerRadius: width >= 1920 || isMobile ? 20 : chartStyles.margin,
					boxPadding: width >= 1920 || isMobile ? 20 : chartStyles.margin,
					titleAlign: 'center',
					bodyAlign: 'right',
					titleFont: {
						size: width >= 1920 || isMobile ? 16 : chartStyles.fontSize,
						family: chartStyles.font,
					},
					bodyFont: {
						size: width >= 1920 || isMobile ? 14 : chartStyles.fontSize,
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
						lineWidth: 0,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
					},
					ticks: {
						padding: chartStyles.fontSize,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
						font: {
							size: width >= 1920 || isMobile ? 14 : chartStyles.fontSize,
							family: chartStyles.font,
						},
					},
				},
				y: {
					grid: {
						lineWidth: 0,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
					},
					ticks: {
						padding: chartStyles.fontSize,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
						font: {
							size: width >= 1920 || isMobile ? 14 : chartStyles.fontSize,
							family: chartStyles.font,
						},
					},
				},
			},
		}),
		[theme, width, isMobile, chartStyles, fakeWallet, formatTooltipLabel]
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
				{exchange?.name === 'bybit' && (
					<div className={styles.line_chart_details_warning}>
						<SmallDesc>
							<Icon id='warning-icon' />

							<span style={{ color: 'var(--orange)' }}>
								{t('page.wallet.warning')}
							</span>
						</SmallDesc>
					</div>
				)}

				{/* <RootButton
					icon={'details'}
					text={t('button.details')}
					onClickBtn={() => {
						navigate('/wallet/details')
					}}
				/> */}
			</div>
		</div>
	)
})
