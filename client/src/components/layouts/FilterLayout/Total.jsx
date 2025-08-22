import React from 'react'

import { useSelector } from 'react-redux'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { OuterBlock } from '@/components/ui/general/OuterBlock'

import styles from './styles.module.scss'

export const Total = React.memo(() => {
	const { amount, color } = useSelector(state => state.settings)
	const { serverStatus, fakePositions } = useSelector(state => state.websocket)
	const unrealisedPnl = fakePositions ? 0.0 : 100
	const realisedPnl = fakePositions ? 0.0 : -20

	return (
		<div className={styles.total_wrapper}>
			<OuterBlock>
				<div className={styles.total}>
					<div className={styles.unrealized}>
						<RootDesc>
							<b>UP&L :</b>
						</RootDesc>

						<RootDesc>
							<strong
								style={
									color
										? {
												color: `var(--${unrealisedPnl < 0 ? 'red' : 'green'})`,
										  }
										: {}
								}
							>
								{amount ? '****' : fakePositions ? 0.0 : unrealisedPnl}
							</strong>
						</RootDesc>

						<RootDesc>
							<span>USDT</span>
						</RootDesc>
					</div>

					<div className={styles.realized}>
						<RootDesc>
							<b>RP&L :</b>
						</RootDesc>

						<RootDesc>
							<strong
								style={
									color
										? {
												color: `var(--${realisedPnl < 0 ? 'red' : 'green'})`,
										  }
										: {}
								}
							>
								{amount ? '****' : fakePositions ? 0.0 : realisedPnl}
							</strong>
						</RootDesc>

						<RootDesc>
							<span>USDT</span>
						</RootDesc>
					</div>
				</div>
			</OuterBlock>
		</div>
	)
})
