import React, { useMemo } from 'react'

import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import styles from './styles.module.scss'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title)

export const BarChart = React.memo(() => {
	const { t } = useTranslation()
	const { theme, width, isMobile } = useSelector(state => state.settings)
	const { fakeData: fakePositions, ordersByDay } = useSelector(
		state => state.positions
	)
	const { serverStatus } = useSelector(state => state.positions)

	const chartStyles = useMemo(
		() => ({
			// Base sizes
			margin: (width * 0.5) / 100,
			fontSize: (width * 0.9) / 100,
			font: "'IBM Plex Sans', sans-serif",

			// Text colors
			colorDark: 'rgba(185, 200, 215, 1)',
			colorLight: 'rgba(79, 104, 137, 1)',

			// Bar chart colors
			backgroundLightRed: 'rgba(255, 51, 100, 1)',
			backgroundDarkRed: 'rgba(255, 55, 55, 1)',
			backgroundLightGreen: '#28d5ca',
			backgroundDarkGreen: '#11958d',

			// Tooltip colors
			tooltipBgDark: 'rgba(38, 46, 54, 0.75)',
			tooltipBgLight: 'rgba(241, 247, 255, 0.75)',

			// Sizes for large screens
			largeScreen: width >= 1920 || isMobile,

			// Animation
			animationDuration: serverStatus === 'error' ? 0 : 1500,

			// Bar chart settings
			barPercentage: 0.5,
			barBorderWidth: 0,

			// Tooltip settings
			tooltipTitleAlign: 'center',
			tooltipBodyAlign: 'right',
			usePointStyle: true,

			// Legend settings
			legendPosition: 'top',

			// Grid settings
			gridLineWidth: 0,
		}),
		[width, isMobile, serverStatus]
	)

	const fakeOrdersByDay = [
		{ day: 'Mon', net_profit: 10 },
		{ day: 'Tue', net_profit: -28 },
		{ day: 'Wed', net_profit: 17 },
		{ day: 'Thu', net_profit: 68 },
		{ day: 'Fri', net_profit: 7 },
		{ day: 'Sat', net_profit: -16 },
		{ day: 'Sun', net_profit: 12 },
	]

	const backgroundColors = useMemo(() => {
		const dataSource = fakePositions ? fakeOrdersByDay : ordersByDay

		return dataSource.map((order, index) => {
			if (order.net_profit < 0) {
				return theme
					? chartStyles.backgroundDarkRed
					: chartStyles.backgroundLightRed
			} else {
				return theme
					? chartStyles.backgroundDarkGreen
					: chartStyles.backgroundLightGreen
			}
		})
	}, [fakePositions, fakeOrdersByDay, ordersByDay, theme, chartStyles])

	const data = useMemo(
		() => ({
			labels:
				serverStatus === 'error'
					? fakeOrdersByDay.map(order => order.day)
					: ordersByDay.map(order => order.day),
			datasets: [
				{
					label: t('page.diary.chart_label'),
					data:
						serverStatus === 'error'
							? fakeOrdersByDay.map(order => order.net_profit)
							: ordersByDay.map(order => order.net_profit),
					backgroundColor: backgroundColors,
					borderRadius: chartStyles.margin,
					borderWidth: chartStyles.barBorderWidth,
					barPercentage: chartStyles.barPercentage,
				},
			],
		}),
		[
			backgroundColors,
			ordersByDay,
			fakeOrdersByDay,
			serverStatus,
			chartStyles,
			t,
		]
	)

	const options = useMemo(
		() => ({
			responsive: true,
			animation: {
				duration: chartStyles.animationDuration,
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
					usePointStyles: chartStyles.usePointStyle,
					padding: chartStyles.largeScreen ? 20 : chartStyles.margin,
					caretPadding: chartStyles.largeScreen ? 20 : chartStyles.margin,
					cornerRadius: chartStyles.largeScreen ? 20 : chartStyles.margin,
					boxPadding: chartStyles.largeScreen ? 20 : chartStyles.margin,
					usePointStyle: chartStyles.usePointStyle,
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
				},
			},
			scales: {
				x: {
					grid: {
						lineWidth: chartStyles.gridLineWidth,
					},
					ticks: {
						padding: chartStyles.margin,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
						font: {
							size: chartStyles.fontSize,
							family: chartStyles.font,
						},
					},
				},
				y: {
					beginAtZero: true,
					grid: {
						lineWidth: chartStyles.gridLineWidth,
					},
					ticks: {
						padding: chartStyles.margin,
						color: theme ? chartStyles.colorDark : chartStyles.colorLight,
						font: {
							size: chartStyles.fontSize,
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
		[theme, chartStyles]
	)

	return (
		<div
			className={styles.bar_chart}
			style={{
				opacity: `${serverStatus === 'error' ? '0.2' : '1'}`,
				pointerEvents: `${serverStatus === 'error' ? 'none' : 'auto'}`,
			}}
		>
			<Bar data={data} options={options} />
		</div>
	)
})
