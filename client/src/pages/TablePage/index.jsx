import React, {
  useCallback,
  useEffect,
} from 'react';

import moment from 'moment/min/moment-with-locales';
import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  useNotification,
} from '@/components/layouts/NotificationLayout/NotificationProvider';
import { PageLayout } from '@/components/layouts/PageLayout';
import { TableLayout } from '@/components/layouts/TableLayout';
import { ControlButton } from '@/components/ui/buttons/ControlButton';
import { Loader } from '@/components/ui/general/Loader';
import { Mark } from '@/components/ui/general/Mark';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import {
  capitalize,
  colorizedNum,
} from '@/helpers/functions';
import {
  clearOrders as clearBookmarksOrders,
  getBybitSavedOrders,
  savedOrder,
} from '@/redux/slices/bookmarksOrdersSlice';
import {
  clearOrders,
  getBybitOrdersPnl,
  setPage,
  setSort,
} from '@/redux/slices/ordersSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import { DoughnutChart } from './DougnutChart';

export const TablePage = () => {
	const { t } = useTranslation()
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
			Cell: ({ cell: { value }, row: { original } }) => (
				<div style={{ display: 'flex', alignItems: 'center' }}>
					{mark && <Mark color={value === 'long' ? 'green' : 'red'} />}

					{capitalize(value === 'long' ? t('table.buy') : t('table.sell'))}
				</div>
			),
			width: '100%',
		},
		{
			Header: t('table.qty'),
			accessor: 'quality',
			Cell: ({ cell: { value } }) => <>{amount ? '****' : value}</>,
			width: '100%',
		},
		{
			Header: t('table.margin'),
			accessor: 'margin',
			Cell: ({ cell: { value } }) => <>{amount ? '****' : value}</>,
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
					{amount
						? '****'
						: value === 0
						? '0.0000'
						: value > 0
						? `+${value}`
						: value}
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
					{amount
						? '****'
						: value === 0
						? '0.0000'
						: value > 0
						? `+${value}`
						: value}
				</span>
			),
			width: '100%',
		},
		{
			Header: t('table.actions'),
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
						errorMessage || bookmarksErrorMessage || t('page.table.empty')
					}
				/>
			</div>

			<OuterBlock>
				<DoughnutChart />
			</OuterBlock>
		</PageLayout>
	)
}
