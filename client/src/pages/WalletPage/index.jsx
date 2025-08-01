import React, { useEffect } from 'react'

import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PageLayout } from '@/components/layouts/PageLayout'
import { Loader } from '@/components/ui/general/Loader'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { getBybitWalletAndChanges } from '@/redux/slices/walletSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import { Info } from './Info'
import { LineChart } from './LineChart'

export const WalletPage = React.memo(() => {
	const { exchange, date } = useSelector(state => state.filters)
	const dispatch = useDispatch()
	const { serverStatus } = useSelector(state => state.wallet)
	const { showSuccess, showError } = useNotification()

	const handleClickUpdate = async () => {
		try {
			const resultAction = await dispatch(
				getBybitWalletAndChanges({
					exchange: exchange.name,
					start_time: date.start_date,
					end_time: date.end_date,
				})
			)

			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				showSuccess('Wallet updated successfully!')
			} else {
				showError('Error updating wallet! Please try again.')
			}
		} catch (e) {
			showError('Error updating wallet! Please try again.')
			console.log(e)
		}
	}

	useEffect(() => {
		dispatch(
			getBybitWalletAndChanges({
				exchange: exchange.name,
				start_time: date.start_date,
				end_time: date.end_date,
			})
		)
	}, [exchange, date])

	return (
		<PageLayout
			chartWidth={720}
			update={handleClickUpdate}
			periods={true}
			calendar={true}
			minDate={moment().subtract(180, 'days').toDate()}
		>
			{serverStatus === 'loading' && <Loader />}

			<Info />

			<OuterBlock>
				<LineChart />
			</OuterBlock>
		</PageLayout>
	)
})
