import React, { useCallback, useEffect } from 'react'

import moment from 'moment/min/moment-with-locales'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PageLayout } from '@/components/layouts/PageLayout'
import { TableLayout } from '@/components/layouts/TableLayout'
import { ControlButton } from '@/components/ui/buttons/ControlButton'
import { Loader } from '@/components/ui/general/Loader'
import { Mark } from '@/components/ui/general/Mark'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { capitalize, colorizedNum } from '@/helpers/functions'
import { clearTickers, getBybitTickers } from '@/redux/slices/filtersSlice'
import {
	clearOrders,
	getBybitOrdersPnl,
	savedOrder,
	setPage,
	setSort,
} from '@/redux/slices/ordersSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import { DoughnutChart } from './DougnutChart'

export const TablePage = () => {
	const { t } = useTranslation()
	const location = useLocation()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { showSuccess, showError } = useNotification()
	const syncWarning = useSelector(state => state.sync.warning)
	const isSynced = useSelector(state => state.sync.isSynced)

	const { mark, color, amount } = useSelector(state => state.settings)
	const { date, limit, search, exchange, tickers } = useSelector(
		state => state.filters
	)
	const {
		fakeOrders,
		orders,
		totalPages,
		sort,
		page,
		errorMessage,
		serverStatus,
	} = useSelector(state => state.orders)

	const tickerOptions = tickers.map(ticker => ({
		value: ticker.symbol,
		label: ticker.symbol,
	}))

	const columns = [
		{
			Header: t('table.closed_time'),
			accessor: 'closed_time',
			Cell: ({ cell: { value } }) => (
				<span>
					{moment(value).format('DD/MM/YYYY')}
					<br />
					<span style={{ fontWeight: '400', opacity: '0.5' }}>
						{moment(value).format('HH:mm:ss')}
					</span>
				</span>
			),
			width: '100%',
		},
		{ Header: t('table.symbol'), accessor: 'symbol', width: '100%' },
		{
			Header: t('table.direction'),
			accessor: 'direction',
			Cell: ({ cell: { value } }) => (
				<div style={{ display: 'flex', alignItems: 'center' }}>
					{mark && <Mark color={value === 'Sell' ? 'green' : 'red'} />}

					{capitalize(value === 'Sell' ? t('table.long') : t('table.short'))}
				</div>
			),
			width: '100%',
		},
		{
			Header: t('table.qty'),
			accessor: 'quality',
			Cell: ({ cell: { value } }) => (
				<>{amount ? '****' : parseFloat(value).toFixed(4)}</>
			),
			width: '100%',
		},
		{
			Header: t('table.margin'),
			accessor: 'margin',
			Cell: ({ cell: { value } }) => (
				<>{amount ? '****' : parseFloat(value).toFixed(2)}</>
			),
			width: '100%',
		},
		{
			Header: t('table.pnl'),
			accessor: 'pnl',
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
					).toFixed(2)}
				</span>
			),
			width: '100%',
		},
		{
			Header: t('table.roi'),
			accessor: 'roi',
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
					).toFixed(2)}
				</span>
			),
			width: '100%',
		},
		{
			Header: t('table.actions'),
			accessor: 'actions',
			Cell: ({ row }) => {
				return (
					<div
						style={{
							display: 'flex',
							gap: '15rem',
							justifyContent: 'flex-end',
						}}
					>
						<ControlButton
							icon={'view'}
							disabled={orders.length === 0}
							onClickBtn={() => handleClickView(row.original)}
						/>

						<ControlButton
							icon={'save'}
							disabled={orders.length === 0 || row.original.bookmark}
							onClickBtn={() => handleClickSave(row.original)}
						/>
					</div>
				)
			},
			width: 130,
		},
	]

	const goToPage = pageIndex => {
		dispatch(setPage(pageIndex + 1))
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

	const handleClickUpdate = async () => {
		if (!isSynced) {
			showError(t('page.table.sync_required_error'))
			return
		}

		try {
			const resultAction = await dispatch(
				getBybitOrdersPnl({
					exchange: exchange.name,
					sort,
					search,
					page,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
				})
			)

			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				showSuccess(t('page.table.update_success'))
			} else {
				showError(t('page.table.update_error'))
			}
		} catch (e) {
			showError(t('page.table.update_error'))
			console.log(e)
		}
	}

	const handleClickView = useCallback(
		item => {
			const id = item?.id

			navigate(`/table/position/${id}`, { state: { item } })
		},
		[navigate]
	)

	const handleClickSave = useCallback(
		async item => {
			if (!isSynced) {
				showError(t('page.table.sync_required_error'))
				return
			}

			try {
				const resultAction1 = await dispatch(
					savedOrder({ order: item, exchange: exchange.name })
				)
				const originalPromiseResult1 = unwrapResult(resultAction1)

				const resultAction2 = await dispatch(
					getBybitOrdersPnl({
						sort,
						search,
						page,
						limit,
						start_time: date.start_date,
						end_time: date.end_date,
						exchange: exchange.name,
					})
				)
				const originalPromiseResult2 = unwrapResult(resultAction2)

				if (originalPromiseResult1 && originalPromiseResult2) {
					showSuccess(t('page.table.save_order_success'))
				} else {
					showError(t('page.table.save_order_error'))
				}
			} catch (e) {
				showError(t('page.table.save_order_error'))
				console.log(e)
			}
		},
		[
			dispatch,
			exchange.name,
			date.start_date,
			date.end_date,
			showSuccess,
			showError,
			sort,
			search,
			page,
			limit,
			isSynced,
		]
	)

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date && isSynced) {
			dispatch(setPage(1))

			dispatch(
				getBybitOrdersPnl({
					exchange: exchange.name,
					sort,
					search,
					page: 1,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
				})
			)
		}
	}, [limit, dispatch, isSynced, exchange, date, sort, search])

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date && isSynced) {
			dispatch(
				getBybitOrdersPnl({
					exchange: exchange.name,
					sort,
					search,
					page,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
				})
			)
		}
	}, [dispatch, exchange, date, sort, search, page, limit, isSynced])

	useEffect(() => {
		return () => {
			dispatch(clearOrders())
		}
	}, [location])

	useEffect(() => {
		dispatch(getBybitTickers({ exchange: exchange.name }))

		return () => {
			dispatch(clearTickers())
		}
	}, [dispatch, exchange.name])

	return (
		<PageLayout
			chartWidth={460}
			update={handleClickUpdate}
			periods={true}
			calendar={true}
			search={true}
			searchOptions={tickerOptions}
			entries={true}
			placeholder={t('filter.search.ticker_placeholder')}
			searchPlaceholder={t('filter.search.ticker_placeholder')}
		>
			{serverStatus === 'loading' && <Loader />}

			<div style={{ width: '100%' }}>
				<TableLayout
					columns={columns}
					fakeData={fakeOrders}
					data={orders}
					totalPages={totalPages}
					error={errorMessage}
					serverStatus={serverStatus}
					page={page}
					toPage={goToPage}
					sortBy={sortBy}
					emptyWarn={errorMessage || t('page.table.empty')}
					syncWarn={syncWarning}
				/>
			</div>

			<OuterBlock>
				<DoughnutChart syncWarning={syncWarning} />
			</OuterBlock>
		</PageLayout>
	)
}
