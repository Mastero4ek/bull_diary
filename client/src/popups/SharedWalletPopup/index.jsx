import React, { createRef, useCallback } from 'react'

import { useSelector } from 'react-redux'

import bear from '@/assets/images/levels/bear.png'
import bull from '@/assets/images/levels/bull.png'
import hamster from '@/assets/images/levels/hamster.png'
import shark from '@/assets/images/levels/shark.png'
import whale from '@/assets/images/levels/whale.png'
import { SharedPopupLayout } from '@/components/layouts/SharedPopupLayout'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { ErrorTable } from '@/components/ui/general/ErrorTable'
import { InnerBlock } from '@/components/ui/general/InnerBlock'

import styles from './styles.module.scss'

const levelImages = { hamster, bear, bull, shark, whale }

export const SharedWalletPopup = React.memo(() => {
	const { color, amount } = useSelector(state => state.settings)
	const { user } = useSelector(state => state.candidate)
	const {
		total_balance,
		total_profit,
		total_loss,
		wining_trades,
		losing_trades,
		net_profit,
		winrate,
		unrealised_pnl,
		serverStatus,
		errorMessage,
	} = useSelector(state => state.wallet)

	const ref = createRef(null)

	const currentLevel = useCallback(() => {
		return levelImages[user?.level?.name] || levelImages.hamster
	}, [])

	const statsList = [
		{
			id: 0,
			name: 'Wallet Balance',
			type: 'balance',
			value: total_balance,
		},
		{
			id: 1,
			name: 'Unrealised PNL',
			type: 'pnl',
			value: unrealised_pnl,
		},
		{
			id: 2,
			name: 'Total Profit',
			type: 'profit',
			value: total_profit,
		},
		{
			id: 3,
			name: 'Total Loss',
			type: 'loss',
			value: total_loss,
		},
		{
			id: 4,
			name: 'Net Profit/Loss',
			type: 'net',
			value: net_profit,
		},
		{
			id: 5,
			name: 'Wining Trades',
			type: 'win_trades',
			value: wining_trades,
		},
		{
			id: 6,
			name: 'Losing Trades',
			type: 'los_trades',
			value: losing_trades,
		},
		{
			id: 7,
			name: 'Winrate',
			type: 'winrate',
			value: winrate,
		},
	]

	return (
		<SharedPopupLayout ref={ref} popup_id={'wallet-info'} popup_name={'wallet'}>
			<div className={styles.info_avatar}>
				<InnerBlock>
					<img src={currentLevel()} alt='level' />
				</InnerBlock>
			</div>

			<div className={styles.info_stats}>
				{serverStatus !== 'error' && !errorMessage ? (
					<ul>
						{statsList &&
							statsList.length > 0 &&
							statsList.map(stat => (
								<li key={stat?.id}>
									<RootDesc>
										<span>{stat?.name}</span>
									</RootDesc>

									<RootDesc>
										{stat?.type === 'balance' && stat?.type === 'pnl' ? (
											<>
												<b
													style={
														color
															? {
																	color: `var(--${
																		stat?.value < 0 ? 'red' : 'green'
																	})`,
															  }
															: {}
													}
												>
													{amount ? '******' : stat?.value}{' '}
												</b>
												<b>USDT</b>
											</>
										) : stat?.type === 'win_trades' ||
										  stat?.type === 'los_trades' ? (
											<span>{amount ? '****' : stat?.value}</span>
										) : stat?.type === 'winrate' ? (
											<>
												<span>{amount ? '***' : stat?.value} </span>
												<span>%</span>
											</>
										) : (
											<>
												<span
													style={
														color
															? {
																	color: `var(--${
																		stat?.value < 0 ? 'red' : 'green'
																	})`,
															  }
															: {}
													}
												>
													{amount ? '******' : stat?.value}{' '}
												</span>
												<span>USDT</span>
											</>
										)}
									</RootDesc>
								</li>
							))}
					</ul>
				) : (
					<ErrorTable
						center={false}
						width={100}
						error={errorMessage || 'Something went wrong, try again later...'}
					/>
				)}
			</div>
		</SharedPopupLayout>
	)
})
