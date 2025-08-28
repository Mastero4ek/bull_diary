import React, { useCallback, useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PageLayout } from '@/components/layouts/PageLayout'
import { TableLayout } from '@/components/layouts/TableLayout'
import { ControlButton } from '@/components/ui/buttons/ControlButton'
import { SharedButton } from '@/components/ui/buttons/SharedButton'
import { Loader } from '@/components/ui/general/Loader'
import { Mark } from '@/components/ui/general/Mark'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { colorizedNum } from '@/helpers/functions'
import { useClientFiltering } from '@/hooks/useClientFiltering'
import { useWebSocket } from '@/hooks/useWebSocket'
import { SharedPositionPopup } from '@/popups/SharedPositionPopup'
import { clearTickers, getBybitTickers } from '@/redux/slices/filtersSlice'
import {
	setPage,
	setServerStatus,
	setSort,
} from '@/redux/slices/positionsSlice'

import { BarChart } from './BarChart'

export const DiaryPage = React.memo(() => {
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { showSuccess } = useNotification()

	const { connect, subscribeToPositions } = useWebSocket()
	const { mark, color, amount, isTablet } = useSelector(state => state.settings)
	const { exchange, search, limit, tickers } = useSelector(
		state => state.filters
	)
	const { fakeData: fakePositions, data: positions } = useSelector(
		state => state.positions
	)
	const { page, sort, serverStatus, errorMessage } = useSelector(
		state => state.positions
	)

	const tickerOptions = tickers.map(ticker => ({
		value: ticker.symbol,
		label: ticker.symbol,
	}))

	const { filteredData: filteredPositions, totalPages: totalFilteredPages } =
		useClientFiltering(positions, { search, sort, page, limit }, [
			'symbol',
			'side',
			'direction',
		])

	const displayPositions = filteredPositions

	const columns = [
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

					{value === 'long' ? t('table.buy') : t('table.sell')}
				</div>
			),
		},
		{
			Header: t('table.leverage'),
			accessor: 'leverage',
			Cell: ({ cell: { value } }) => <span>{value}X</span>,
		},
		{
			Header: t('table.profit'),
			accessor: 'unrealisedPnl',
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
					).toFixed(4)}
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
						disabled={fakePositions}
						onClickBtn={() => handleClickView(row.original)}
					/>

					<SharedButton
						disabled={fakePositions}
						popup={<SharedPositionPopup />}
					/>
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
		try {
			dispatch(setServerStatus('loading'))

			connect()

			subscribeToPositions()
			showSuccess(t('page.diary.update_success'))
		} catch (error) {
			dispatch(setServerStatus('error'))
		} finally {
			dispatch(setServerStatus('success'))
		}
	}

	const handleClickView = useCallback(
		item => {
			const id = item?.id

			const positionData = {
				...item,
				profit: item.unrealisedPnl,
				open_time: item.updatedTime,
				closed_time: item.updatedTime,
			}

			navigate(`/diary/position/${id}`, { state: { item: positionData } })
		},
		[navigate]
	)

	useEffect(() => {
		if (page !== 1) {
			dispatch(setPage(1))
		}
	}, [search, limit, dispatch])

	useEffect(() => {
		dispatch(getBybitTickers({ exchange: exchange.name }))

		return () => {
			dispatch(clearTickers())
		}
	}, [dispatch, exchange.name])

	return (
		<PageLayout
			update={handleClickUpdate}
			chartWidth={700}
			search={true}
			searchOptions={tickerOptions}
			entries={true}
			total={true}
			placeholder={t('filter.search.ticker_placeholder')}
			searchPlaceholder={t('filter.search.ticker_placeholder')}
		>
			{serverStatus === 'loading' && <Loader />}

			<div style={{ width: '100%' }}>
				<TableLayout
					columns={columns}
					fakeData={fakePositions}
					data={displayPositions}
					totalPages={totalFilteredPages}
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
