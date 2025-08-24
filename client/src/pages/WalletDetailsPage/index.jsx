import React, { useCallback, useEffect } from 'react'

import moment from 'moment/min/moment-with-locales'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PageLayout } from '@/components/layouts/PageLayout'
import { TableLayout } from '@/components/layouts/TableLayout'
import { Icon } from '@/components/ui/general/Icon'
import { Loader } from '@/components/ui/general/Loader'
import { Mark } from '@/components/ui/general/Mark'
import { colorizedNum } from '@/helpers/functions'
import {
	clearTickers,
	getBybitTickers,
	setSearch,
} from '@/redux/slices/filtersSlice'
import {
	getBybitTransactions,
	setPage,
	setSort,
} from '@/redux/slices/transactionSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import styles from './styles.module.scss'

export const WalletDetailsPage = React.memo(() => {
	const dispatch = useDispatch()
	const { t } = useTranslation()

	const { mark, color, amount } = useSelector(state => state.settings)
	const {
		transactions,
		serverStatus,
		errorMessage,
		page,
		sort,
		totalPages,
		fakeTransactions,
	} = useSelector(state => state.transactions)
	const { exchange, date, limit, search, size, tickers } = useSelector(
		state => state.filters
	)
	const { showSuccess, showError } = useNotification()
	const syncWarning = useSelector(state => state.sync.warning)
	const isSynced = useSelector(state => state.sync.isSynced)

	const tickerOptions = tickers.map(ticker => ({
		value: ticker.symbol,
		label: ticker.symbol,
	}))

	const getTransactionTypeLabel = useCallback(
		type => {
			const typeLabels = {
				TRANSFER_IN: t('page.wallet_details.label.in'),
				TRANSFER_OUT: t('page.wallet_details.label.out'),
				TRADE: t('page.wallet_details.label.trade'),
				SETTLEMENT: t('page.wallet_details.label.settlement'),
				DELIVERY: t('page.wallet_details.label.delivery'),
				LIQUIDATION: t('page.wallet_details.label.liquidation'),
				ADL: t('page.wallet_details.label.adl'),
				AIRDROP: t('page.wallet_details.label.airdrop'),
				BONUS: t('page.wallet_details.label.bonus'),
				BONUS_RECOLLECT: t('page.wallet_details.label.recollect'),
				FEE_REFUND: t('page.wallet_details.label.fee'),
				INTEREST: t('page.wallet_details.label.interest'),
				CURRENCY_BUY: t('page.wallet_details.label.buy'),
				CURRENCY_SELL: t('page.wallet_details.label.sell'),
				AUTO_DEDUCTION: t('page.wallet_details.label.deducation'),
			}

			return typeLabels[type] || type || ''
		},
		[t]
	)

	const columns = [
		{
			Header: t('table.closed_time'),
			accessor: 'transactionTime',
			Cell: ({ row: { original } }) => (
				<span>
					{moment(original.date).format('DD/MM/YYYY')}
					<br />
					<span style={{ fontWeight: '400', opacity: '0.5' }}>
						{original.time}
					</span>
				</span>
			),
			width: '100%',
		},
		{
			Header: t('table.symbol'),
			accessor: 'symbol',
			Cell: ({ cell: { value }, row: { original } }) => (
				<span>{value || original.currency || ''}</span>
			),
			width: '100%',
		},
		{
			Header: t('table.side'),
			accessor: 'side',
			Cell: ({ cell: { value } }) => (
				<div style={{ display: 'flex', alignItems: 'center' }}>
					{mark && (
						<Mark
							color={
								value === 'Buy'
									? 'green'
									: value === 'Sell'
									? 'red'
									: 'disabled'
							}
						/>
					)}

					<span
						style={{
							color: `var(--${
								value !== 'Buy' && value !== 'Sell' ? 'disabled' : 'text'
							})`,
						}}
					>
						{value === 'Buy'
							? t('table.buy')
							: value === 'Sell'
							? t('table.sell')
							: t('table.none')}
					</span>
				</div>
			),
			width: '100%',
		},
		{
			Header: t('table.type'),
			accessor: 'type',
			Cell: ({ cell: { value } }) => (
				<b style={{ textTransform: 'uppercase' }}>
					{getTransactionTypeLabel(value)}
				</b>
			),
			width: '100%',
		},
		{
			Header: t('table.funding'),
			accessor: 'funding',
			Cell: ({ cell: { value } }) => (
				<span
					style={{
						color: `var(--${color ? colorizedNum(value, true) : 'text'})`,
					}}
				>
					{parseFloat(
						amount
							? '****'
							: value === 0
							? '0.0000'
							: value > 0
							? `+${value}`
							: value
					).toFixed(4)}
				</span>
			),
			width: '100%',
		},
		{
			Header: t('table.fee'),
			accessor: 'fee',
			Cell: ({ cell: { value } }) => (
				<span
					style={{
						color: `var(--${color ? colorizedNum(value, false) : 'text'})`,
					}}
				>
					{parseFloat(
						amount
							? '****'
							: value === 0
							? '0.0000'
							: value > 0
							? `-${value}`
							: value
					).toFixed(4)}
				</span>
			),
			width: '100%',
		},
		{
			Header: t('table.change'),
			accessor: 'change',
			Cell: ({ cell: { value } }) => (
				<span
					style={{
						color: `var(--${color ? colorizedNum(value, true) : 'text'})`,
					}}
				>
					{parseFloat(
						amount
							? '****'
							: value === 0
							? '0.0000'
							: value > 0
							? `+${value}`
							: value
					).toFixed(4)}
				</span>
			),
			width: '100%',
		},
		{
			Header: t('table.balance'),
			accessor: 'cashBalance',
			Cell: ({ cell: { value } }) => (
				<b
					style={{
						display: 'block',
						textAlign: 'right',
						color: `var(--${value === 0 ? 'disabled' : 'text'})`,
					}}
				>
					{amount
						? '****'
						: value === 0
						? '0.0000'
						: parseFloat(value).toFixed(4)}
				</b>
			),
			width: '100%',
		},
		{
			Header: '',
			accessor: 'actions',
			Cell: ({ row }) => (
				<div
					className={`${styles.info_table_icon} ${
						row.original.change > 0
							? styles.info_table_icon_up
							: styles.info_table_icon_down
					}`}
				>
					{row.original.change > 0 ? (
						<Icon id={'balance-up'} />
					) : (
						<Icon id={'balance-down'} />
					)}
				</div>
			),
			width: 130,
		},
	]

	const goToPage = pageIndex => {
		dispatch(setPage(pageIndex + 1))
	}

	const handleClickUpdate = async () => {
		if (!isSynced) {
			showError(t('page.table.sync_required_error'))
			return
		}

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
				showSuccess(t('page.wallet_details.update_success'))
			} else {
				showError(t('page.wallet_details.update_error'))
			}
		} catch (e) {
			showError(t('page.wallet_details.update_error'))
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
		if (exchange?.name && date?.start_date && date?.end_date && isSynced) {
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
					size,
				})
			)
		}
	}, [dispatch, isSynced, exchange, date, sort, search, limit, size])

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date && isSynced) {
			dispatch(
				getBybitTransactions({
					exchange: exchange.name,
					start_time: date.start_date,
					end_time: date.end_date,
					sort,
					search,
					page,
					limit,
					size,
				})
			)
		}
	}, [dispatch, exchange, date, sort, page, search, size, limit, isSynced])

	useEffect(() => {
		dispatch(getBybitTickers({ exchange: exchange.name }))

		return () => {
			dispatch(clearTickers())
			dispatch(setSearch(''))
		}
	}, [dispatch, exchange.name])

	return (
		<PageLayout
			update={handleClickUpdate}
			entries={true}
			periods={true}
			search={true}
			searchOptions={tickerOptions}
			placeholder={t('filter.search.ticker_placeholder')}
			searchPlaceholder={t('filter.search.ticker_placeholder')}
		>
			{serverStatus === 'loading' && <Loader />}

			<div style={{ width: '100%' }}>
				<TableLayout
					error={errorMessage}
					serverStatus={serverStatus}
					toPage={goToPage}
					totalPages={totalPages}
					page={page}
					columns={columns}
					data={transactions}
					fakeData={fakeTransactions.slice(0, 5)}
					emptyWarn={errorMessage || t('page.wallet_details.empty')}
					syncWarn={syncWarning}
					sortBy={sortBy}
				/>
			</div>
		</PageLayout>
	)
})
