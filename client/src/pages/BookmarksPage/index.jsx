import React, { useCallback, useEffect } from 'react'

import moment from 'moment/min/moment-with-locales'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PageLayout } from '@/components/layouts/PageLayout'
import { DescLayout } from '@/components/layouts/PageLayout/DescLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { TableLayout } from '@/components/layouts/TableLayout'
import { ControlButton } from '@/components/ui/buttons/ControlButton'
import { Loader } from '@/components/ui/general/Loader'
import { Mark } from '@/components/ui/general/Mark'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { capitalize, colorizedNum } from '@/helpers/functions'
import { ConfirmPopup } from '@/popups/ConfirmPopup'
import { clearTickers, getBybitTickers } from '@/redux/slices/filtersSlice'
import {
	clearOrders,
	getBybitOrdersPnl,
	removedOrder,
	setPage,
	setSort,
} from '@/redux/slices/ordersSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import styles from './styles.module.scss'

export const BookmarksPage = React.memo(() => {
	const { t } = useTranslation()
	const { openPopup } = usePopup()
	const location = useLocation()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { showSuccess, showError } = useNotification()
	const syncWarning = useSelector(state => state.sync.warning)
	const isSynced = useSelector(state => state.sync.isSynced)

	const { mark, color, amount, help, isTablet, isMobile } = useSelector(
		state => state.settings
	)
	const { date, limit, search, exchange, tickers } = useSelector(
		state => state.filters
	)
	const {
		orders,
		fakeOrders,
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
		},
		{
			Header: t('table.symbol'),
			accessor: 'symbol',
			Cell: ({ cell: { value } }) => (
				<span style={{ fontSize: isTablet ? '22rem' : '18rem' }}>{value}</span>
			),
		},
		{
			Header: t('table.direction'),
			accessor: 'direction',
			Cell: ({ cell: { value } }) => (
				<div style={{ display: 'flex', alignItems: 'center' }}>
					{mark && <Mark color={value === 'long' ? 'green' : 'red'} />}

					{capitalize(value === 'long' ? t('table.buy') : t('table.sell'))}
				</div>
			),
		},
		{
			Header: t('table.qty'),
			accessor: 'quality',
			Cell: ({ cell: { value } }) => (
				<>{amount ? '****' : parseFloat(value).toFixed(4)}</>
			),
		},
		{
			Header: t('table.margin'),
			accessor: 'margin',
			Cell: ({ cell: { value } }) => (
				<>{amount ? '****' : parseFloat(value).toFixed(2)}</>
			),
		},
		{
			Header: t('table.pnl'),
			accessor: 'pnl',
			Cell: ({ cell: { value } }) => (
				<span
					style={{
						color: `var(--${color ? colorizedNum(value, true) : 'text'})`,
						fontSize: isTablet ? '22rem' : '18rem',
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
		},
		{
			Header: t('table.roi'),
			accessor: 'roi',
			Cell: ({ cell: { value } }) => (
				<span
					style={{
						color: `var(--${color ? colorizedNum(value, true) : 'text'})`,
						fontSize: isTablet ? '22rem' : '18rem',
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
		},
		{
			Header: t('table.actions'),
			accessor: 'actions',
			Cell: ({ row }) => (
				<div
					style={{
						display: 'flex',
						gap: '15rem',
						justifyContent: 'flex-end',
					}}
				>
					<ControlButton
						icon={'view'}
						disabled={!orders || orders.length === 0}
						onClickBtn={() => handleClickView(row.original)}
					/>

					<div className={styles.bookmarks_delete_button}>
						<ControlButton
							icon={'cross'}
							disabled={!orders || orders.length === 0}
							onClickBtn={() => handleClickRemove(row.original)}
						/>
					</div>
				</div>
			),
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
					sort,
					search,
					page,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
					exchange: exchange.name,
					bookmarks: true,
				})
			)
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				showSuccess(t('page.bookmarks.update_success'))
			} else {
				showError(t('page.bookmarks.update_error'))
			}
		} catch (e) {
			showError(t('page.bookmarks.update_error'))
			console.log(e)
		}
	}

	const handleClickView = useCallback(
		item => {
			const id = item?.id

			navigate(`/bookmarks/position/${id}`, { state: { item } })
		},
		[navigate]
	)

	const removeBookmark = useCallback(
		async item => {
			if (!isSynced) {
				showError(t('page.table.sync_required_error'))
				return
			}

			try {
				const resultAction1 = await dispatch(
					removedOrder({
						order: item,
						exchange: exchange.name,
					})
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
						bookmarks: true,
					})
				)
				const originalPromiseResult2 = unwrapResult(resultAction2)

				if (originalPromiseResult1 && originalPromiseResult2) {
					showSuccess(t('page.bookmarks.remove_order_success'))
				} else {
					showError(t('page.bookmarks.remove_order_error'))
				}
			} catch (e) {
				showError(t('page.bookmarks.remove_order_error'))
				console.log(e)
			}
		},
		[
			dispatch,
			exchange.name,
			sort,
			search,
			date.start_date,
			date.end_date,
			page,
			limit,
			showSuccess,
			showError,
			isSynced,
		]
	)

	const handleClickRemove = item => {
		openPopup(
			<ConfirmPopup
				subtitle={t('popup.confirm.bookmark_remove_subtitle')}
				onClickConfirm={() => removeBookmark(item)}
			/>,
			{ shared: true }
		)
	}

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date && isSynced) {
			dispatch(setPage(1))

			dispatch(
				getBybitOrdersPnl({
					sort,
					search,
					page: 1,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
					exchange: exchange.name,
					bookmarks: true,
				})
			)
		}
	}, [limit, dispatch, isSynced, exchange, date, sort, search])

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date && isSynced) {
			dispatch(
				getBybitOrdersPnl({
					sort,
					search,
					page,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
					exchange: exchange.name,
					bookmarks: true,
				})
			)
		}
	}, [dispatch, exchange, date, sort, page, search, limit, isSynced])

	useEffect(() => {
		if ((!orders || orders.length === 0) && serverStatus === 'success') {
			dispatch(setPage(1))
		}
	}, [orders])

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
			chartWidth={help && isTablet && isMobile ? 0 : 460}
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

			{(!help || (!isTablet && !isMobile)) && (
				<OuterBlock>
					<DescLayout
						icon={'mark'}
						title={
							<span
								dangerouslySetInnerHTML={{ __html: t('page.bookmarks.title') }}
							></span>
						}
						description={
							<span
								dangerouslySetInnerHTML={{
									__html: t('page.bookmarks.subtitle'),
								}}
							></span>
						}
					/>
				</OuterBlock>
			)}
		</PageLayout>
	)
})
