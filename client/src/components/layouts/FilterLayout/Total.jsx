import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import styles from './styles.module.scss'

// import io from 'socket.io-client'

// const socket = io(process.env.REACT_APP_API_URL)

export const Total = React.memo(() => {
	const { amount, color } = useSelector(state => state.settings)
	const { serverStatus, fakePositions } = useSelector(state => state.positions)
	const unrealisedPnl = fakePositions ? 0.0 : 100
	const realisedPnl = fakePositions ? 0.0 : -20
	// const [realPrice, setRealPrice] = useState(null)

	// useEffect(() => {
	// 	socket.on('data', data => {
	// 		if (data.data.bid1Price) {
	// 			setRealPrice(data.data.bid1Price)
	// 		}
	// 	})

	// 	return () => {
	// 		socket.off('data')
	// 	}
	// }, [])

	return (
		<div className={styles.total_wrapper}>
			<OuterBlock>
				{/* <pre>{realPrice}</pre> */}

				<div className={styles.total}>
					<div className={styles.unrealized}>
						<RootDesc>
							<b>UPnl :</b>
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
							<b>RPnl :</b>
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
