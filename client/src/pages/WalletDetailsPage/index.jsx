import React, { useEffect } from 'react'

import moment from 'moment/min/moment-with-locales'
import { useDispatch, useSelector } from 'react-redux'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PageLayout } from '@/components/layouts/PageLayout'
import { TableLayout } from '@/components/layouts/TableLayout'
import { Loader } from '@/components/ui/general/Loader'
import { Mark } from '@/components/ui/general/Mark'
import {
	getBybitTransactions,
	setPage,
	setSort,
} from '@/redux/slices/walletSlice'
import { unwrapResult } from '@reduxjs/toolkit'

export const WalletDetailsPage = React.memo(() => {
	const dispatch = useDispatch()

	const { mark, color, amount } = useSelector(state => state.settings)
	const {
		transactions,
		transactionsStatus,
		transactionsErrorMessage,
		transactionsTotalPages,
		fakeTransactions,
		page,
		sort,
	} = useSelector(state => state.wallet)
	const { exchange, date, limit, search } = useSelector(state => state.filters)
	const { showSuccess, showError } = useNotification()

	const getTransactionTypeLabel = type => {
		const typeLabels = {
			TRANSFER_IN: 'Transfer In', // Перевод в кошелек
			TRANSFER_OUT: 'Transfer Out', // Перевод из кошелька
			TRADE: 'Trade', // Торговая операция
			SETTLEMENT: 'Settlement', // Расчет по финансированию
			DELIVERY: 'Delivery', // Поставка
			LIQUIDATION: 'Liquidation', // Ликвидация
			ADL: 'Auto-Deleveraging', // Автоматическое снижение плеча
			AIRDROP: 'Airdrop', // Аирдроп
			BONUS: 'Bonus', // Полученный бонус
			BONUS_RECOLLECT: 'Bonus Recollect', // Истекший бонус
			FEE_REFUND: 'Fee Refund', // Возврат комиссии
			INTEREST: 'Interest', // Проценты по займу
			CURRENCY_BUY: 'Currency Buy', // Покупка валюты
			CURRENCY_SELL: 'Currency Sell', // Продажа валюты
			AUTO_DEDUCTION: 'Auto Deduction', // Автоматическое списание
		}

		return typeLabels[type] || type || ''
	}

	const columns = [
		{
			Header: 'Date',
			accessor: 'transactionTime',
			Cell: ({ cell: { value }, row: { original } }) => (
				<span>
					{moment(original.date).format('DD/MM/YYYY')} - {original.time}
				</span>
			),
			width: '100%',
		},
		{
			Header: 'Symbol',
			accessor: 'symbol',
			Cell: ({ cell: { value } }) => <span>{value || '-'}</span>,
			width: '100%',
		},
		{
			Header: 'Side',
			accessor: 'side',
			Cell: ({ cell: { value } }) => (
				<div style={{ display: 'flex', alignItems: 'center' }}>
					{mark && (
						<Mark
							color={
								value === 'Buy' ? 'green' : value === 'Sell' ? 'red' : 'gray'
							}
						/>
					)}
					<span>{value || '-'}</span>
				</div>
			),
			width: '100%',
		},
		{
			Header: 'Type',
			accessor: 'type',
			Cell: ({ cell: { value } }) => (
				<span>{getTransactionTypeLabel(value)}</span>
			),
			width: '100%',
		},
		{
			Header: 'Funding',
			accessor: 'funding',
			Cell: ({ cell: { value } }) => (
				<span
					style={
						color ? { color: `var(--${value < 0 ? 'red' : 'green'})` } : {}
					}
				>
					{amount ? '****' : value}
				</span>
			),
			width: '100%',
		},
		{
			Header: 'Fee',
			accessor: 'fee',
			Cell: ({ cell: { value } }) => (
				<span
					style={
						color ? { color: `var(--${value < 0 ? 'red' : 'green'})` } : {}
					}
				>
					{amount ? '****' : value}
				</span>
			),
			width: '100%',
		},
		{
			Header: 'Balance',
			accessor: 'cashBalance',
			Cell: ({ cell: { value } }) => (
				<span style={{ textAlign: 'right' }}>{amount ? '****' : value}</span>
			),
			width: '100%',
		},
	]

	const goToPage = pageIndex => {
		dispatch(setPage(pageIndex + 1))
	}

	const handleClickUpdate = async () => {
		try {
			const resultAction = await dispatch(
				getBybitTransactions({
					exchange: exchange.name,
					start_time: date.start_date,
					end_time: date.end_date,
					sort,
					search,
					page,
					limit,
				})
			)

			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				showSuccess('Transactions updated successfully!')
			} else {
				showError('Error updating transactions! Please try again.')
			}
		} catch (e) {
			showError('Error updating transactions! Please try again.')
			console.log(e)
		}
	}

	const sortBy = column => {
		if (sort.type === column.id) {
			dispatch(
				setSort({
					type: column.id,
					value: sort.value === 'asc' ? 'desc' : 'asc',
				})
			)
		} else {
			dispatch(setSort({ type: column.id, value: 'desc' }))
		}
	}

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date) {
			dispatch(setPage(1))

			dispatch(
				getBybitTransactions({
					exchange: exchange.name,
					start_time: date.start_date,
					end_time: date.end_date,
					sort,
					search,
					page: 1,
					limit,
				})
			)
		}
	}, [limit, dispatch])

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date) {
			dispatch(
				getBybitTransactions({
					exchange: exchange.name,
					start_time: date.start_date,
					end_time: date.end_date,
					sort,
					search,
					page,
					limit,
				})
			)
		}
	}, [dispatch, exchange, date, sort, page, search])

	return (
		<PageLayout
			update={handleClickUpdate}
			disabled={transactionsStatus === 'loading'}
			entries={true}
			periods={true}
			search={true}
		>
			{transactionsStatus === 'loading' && <Loader />}

			<div style={{ width: '100%' }}>
				<TableLayout
					error={transactionsErrorMessage}
					serverStatus={transactionsStatus}
					toPage={goToPage}
					totalPages={transactionsTotalPages}
					page={page}
					columns={columns}
					data={transactions}
					fakeData={fakeTransactions}
					emptyWarn={
						transactionsErrorMessage ||
						'There were no transactions during this period!'
					}
					sortBy={sortBy}
				/>
			</div>
		</PageLayout>
	)
})
