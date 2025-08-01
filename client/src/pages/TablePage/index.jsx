import React, { useCallback, useEffect } from 'react'

import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PageLayout } from '@/components/layouts/PageLayout'
import { TableLayout } from '@/components/layouts/TableLayout'
import { ControlButton } from '@/components/ui/buttons/ControlButton'
import { Loader } from '@/components/ui/general/Loader'
import { Mark } from '@/components/ui/general/Mark'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { capitalize } from '@/helpers/functions'
import {
	clearOrders as clearBookmarksOrders,
	getBybitSavedOrders,
	savedOrder,
} from '@/redux/slices/bookmarksOrdersSlice'
import {
	clearOrders,
	getBybitOrdersPnl,
	setPage,
	setSort,
} from '@/redux/slices/ordersSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import { DoughnutChart } from './DougnutChart'

export const TablePage = () => {
	const location = useLocation()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { showSuccess, showError } = useNotification()

	const { mark, color, amount } = useSelector(state => state.settings)
	const { date, limit, search, exchange } = useSelector(state => state.filters)
	const {
		fakeOrders,
		orders,
		totalPages,
		sort,
		page,
		errorMessage,
		serverStatus,
	} = useSelector(state => state.orders)

	const {
		bookmarks,
		serverStatus: bookmarksServerStatus,
		errorMessage: bookmarksErrorMessage,
	} = useSelector(state => state.bookmarks)

	const columns = [
		{ Header: 'Symbol', accessor: 'symbol', width: '100%' },
		{
			Header: 'Date',
			accessor: 'closed_time',
			Cell: ({ cell: { value } }) => (
				<span>{moment(value).format('DD/MM/YYYY')}</span>
			),
			width: '100%',
		},
		{
			Header: 'Direction',
			accessor: 'direction',
			Cell: ({ cell: { value } }) => (
				<div style={{ display: 'flex', alignItems: 'center' }}>
					{mark && <Mark color={value === 'long' ? 'green' : 'red'} />}

					{capitalize(value)}
				</div>
			),
			width: '100%',
		},
		{
			Header: 'Qty',
			accessor: 'quality',
			Cell: ({ cell: { value } }) => <>{amount ? '****' : value}</>,
			width: '100%',
		},
		{
			Header: 'Margin',
			accessor: 'margin',
			Cell: ({ cell: { value } }) => <>{amount ? '****' : value}</>,
			width: '100%',
		},
		{
			Header: 'Pnl',
			accessor: 'pnl',
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
			Header: 'Roe%',
			accessor: 'roe',
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
			Header: 'Actions',
			accessor: 'actions',
			Cell: ({ row }) => {
				const isBookmarked =
					Array.isArray(bookmarks) &&
					bookmarks.some(bookmark => bookmark.id === row.original.id)

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
							disabled={fakeOrders}
							onClickBtn={() => handleClickView(row.original)}
						/>

						<ControlButton
							icon={'save'}
							disabled={fakeOrders || isBookmarked}
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
		try {
			const resultAction1 = await dispatch(
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

			const resultAction2 = await dispatch(
				getBybitSavedOrders({
					sort: null,
					search: null,
					page: null,
					limit: null,
					start_time: date.start_date,
					end_time: date.end_date,
					exchange: exchange.name,
					all: true,
				})
			)

			const originalPromiseResult1 = unwrapResult(resultAction1)
			const originalPromiseResult2 = unwrapResult(resultAction2)

			if (originalPromiseResult1 && originalPromiseResult2) {
				showSuccess('Orders updated successfully!')
			} else {
				showError('Error updating orders! Please try again.')
			}
		} catch (e) {
			showError('Error updating orders! Please try again.')
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
			try {
				const resultAction1 = await dispatch(
					savedOrder({ order: item, exchange: exchange.name })
				)
				const originalPromiseResult1 = unwrapResult(resultAction1)

				const resultAction2 = await dispatch(
					getBybitSavedOrders({
						sort: null,
						search: null,
						page: null,
						limit: null,
						start_time: date.start_date,
						end_time: date.end_date,
						exchange: exchange.name,
						all: true,
					})
				)
				const originalPromiseResult2 = unwrapResult(resultAction2)

				if (originalPromiseResult1 && originalPromiseResult2) {
					showSuccess('Order saved successfully!')
				} else {
					showError('Error saving order! Please try again.')
				}
			} catch (e) {
				showError('Error saving order! Please try again.')
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
		]
	)

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date) {
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

			dispatch(
				getBybitSavedOrders({
					sort: null,
					search: null,
					page: null,
					limit: null,
					start_time: date.start_date,
					end_time: date.end_date,
					exchange: exchange.name,
					all: true,
				})
			)
		}
	}, [limit, dispatch])

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date) {
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

			dispatch(
				getBybitSavedOrders({
					sort: null,
					search: null,
					page: null,
					limit: null,
					start_time: date.start_date,
					end_time: date.end_date,
					exchange: exchange.name,
					all: true,
				})
			)
		}
	}, [dispatch, exchange, date, sort, search, page])

	useEffect(() => {
		return () => {
			dispatch(clearOrders())
			dispatch(clearBookmarksOrders())
		}
	}, [location])

	return (
		<PageLayout
			chartWidth={460}
			update={handleClickUpdate}
			periods={true}
			calendar={true}
			search={true}
			entries={true}
		>
			{(serverStatus === 'loading' || bookmarksServerStatus === 'loading') && (
				<Loader />
			)}

			<div style={{ width: '100%' }}>
				<TableLayout
					columns={columns}
					fakeData={fakeOrders}
					data={orders}
					totalPages={totalPages}
					error={errorMessage || bookmarksErrorMessage}
					serverStatus={
						serverStatus === 'error' || bookmarksServerStatus === 'error'
							? 'error'
							: serverStatus
					}
					page={page}
					toPage={goToPage}
					sortBy={sortBy}
					emptyWarn={
						errorMessage ||
						bookmarksErrorMessage ||
						'There were no closed transactions during this period!'
					}
				/>
			</div>

			<OuterBlock>
				<DoughnutChart />
			</OuterBlock>
		</PageLayout>
	)
}
