import React, { useCallback } from 'react'

import { useSelector } from 'react-redux'

import bear from '@/assets/images/levels/bear.png'
import bull from '@/assets/images/levels/bull.png'
import hamster from '@/assets/images/levels/hamster.png'
import shark from '@/assets/images/levels/shark.png'
import whale from '@/assets/images/levels/whale.png'
import { SharedButton } from '@/components/ui/buttons/SharedButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { ErrorTable } from '@/components/ui/general/ErrorTable'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { H2 } from '@/components/ui/titles/H2'
import { SharedWalletPopup } from '@/popups/SharedWalletPopup'

import styles from './styles.module.scss'

const levelImages = { hamster, bear, bull, shark, whale }

export const Info = React.memo(() => {
	const { user } = useSelector(state => state.candidate)
	const { color, amount } = useSelector(state => state.settings)
	const { wallet, fakeWallet, serverStatus, errorMessage } = useSelector(
		state => state.wallet
	)

	const currentLevel = useCallback(() => {
		return levelImages[user?.level?.name] || levelImages.hamster
	}, [])

	const statsList = [
		{
			id: 0,
			name: 'Wallet Balance',
			type: 'balance',
			value: fakeWallet?.total_balance || wallet?.total_balance,
		},
		{
			id: 1,
			name: 'Unrealised PNL',
			type: 'pnl',
			value: fakeWallet?.unrealised_pnl || wallet?.unrealised_pnl,
		},
		{
			id: 2,
			name: 'Total Profit',
			type: 'profit',
			value: fakeWallet?.total_profit || wallet?.total_profit,
		},
		{
			id: 3,
			name: 'Total Loss',
			type: 'loss',
			value: fakeWallet?.total_loss || wallet?.total_loss,
		},
		{
			id: 4,
			name: 'Net Profit/Loss',
			type: 'net',
			value: fakeWallet?.net_profit || wallet?.net_profit,
		},
		{
			id: 5,
			name: 'Wining Trades',
			type: 'win_trades',
			value: fakeWallet?.wining_trades || wallet?.wining_trades,
		},
		{
			id: 6,
			name: 'Losing Trades',
			type: 'los_trades',
			value: fakeWallet?.losing_trades || wallet?.losing_trades,
		},
		{
			id: 7,
			name: 'Winrate',
			type: 'winrate',
			value: fakeWallet?.winrate || wallet?.winrate,
		},
	]

	return (
		<div style={{ marginBottom: 'auto' }}>
			<OuterBlock>
				{(serverStatus === 'error' || errorMessage) && (
					<ErrorTable error={errorMessage} />
				)}

				<div
					className={styles.info_wrapper}
					style={{ opacity: `${fakeWallet ? '0.2' : '1'}` }}
				>
					<div className={styles.info_level}>
						<InnerBlock>
							<img src={currentLevel()} alt='level-image' />
						</InnerBlock>
					</div>

					<div className={styles.info_stats}>
						<div className={styles.info_stats_head}>
							<H2>
								<span>Overview</span>
							</H2>

							<SharedButton
								disabled={fakeWallet}
								popup={<SharedWalletPopup />}
							/>
						</div>

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
													<span>
														{amount
															? '***'
															: Number(stat?.value || 0).toFixed(2)}{' '}
													</span>
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
					</div>
				</div>
			</OuterBlock>
		</div>
	)
})
