import React, {
  useCallback,
  useEffect,
} from 'react';

import moment from 'moment';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import avatarDefault from '@/assets/images/general/default_avatar.png';
import {
  useNotification,
} from '@/components/layouts/NotificationLayout/NotificationProvider';
import { PageLayout } from '@/components/layouts/PageLayout';
import { DescLayout } from '@/components/layouts/PageLayout/DescLayout';
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider';
import { TableLayout } from '@/components/layouts/TableLayout';
import { ControlButton } from '@/components/ui/buttons/ControlButton';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { NewUserPopup } from '@/popups/NewUserPopup';
import { RemoveUserPopup } from '@/popups/RemoveUserPopup';
import { getUser } from '@/redux/slices/candidateSlice';
import {
  clearUsers,
  getUsers,
  setPage,
  setSort,
} from '@/redux/slices/usersSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const UsersPage = () => {
	const location = useLocation()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { openPopup } = usePopup()
	const { showSuccess, showError } = useNotification()

	const { search, limit, date } = useSelector(state => state.filters)
	const {
		fakeUsers,
		users,
		serverStatus,
		errorMessage,
		page,
		totalPages,
		sort,
	} = useSelector(state => state.users)
	const { user } = useSelector(state => state.candidate)

	const columns = [
		{
			Header: 'Avatar',
			accessor: 'cover',
			Cell: ({ cell: { value } }) => (
				<img
					src={value || avatarDefault}
					alt='avatar'
					style={{
						width: '40rem',
						height: '40rem',
						borderRadius: '50%',
						objectFit: 'cover',
					}}
				/>
			),
			width: 100,
		},
		{
			Header: 'Name',
			accessor: 'name',
			width: '100%',
			Cell: ({ cell: { value }, row }) => (
				<>
					{value} {row.original.last_name}
				</>
			),
		},
		{
			Header: 'Email',
			accessor: 'email',
			width: '100%',
		},
		{
			Header: 'Created at',
			accessor: 'created_at',
			Cell: ({ cell: { value } }) => <>{moment(value).format('DD/MM/YYYY')}</>,
			width: '100%',
		},
		{
			Header: 'Updated at',
			accessor: 'updated_at',
			Cell: ({ cell: { value } }) => <>{moment(value).format('DD/MM/YYYY')}</>,
			width: '100%',
		},
		{
			Header: 'Actions',
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
						disabled={fakeUsers}
						icon={'view'}
						onClickBtn={() => handleClickView(row.original)}
					/>

					<div className={styles.battle_delete_button}>
						<ControlButton
							disabled={fakeUsers}
							icon={'cross'}
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

	const handleClickRemove = useCallback(
		async item => {
			openPopup(<RemoveUserPopup item={item} />, { shared: true })
		},
		[openPopup]
	)

	const handleClickUpdate = async () => {
		try {
			const resultAction = await dispatch(
				getUsers({
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
				showSuccess('Users updated successfully!')
			} else {
				showError('Error updating users! Please try again.')
			}
		} catch (e) {
			showError('Error updating users! Please try again.')
			console.log(e)
		}
	}

	const handleClickView = useCallback(
		item => {
			const id = item?._id

			navigate(`/all-users/${id}`, { state: { item } })
		},
		[navigate]
	)

	const handleClickAddUser = useCallback(() => {
		openPopup(<NewUserPopup />)
	}, [navigate])

	useEffect(() => {
		if (date?.start_date && date?.end_date) {
			dispatch(setPage(1))

			dispatch(
				getUsers({
					sort,
					search,
					page: 1,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
				})
			)
		}
	}, [limit, dispatch])

	useEffect(() => {
		if (date?.start_date && date?.end_date) {
			dispatch(
				getUsers({
					sort,
					search,
					page,
					limit,
					start_time: date.start_date,
					end_time: date.end_date,
				})
			)
		}
	}, [dispatch, date, sort, page, search])

	useEffect(() => {
		return () => {
			dispatch(clearUsers())

			if (user?.id) {
				dispatch(getUser(user.id))
			}
		}
	}, [location, dispatch, user?.id])

	return (
		<PageLayout
			update={handleClickUpdate}
			chartWidth={400}
			entries={true}
			periods={true}
		>
			<div style={{ width: '100%' }}>
				<TableLayout
					columns={columns}
					fakeData={fakeUsers}
					data={users}
					totalPages={totalPages}
					error={errorMessage}
					serverStatus={serverStatus}
					page={page}
					toPage={goToPage}
					sortBy={sortBy}
					emptyWarn={errorMessage || 'No users found in this period!'}
				/>
			</div>

			<OuterBlock>
				<DescLayout
					icon={'all-users'}
					title={'Platform users'}
					description={
						'Registered users of the platform. You can view their profiles and their statistics.'
					}
				>
					{user && user?.role === 'admin' && (
						<RootButton
							icon={'sign-up'}
							text={'Create user'}
							onClickBtn={() => handleClickAddUser()}
						/>
					)}
				</DescLayout>
			</OuterBlock>
		</PageLayout>
	)
}
