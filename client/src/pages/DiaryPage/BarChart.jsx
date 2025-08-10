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
	const { fakePositions, ordersByDay, serverStatus } = useSelector(
		state => state.positions
	)

	let margin = (width * 0.5) / 100
	let fontSize = (width * 0.9) / 100
	let font = "'IBM Plex Sans', sans-serif"
	let colorDark = 'rgba(185, 200, 215, 1)'
	let colorLight = 'rgba(79, 104, 137, 1)'
	let backgroundLightRed = 'rgba(255, 51, 100, 1)'
	let backgroundDarkRed = 'rgba(255, 55, 55, 1)'
	let backgroundLightGreen = '#28d5ca'
	let backgroundDarkGreen = '#11958d'

	const fakeOrdersByDay = [
		{ day: 'Mon', net_profit: 10 },
		{ day: 'Tue', net_profit: -28 },
		{ day: 'Wed', net_profit: 17 },
		{ day: 'Thu', net_profit: 68 },
		{ day: 'Fri', net_profit: 7 },
		{ day: 'Sat', net_profit: -16 },
		{ day: 'Sun', net_profit: 12 },
	]

	const allNetProfitZero = ordersByDay.every(order => order.net_profit === 0)

	let backgroundColors = fakePositions
		? fakeOrdersByDay.map((order, index) => {
				if (order.net_profit < 0) {
					return theme ? backgroundDarkRed : backgroundLightRed
				} else {
					return theme ? backgroundDarkGreen : backgroundLightGreen
				}
		  })
		: ordersByDay.map((order, index) => {
				if (order.net_profit < 0) {
					return theme ? backgroundDarkRed : backgroundLightRed
				} else {
					return theme ? backgroundDarkGreen : backgroundLightGreen
				}
		  })

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
					borderRadius: margin,
					borderWidth: 0,
					barPercentage: 0.5,
				},
			],
		}),
		[
			theme,
			width,
			isMobile,
			font,
			margin,
			ordersByDay,
			allNetProfitZero,
			fakeOrdersByDay,
			serverStatus,
			t,
		]
	)

	const options = useMemo(
		() => ({
			responsive: true,
			animation: {
				duration: serverStatus === 'error' ? 0 : 1500,
			},
			plugins: {
				legend: {
					position: 'top',
					labels: {
						boxWidth: width >= 1920 || isMobile ? 15 : margin,
						boxHeight: width >= 1920 || isMobile ? 15 : margin,
						usePointStyle: true,
						color: theme ? colorDark : colorLight,
						font: {
							size: width >= 1920 || isMobile ? 14 : fontSize,
							family: font,
						},
					},
				},
				tooltip: {
					backgroundColor: theme
						? 'rgba(38, 46, 54, 0.75)'
						: 'rgba(241, 247, 255, 0.75)',
					titleColor: theme
						? 'rgba(185, 200, 215, 1)'
						: 'rgba(79, 104, 137, 1)',
					bodyColor: theme ? 'rgba(185, 200, 215, 1)' : 'rgba(79, 104, 137, 1)',
					usePointStyles: true,
					padding: width >= 1920 || isMobile ? 20 : margin,
					caretPadding: width >= 1920 || isMobile ? 20 : margin,
					cornerRadius: width >= 1920 || isMobile ? 20 : margin,
					boxPadding: width >= 1920 || isMobile ? 20 : margin,
					usePointStyle: true,
					titleAlign: 'center',
					bodyAlign: 'right',
					titleFont: {
						size: width >= 1920 || isMobile ? 16 : fontSize,
						family: "'IBM Plex Sans', sans-serif",
					},
					bodyFont: {
						size: width >= 1920 || isMobile ? 14 : fontSize,
						family: "'IBM Plex Sans', sans-serif",
					},
				},
			},
			scales: {
				x: {
					grid: {
						lineWidth: 0,
					},
					ticks: {
						padding: margin,
						color: theme ? colorDark : colorLight,
						font: {
							size: fontSize,
							family: font,
						},
					},
				},
				y: {
					grid: {
						lineWidth: 0,
					},
					ticks: {
						padding: margin,
						color: theme ? colorDark : colorLight,
						font: {
							size: fontSize,
							family: font,
						},
					},
				},
			},
		}),
		[
			theme,
			width,
			isMobile,
			font,
			margin,
			fakePositions,
			ordersByDay,
			serverStatus,
		]
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
