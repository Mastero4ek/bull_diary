import React, { useEffect } from 'react'

import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { PageLayout } from '@/components/layouts/core/PageLayout'
import { useNotification } from '@/components/layouts/specialized/NotificationLayout/NotificationProvider'
import { OuterBlock } from '@/components/layouts/utils/OuterBlock'
import { Loader } from '@/components/ui/feedback/Loader'
import {
	clearTransactions,
	getBybitTransactions,
} from '@/redux/slices/transactionSlice'
import { getBybitWallet } from '@/redux/slices/walletSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import { Info } from './Info'
import { LineChart } from './LineChart'

export const WalletPage = React.memo(() => {
	const { t } = useTranslation()
	const { exchange, date } = useSelector(state => state.filters)
	const dispatch = useDispatch()
	const { serverStatus } = useSelector(state => state.wallet)
	const { serverStatus: transactionsStatus } = useSelector(
		state => state.transactions
	)
	const { showSuccess, showError } = useNotification()
	const syncWarning = useSelector(state => state.sync.warning)
	const isSynced = useSelector(state => state.sync.isSynced)

	const startOfYear = moment().startOf('year').format('YYYY-MM-DD')
	const today = moment().format('YYYY-MM-DD')

	const handleClickUpdate = async () => {
		if (!isSynced) {
			showError(t('page.table.sync_required_error'))
			return
		}

		try {
			const [walletResult, transactionsResult] = await Promise.all([
				dispatch(
					getBybitWallet({
						exchange: exchange.name,
						start_time: date.start_date,
						end_time: date.end_date,
					})
				),
				dispatch(
					getBybitTransactions({
						exchange: exchange.name,
						start_time: startOfYear,
						end_time: today,
						sort: { type: 'transactionTime', value: 'desc' },
						search: '',
						page: 1,
						limit: 10000,
					})
				),
			])

			const walletPromiseResult = unwrapResult(walletResult)
			const transactionsPromiseResult = unwrapResult(transactionsResult)

			if (walletPromiseResult && transactionsPromiseResult) {
				showSuccess(t('page.wallet.update_success'))
			} else {
				showError(t('page.wallet.update_error'))
			}
		} catch (e) {
			showError(t('page.wallet.update_error'))
			console.log(e)
		}
	}

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date && isSynced) {
			dispatch(
				getBybitWallet({
					exchange: exchange.name,
					start_time: date.start_date,
					end_time: date.end_date,
				})
			)
			dispatch(
				getBybitTransactions({
					exchange: exchange.name,
					start_time: startOfYear,
					end_time: today,
					sort: { type: 'transactionTime', value: 'desc' },
					search: '',
					page: 1,
					limit: 10000,
				})
			)
		}
	}, [exchange, date, dispatch, isSynced])

	useEffect(() => {
		return () => {
			dispatch(clearTransactions())
		}
	}, [dispatch])

	const isLoading =
		serverStatus === 'loading' || transactionsStatus === 'loading'

	return (
		<PageLayout
			chartWidth={720}
			update={handleClickUpdate}
			periods={true}
			minDate={moment().subtract(180, 'days').toDate()}
		>
			{isLoading && <Loader />}

			<Info syncWarning={syncWarning} />

			<OuterBlock>
				<LineChart syncWarning={syncWarning} />
			</OuterBlock>
		</PageLayout>
	)
})
