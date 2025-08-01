import React, { useMemo } from 'react'

import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { useSelector } from 'react-redux'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { Mark } from '@/components/ui/general/Mark'

import styles from './styles.module.scss'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

export const DoughnutChart = () => {
	const { theme, width, isMobile, mark } = useSelector(state => state.settings)
	const { totalLoss, totalProfit } = useSelector(state => state.orders)
	const { fakeOrders } = useSelector(state => state.orders)

	let margin = (width * 0.5) / 100
	let fontSize = (width * 0.9) / 100
	let chartOffset = (width * 2.75) / 100
	let chartCutout = (width * 5.5) / 100
	let font = "'IBM Plex Sans', sans-serif"
	let colorDark = 'rgba(185, 200, 215, 1)'
	let colorLight = 'rgba(79, 104, 137, 1)'
	let backgroundGreenLight = '#28d5ca'
	let backgroundGreenDark = '#11958d'
	let backgroundRedLight = 'rgba(255, 51, 100, 1)'
	let backgroundRedDark = 'rgba(255, 55, 55, 1)'

	const data = useMemo(
		() => ({
			labels: ['Income', 'Lession'],
			datasets: [
				{
					data: fakeOrders ? [650, -350] : [totalProfit, totalLoss],
					backgroundColor: theme
						? [backgroundGreenDark, backgroundRedDark]
						: [backgroundGreenLight, backgroundRedLight],
					borderRadius: margin,
					borderWidth: 0,
					hoverOffset: margin,
					offset: [chartOffset, 0],
				},
			],
		}),
		[
			theme,
			totalProfit,
			totalLoss,
			width,
			isMobile,
			font,
			margin,
			chartCutout,
			fakeOrders,
		]
	)

	const options = useMemo(
		() => ({
			cutout: chartCutout,
			responsive: true,
			animation: {
				duration: fakeOrders ? 0 : 1500,
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
					padding: width >= 1920 || isMobile ? 20 : margin,
					caretPadding: width >= 1920 || isMobile ? 20 : margin,
					cornerRadius: width >= 1920 || isMobile ? 20 : margin,
					boxPadding: width >= 1920 || isMobile ? 20 : margin,
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
		}),
		[
			theme,
			totalProfit,
			totalLoss,
			width,
			isMobile,
			font,
			margin,
			chartCutout,
			fakeOrders,
		]
	)

	return (
		<div
			className={styles.doughnut_chart}
			style={{
				opacity: `${fakeOrders ? '0.2' : '1'}`,
				pointerEvents: `${fakeOrders ? 'none' : 'auto'}`,
			}}
		>
			<Doughnut data={data} options={options} />

			<div className={styles.doughnut_chart_bottom}>
				<div className={styles.doughnut_chart_desc}>
					{mark && <Mark color={'green'} />}

					<RootDesc>
						<span>Profit: </span>
						<strong>{fakeOrders ? 650 : totalProfit} %</strong>
					</RootDesc>
				</div>

				<div className={styles.doughnut_chart_desc}>
					{mark && <Mark color={'red'} />}

					<RootDesc>
						<span>Loss: </span>
						<strong>{fakeOrders ? -350 : totalLoss} %</strong>
					</RootDesc>
				</div>
			</div>
		</div>
	)
}
