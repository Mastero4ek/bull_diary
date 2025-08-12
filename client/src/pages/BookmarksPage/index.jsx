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
import { DescLayout } from '@/components/layouts/PageLayout/DescLayout';
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider';
import { TableLayout } from '@/components/layouts/TableLayout';
import { ControlButton } from '@/components/ui/buttons/ControlButton';
import { Loader } from '@/components/ui/general/Loader';
import { Mark } from '@/components/ui/general/Mark';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { capitalize } from '@/helpers/functions';
import { ConfirmPopup } from '@/popups/ConfirmPopup';
import {
  clearOrders,
  getBybitSavedOrders,
  removedOrder,
  setPage,
  setSort,
} from '@/redux/slices/bookmarksOrdersSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const BookmarksPage = React.memo(() => {
	const { t } = useTranslation()
	const { openPopup } = usePopup()
	const location = useLocation()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { showSuccess, showError } = useNotification()

	const { mark, color, amount } = useSelector(state => state.settings)
	const { date, limit, search, exchange } = useSelector(state => state.filters)
	const {
		bookmarks,
		fakeOrders,
		totalPages,
		sort,
		page,
		errorMessage,
		serverStatus,
	} = useSelector(state => state.bookmarks)

	const columns = [
		{ Header: t('table.symbol'), accessor: 'symbol' },
		{
			Header: t('table.closed_time'),
			accessor: 'closed_time',
			Cell: ({ cell: { value } }) => (
				<span>{moment(value).format('DD/MM/YYYY')}</span>
			),
			width: '100%',
		},
		{
			Header: t('table.direction'),
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
			Header: t('table.roe'),
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
						disabled={fakeOrders}
						onClickBtn={() => handleClickView(row.original)}
					/>

					<div className={styles.bookmarks_delete_button}>
						<ControlButton
							icon={'cross'}
							disabled={fakeOrders}
							onClickBtn={() => handleClickRemove(row.original)}
						/>
					</div>
				</div>
			),
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
			const resultAction = await dispatch(
				getBybitSavedOrders({
					sort,
					search,
					page,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
					exchange: exchange.name,
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
			try {
				const resultAction1 = await dispatch(
					removedOrder({
						order: item,
						exchange: exchange.name,
						start_time: date.start_date,
						end_time: date.end_date,
					})
				)
				const originalPromiseResult1 = unwrapResult(resultAction1)

				const resultAction2 = await dispatch(
					getBybitSavedOrders({
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
			date.start_date,
			date.end_date,
			sort,
			search,
			page,
			limit,
			showSuccess,
			showError,
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
		if (exchange?.name && date?.start_date && date?.end_date) {
			dispatch(setPage(1))

			dispatch(
				getBybitSavedOrders({
					sort,
					search,
					page: 1,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
					exchange: exchange.name,
				})
			)
		}
	}, [limit, dispatch])

	useEffect(() => {
		if (exchange?.name && date?.start_date && date?.end_date) {
			dispatch(
				getBybitSavedOrders({
					sort,
					search,
					page,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
					exchange: exchange.name,
				})
			)
		}
	}, [dispatch, exchange, date, sort, page, search])

	useEffect(() => {
		if (bookmarks.length === 0 && serverStatus === 'success') {
			dispatch(setPage(1))
		}
	}, [bookmarks])

	useEffect(() => {
		return () => {
			dispatch(clearOrders())
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
			{serverStatus === 'loading' && <Loader />}

			<div style={{ width: '100%' }}>
				<TableLayout
					columns={columns}
					fakeData={fakeOrders}
					data={bookmarks}
					totalPages={totalPages}
					error={errorMessage}
					serverStatus={serverStatus}
					page={page}
					toPage={goToPage}
					sortBy={sortBy}
					emptyWarn={errorMessage || t('page.bookmarks.empty')}
				/>
			</div>

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
							dangerouslySetInnerHTML={{ __html: t('page.bookmarks.subtitle') }}
						></span>
					}
				/>
			</OuterBlock>
		</PageLayout>
	)
})
