import React, {
  useCallback,
  useEffect,
} from 'react';

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
import { SharedButton } from '@/components/ui/buttons/SharedButton';
import { Loader } from '@/components/ui/general/Loader';
import { Mark } from '@/components/ui/general/Mark';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { colorizedNum } from '@/helpers/functions';
import { SharedPositionPopup } from '@/popups/SharedPositionPopup';
import {
  clearPositions,
  getBybitPositions,
  setPage,
  setSort,
} from '@/redux/slices/positionsSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import { BarChart } from './BarChart';

export const DiaryPage = React.memo(() => {
	const { t } = useTranslation()
	const location = useLocation()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { showSuccess, showError } = useNotification()
	const { mark, color, amount } = useSelector(state => state.settings)
	const { exchange, search, limit } = useSelector(state => state.filters)
	const {
		positions,
		fakePositions,
		totalPages,
		page,
		sort,
		serverStatus,
		errorMessage,
	} = useSelector(state => state.positions)

	const columns = [
		{ Header: t('table.symbol'), accessor: 'symbol', width: '100%' },
		{
			Header: t('table.direction'),
			accessor: 'direction',
			Cell: ({ cell: { value } }) => (
				<div style={{ display: 'flex', alignItems: 'center' }}>
					{mark && <Mark color={value === 'long' ? 'green' : 'red'} />}

					{value === 'long' ? t('table.buy') : t('table.sell')}
				</div>
			),
			width: '100%',
		},
		{
			Header: t('table.leverage'),
			accessor: 'leverage',
			Cell: ({ cell: { value } }) => <span>{value}X</span>,
			width: '100%',
		},
		{
			Header: t('table.profit'),
			accessor: 'profit',
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
						disabled={fakePositions}
						onClickBtn={() => handleClickView(row.original)}
					/>

					<SharedButton
						disabled={fakePositions}
						popup={<SharedPositionPopup />}
					/>
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
				getBybitPositions({
					exchange: exchange.name,
					sort,
					search,
					page,
					limit,
				})
			)
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				showSuccess(t('page.diary.update_success'))
			} else {
				showError(t('page.diary.update_error'))
			}
		} catch (e) {
			showError(t('page.diary.update_error'))
			console.log(e)
		}
	}

	const handleClickView = useCallback(
		item => {
			const id = item?.id

			navigate(`/diary/position/${id}`, { state: { item } })
		},
		[navigate]
	)

	useEffect(() => {
		if (exchange?.name) {
			dispatch(setPage(1))

			dispatch(
				getBybitPositions({
					exchange: exchange.name,
					sort,
					search,
					page: 1,
					limit,
				})
			)
		}
	}, [limit, dispatch])

	useEffect(() => {
		if (exchange?.name) {
			dispatch(
				getBybitPositions({
					exchange: exchange.name,
					sort,
					search,
					page,
					limit,
				})
			)
		}
	}, [dispatch, exchange, sort, page, search])

	useEffect(() => {
		return () => {
			dispatch(clearPositions())
		}
	}, [location])

	return (
		<PageLayout
			update={handleClickUpdate}
			chartWidth={700}
			search={true}
			entries={true}
			total={true}
		>
			{serverStatus === 'loading' && <Loader />}
			<div style={{ width: '100%' }}>
				<TableLayout
					columns={columns}
					fakeData={fakePositions}
					data={positions}
					totalPages={totalPages}
					error={errorMessage}
					serverStatus={serverStatus}
					page={page}
					toPage={goToPage}
					sortBy={sortBy}
					emptyWarn={errorMessage || t('page.diary.empty')}
				/>
			</div>

			<OuterBlock>
				<BarChart />
			</OuterBlock>
		</PageLayout>
	)
})
