import React, { useMemo } from 'react'

import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { colorizedNum } from '@/helpers/functions'

import styles from './styles.module.scss'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

export const DoughnutChart = ({ syncWarning = '' }) => {
	const { t } = useTranslation()
	const { theme, width, isMobile, color } = useSelector(state => state.settings)
	const { totalLoss, totalProfit, fakeOrders, serverStatus } = useSelector(
		state => state.orders
	)

	const chartStyles = useMemo(
		() => ({
			// Base sizes
			margin: (width * 0.5) / 100,
			fontSize: (width * 0.9) / 100,
			chartOffset: (width * 2.75) / 100,
			chartCutout: (width * 5.5) / 100,
			font: "'IBM Plex Sans', sans-serif",

			// Text colors
			colorDark: 'rgba(185, 200, 215, 1)',
			colorLight: 'rgba(79, 104, 137, 1)',

			// Doughnut chart colors
			backgroundGreenLight: '#28d5ca',
			backgroundGreenDark: '#11958d',
			backgroundRedLight: 'rgba(255, 51, 100, 1)',
			backgroundRedDark: 'rgba(255, 55, 55, 1)',

			// Tooltip colors
			tooltipBgDark: 'rgba(38, 46, 54, 0.75)',
			tooltipBgLight: 'rgba(241, 247, 255, 0.75)',

			// Sizes for large screens
			largeScreen: width >= 1920 || isMobile,

			// Animation
			animationDuration: fakeOrders ? 0 : 1500,

			// Doughnut chart settings
			borderWidth: 0,
			hoverOffset: (width * 0.5) / 100,

			// Tooltip settings
			tooltipTitleAlign: 'center',
			tooltipBodyAlign: 'right',

			// Legend settings
			legendPosition: 'top',
			usePointStyle: true,
		}),
		[width, isMobile, fakeOrders]
	)

	const getTooltipLabel = context => {
		const count = context.dataset.data[context.dataIndex]

		return `${t('page.table.chart_loss')}: ${count || 0}`
	}

	const currentData = syncWarning !== '' ? fakeOrders : [totalProfit, totalLoss]

	const data = useMemo(
		() => ({
			labels: [t('page.table.chart_income'), t('page.table.chart_lession')],
			datasets: [
				{
					data: currentData,
					backgroundColor: theme
						? [chartStyles.backgroundGreenDark, chartStyles.backgroundRedDark]
						: [
								chartStyles.backgroundGreenLight,
								chartStyles.backgroundRedLight,
						  ],
					borderRadius: chartStyles.margin,
					borderWidth: chartStyles.borderWidth,
					hoverOffset: chartStyles.hoverOffset,
					offset: [chartStyles.chartOffset, 0],
				},
			],
		}),
		[theme, currentData, chartStyles, t]
	)

	const options = useMemo(
		() => ({
			cutout: chartStyles.chartCutout,
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
						label: getTooltipLabel,
					},
				},
			},
		}),
		[theme, chartStyles, t, getTooltipLabel]
	)

	return (
		<div
			className={styles.doughnut_chart}
			style={{
				opacity: `${
					syncWarning !== '' || serverStatus === 'error' ? '0.2' : '1'
				}`,
				pointerEvents: `${
					syncWarning !== '' || serverStatus === 'error' ? 'none' : 'auto'
				}`,
			}}
		>
			<Doughnut data={data} options={options} />

			<div className={styles.doughnut_chart_bottom}>
				<div className={styles.doughnut_chart_desc}>
					<RootDesc>
						<span>{t('page.table.chart_profit')}</span>
						<strong
							style={{
								color: `var(--${
									color ? colorizedNum(totalProfit, true) : 'text'
								})`,
							}}
						>
							{syncWarning !== '' || serverStatus === 'error'
								? 650
								: totalProfit > 0
								? `+${totalProfit}`
								: totalProfit}
						</strong>
					</RootDesc>
				</div>

				<div className={styles.doughnut_chart_desc}>
					<RootDesc>
						<span>{t('page.table.chart_loss')}</span>
						<strong
							style={{
								color: `var(--${
									color ? colorizedNum(totalLoss, true) : 'text'
								})`,
							}}
						>
							{syncWarning !== '' || serverStatus === 'error'
								? -350
								: totalLoss}
						</strong>
					</RootDesc>
				</div>
			</div>
		</div>
	)
}
