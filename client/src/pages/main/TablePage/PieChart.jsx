import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'
import { calculateFakeTotals, colorizedNum } from '@/helpers/functions'
import { ResponsivePie } from '@nivo/pie'

import styles from './styles.module.scss'

export const PieChart = ({ syncWarning = '' }) => {
	const { t } = useTranslation()
	const { theme, width, isTablet, isMobile, color } = useSelector(
		state => state.settings
	)
	const { totalLoss, totalProfit, fakeOrders, serverStatus } = useSelector(
		state => state.orders
	)

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
			pieColorPositive: theme ? '#11958d' : '#28d5ca',
			pieColorNegative: theme
				? 'rgba(255, 55, 55, 1)'
				: 'rgba(255, 51, 100, 1)',
			textColor: theme ? 'rgba(185, 200, 215, 1)' : 'rgba(79, 104, 137, 1)',
		}),
		[width, isTablet, isMobile, theme]
	)

	const currentData = useMemo(() => {
		if (syncWarning !== '' || serverStatus === 'error') {
			const fakeTotals = calculateFakeTotals(fakeOrders)
			return [fakeTotals.totalProfit.value, fakeTotals.totalLoss.value]
		}
		return [totalProfit?.value || 0, totalLoss?.value || 0]
	}, [
		totalProfit?.value,
		totalLoss?.value,
		syncWarning,
		serverStatus,
		fakeOrders,
	])

	const currentCounts = useMemo(() => {
		if (syncWarning !== '' || serverStatus === 'error') {
			const fakeTotals = calculateFakeTotals(fakeOrders)
			return {
				profitCount: fakeTotals.totalProfit.count,
				lossCount: fakeTotals.totalLoss.count,
			}
		}
		return {
			profitCount: totalProfit?.count || 0,
			lossCount: totalLoss?.count || 0,
		}
	}, [
		totalProfit?.count,
		totalLoss?.count,
		syncWarning,
		serverStatus,
		fakeOrders,
	])

	// Функция для форматирования значения с плюсом для положительных чисел
	const formatValue = value => {
		const numValue = value || 0
		return numValue > 0 ? `+${numValue}` : numValue
	}

	const data = useMemo(() => {
		const chartData = [
			{
				id: t('page.table.chart_income'),
				label: t('page.table.chart_income'),
				value: Math.abs(currentData[0] || 0),
				color: chartStyles.pieColorPositive,
			},
			{
				id: t('page.table.chart_lession'),
				label: t('page.table.chart_lession'),
				value: Math.abs(currentData[1] || 0),
				color: chartStyles.pieColorNegative,
			},
		]

		return chartData.filter(item => item.value > 0)
	}, [currentData, chartStyles, t])

	const CustomTooltip = ({ datum }) => {
		if (!datum) return null

		const orderCount =
			datum.label === t('page.table.chart_income')
				? currentCounts.profitCount
				: currentCounts.lossCount

		return (
			<div className={styles.doughnut_chart_tooltip}>
				<RootDesc>
					<label>
						<b>{t('page.table.orders')}</b>
						{orderCount}
					</label>
				</RootDesc>
			</div>
		)
	}

	const CustomLegend = () => {
		return (
			<div className={styles.doughnut_chart_legend}>
				<div className={styles.doughnut_chart_legend_item}>
					<label
						style={{
							backgroundColor: chartStyles.pieColorPositive,
						}}
					/>
					<RootDesc>
						<span>{t('page.table.chart_income')}</span>
					</RootDesc>
				</div>

				<div className={styles.doughnut_chart_legend_item}>
					<label
						style={{
							backgroundColor: chartStyles.pieColorNegative,
						}}
					/>
					<RootDesc>
						<span>{t('page.table.chart_lession')}</span>
					</RootDesc>
				</div>
			</div>
		)
	}

	return (
		<div className={styles.doughnut_chart_wrapper}>
			<CustomLegend />

			<div
				className={styles.doughnut_chart}
				style={{
					position: 'relative',
					opacity: syncWarning !== '' || serverStatus === 'error' ? '0.2' : '1',
					pointerEvents:
						syncWarning !== '' || serverStatus === 'error' ? 'none' : 'auto',
				}}
			>
				<ResponsivePie
					data={data}
					innerRadius={0.6}
					padAngle={0.7}
					cornerRadius={chartStyles.margin}
					activeOuterRadiusOffset={chartStyles.margin}
					enableArcLabels={false}
					enableArcLinkLabels={false}
					colors={({ data }) => data.color}
					tooltip={CustomTooltip}
					legends={[]}
					animate={true}
					motionConfig='wobbly'
					motionStiffness={90}
					motionDamping={15}
					sortByValue={true}
					margin={{
						top: chartStyles.paddingSmall,
						bottom: chartStyles.paddingSmall,
						left: chartStyles.paddingSmall,
						right: chartStyles.paddingSmall,
					}}
				/>

				<div className={styles.doughnut_chart_title}>
					<RootDesc>
						<span
							dangerouslySetInnerHTML={{
								__html: `${t('page.table.all_orders')} ${
									currentCounts.profitCount + currentCounts.lossCount
								}`,
							}}
						></span>
					</RootDesc>
				</div>
			</div>

			<div className={styles.doughnut_chart_bottom}>
				<div className={styles.doughnut_chart_desc}>
					<RootDesc>
						<span>{t('page.table.chart_profit')}</span>

						<strong
							style={{
								color: `var(--${
									color ? colorizedNum(currentData[0] || 0, true) : 'text'
								})`,
							}}
						>
							{formatValue(currentData[0])}
						</strong>
					</RootDesc>
				</div>

				<div className={styles.doughnut_chart_desc}>
					<RootDesc>
						<span>{t('page.table.chart_loss')}</span>
						<strong
							style={{
								color: `var(--${
									color ? colorizedNum(currentData[1] || 0, true) : 'text'
								})`,
							}}
						>
							{currentData[1]}
						</strong>
					</RootDesc>
				</div>
			</div>
		</div>
	)
}
