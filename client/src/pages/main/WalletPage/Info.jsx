import React, { useCallback } from 'react'

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import bear from '@/assets/images/levels/bear.png'
import bull from '@/assets/images/levels/bull.png'
import hamster from '@/assets/images/levels/hamster.png'
import shark from '@/assets/images/levels/shark.png'
import whale from '@/assets/images/levels/whale.png'
import { InnerBlock } from '@/components/layouts/utils/InnerBlock'
import { OuterBlock } from '@/components/layouts/utils/OuterBlock'
import { SharedButton } from '@/components/ui/buttons/SharedButton'
import { ErrorTable } from '@/components/ui/feedback/ErrorTable'
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'
import { H2 } from '@/components/ui/typography/titles/H2'
import { SharedWalletPopup } from '@/popups/data/SharedWalletPopup'

import styles from './styles.module.scss'

const levelImages = { hamster, bear, bull, shark, whale }

export const Info = React.memo(({ syncWarning = '' }) => {
	const { t } = useTranslation()
	const { user } = useSelector(state => state.candidate)
	const { color, amount, isTablet } = useSelector(state => state.settings)
	const { wallet, fakeWallet, serverStatus, errorMessage } = useSelector(
		state => state.wallet
	)

	const currentLevel = useCallback(() => {
		return levelImages[user?.level?.name] || levelImages.hamster
	}, [])

	const data = syncWarning !== '' ? fakeWallet : wallet

	const statsList = [
		{
			id: 0,
			name: t('page.wallet.balance'),
			type: 'balance',
			value: data?.total_balance,
		},
		{
			id: 1,
			name: t('page.wallet.unrealized'),
			type: 'pnl',
			value: data?.unrealised_pnl,
		},
		{
			id: 2,
			name: t('page.wallet.total_profit'),
			type: 'profit',
			value: data?.total_profit,
		},
		{
			id: 3,
			name: t('page.wallet.total_loss'),
			type: 'loss',
			value: data?.total_loss,
		},
		{
			id: 4,
			name: t('page.wallet.net_profit'),
			type: 'net',
			value: data?.net_profit,
		},
		{
			id: 5,
			name: t('page.wallet.win_trades'),
			type: 'win_trades',
			value: data?.wining_trades,
		},
		{
			id: 6,
			name: t('page.wallet.los_trades'),
			type: 'los_trades',
			value: data?.losing_trades,
		},
		{
			id: 7,
			name: t('page.wallet.winrate'),
			type: 'winrate',
			value: data?.winrate,
		},
	]

	return (
		<div style={{ marginBottom: 'auto' }}>
			<OuterBlock>
				{syncWarning !== '' && <ErrorTable error={syncWarning} />}

				{(serverStatus === 'error' || errorMessage) && (
					<ErrorTable error={errorMessage || t('page.wallet.error')} />
				)}

				<div
					className={styles.info_wrapper}
					style={{
						opacity: `${
							syncWarning !== '' || serverStatus === 'error' ? '0.2' : '1'
						}`,
					}}
				>
					<div className={styles.info_level}>
						<InnerBlock>
							<img src={currentLevel()} alt='level-image' />
						</InnerBlock>
					</div>

					<div className={styles.info_stats}>
						<div className={styles.info_stats_head}>
							<H2>
								<span>{t('page.wallet.overview')}</span>
							</H2>

							<SharedButton
								disabled={syncWarning !== '' || serverStatus === 'error'}
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
											{stat?.type === 'balance' || stat?.type === 'pnl' ? (
												<span
													style={{
														fontSize:
															stat?.type === 'balance' && isTablet
																? '22rem'
																: '18rem',
													}}
												>
													{stat?.type === 'balance' && <b>~</b>}

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

													<b>{stat?.type === 'balance' ? 'USD' : 'USDT'}</b>
												</span>
											) : stat?.type === 'win_trades' ||
											  stat?.type === 'los_trades' ? (
												<span>{amount ? '****' : stat?.value}</span>
											) : stat?.type === 'winrate' ? (
												<span
													style={{
														fontSize: isTablet ? '22rem' : '18rem',
													}}
												>
													<span>
														{amount
															? '***'
															: Number(stat?.value || 0).toFixed(2)}{' '}
													</span>
													<span>%</span>
												</span>
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
