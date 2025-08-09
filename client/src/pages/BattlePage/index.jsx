import React, { useCallback, useEffect } from 'react'

import moment from 'moment/min/moment-with-locales'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import avatarDefault from '@/assets/images/general/default_avatar.png'
import { useNotification } from '@/components/layouts/NotificationLayout/NotificationProvider'
import { PageLayout } from '@/components/layouts/PageLayout'
import { DescLayout } from '@/components/layouts/PageLayout/DescLayout'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { TableLayout } from '@/components/layouts/TableLayout'
import { ControlButton } from '@/components/ui/buttons/ControlButton'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { ClosedContent } from '@/components/ui/general/ClosedContent'
import { CountdownTimer } from '@/components/ui/general/CountdownTimer'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { capitalize } from '@/helpers/functions'
import { NewTournamentPopup } from '@/popups/NewTournamentPopup'
import { getUser } from '@/redux/slices/candidateSlice'
import {
	addTournamentUser,
	clearTournaments,
	deleteTournament,
	getTournaments,
	removeTournamentUser,
	setPage,
	setSort,
} from '@/redux/slices/tournamentSlice'
import { unwrapResult } from '@reduxjs/toolkit'

import styles from './styles.module.scss'

export const BattlePage = () => {
	const { openPopup } = usePopup()
	const location = useLocation()
	const dispatch = useDispatch()
	const { showSuccess, showError } = useNotification()

	const { color, amount } = useSelector(state => state.settings)
	const { search, limit } = useSelector(state => state.filters)
	const {
		tournament,
		fakeUsers,
		users,
		serverStatus,
		errorMessage,
		page,
		totalPages,
		sort,
	} = useSelector(state => state.tournaments)
	const { user } = useSelector(state => state.candidate)
	const { exchange } = useSelector(state => state.filters)

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
			accessor: row => `${row.name} ${row.last_name}`,
			width: '100%',
			Cell: ({ cell: { value }, row }) => (
				<>
					{row.original.name} {row.original.last_name}
				</>
			),
		},
		{
			Header: 'Level',
			accessor: 'level',
			Cell: ({ cell: { value } }) => <>{capitalize(value.name)}</>,
			width: '100%',
		},
		{
			Header: 'Score',
			accessor: 'level.value',
			Cell: ({ cell: { value } }) => <>{value}</>,
			width: '100%',
		},
		{
			Header: 'Roe%',
			accessor: 'roe',
			Cell: ({ cell: { value = '0.0000' } }) => (
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
						icon={'challenge'}
						onClickBtn={() => handleClickBattle(row.original)}
					/>

					{user?.role === 'admin' && (
						<div className={styles.battle_delete_button}>
							<ControlButton
								disabled={fakeUsers}
								icon={'cross'}
								onClickBtn={() => handleClickDelete(row.original)}
							/>
						</div>
					)}
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

	const handleClickDelete = useCallback(
		async item => {
			try {
				const resultAction1 = await dispatch(
					removeTournamentUser({
						tournamentId: tournament._id,
						userId: item.id,
					})
				)
				const originalPromiseResult1 = unwrapResult(resultAction1)

				const resultAction2 = await dispatch(
					getTournaments({
						exchange: exchange.name,
						page,
						size: limit,
						search,
					})
				)
				const originalPromiseResult2 = unwrapResult(resultAction2)

				if (originalPromiseResult1 && originalPromiseResult2) {
					showSuccess('User removed from tournament!')
				} else {
					showError('Error removing user from tournament! Please try again.')
				}
			} catch (e) {
				console.log('Remove tournament user error:', e)
				if (e?.payload?.message) {
					showError(e.payload.message)
				} else {
					showError('Error removing user from tournament! Please try again.')
				}
			}
		},
		[
			dispatch,
			tournament,
			exchange.name,
			page,
			limit,
			search,
			showSuccess,
			showError,
		]
	)

	const handleClickUpdate = async () => {
		try {
			const resultAction = await dispatch(
				getTournaments({
					exchange: exchange.name,
					page,
					size: limit,
					search,
				})
			)
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				showSuccess('Tournament updated successfully!')
			} else {
				showError('Error updating tournament! Please try again.')
			}
		} catch (e) {
			showError('Error updating tournament! Please try again.')
			console.log(e)
		}
	}

	const handleClickBattle = useCallback(item => {
		console.log('Battle clicked:', item)
	}, [])

	const handleClickJoin = useCallback(async () => {
		try {
			const resultAction = await dispatch(
				addTournamentUser({
					exchange: capitalize(exchange.name),
					email: user.email,
					id: user?.id,
				})
			)
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				showSuccess('You have joined the tournament!')
			} else {
				showError('Error joining tournament! Please try again.')
			}
		} catch (e) {
			showError('Error joining tournament! Please try again.')
			console.log(e)
		}
	}, [dispatch, exchange.name, user.email, showSuccess, showError])

	const handleClickNewTournament = useCallback(() => {
		openPopup(<NewTournamentPopup />)
	}, [])

	const handleClickDeleteTournament = useCallback(async () => {
		try {
			if (!tournament?._id) return

			const resultAction = await dispatch(deleteTournament(tournament._id))
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				showSuccess('Tournament deleted successfully!')
			} else {
				showError('Error deleting tournament! Please try again.')
			}
		} catch (e) {
			showError('Error deleting tournament! Please try again.')
			console.log(e)
		}
	}, [dispatch, tournament, showSuccess, showError])

	useEffect(() => {
		if (exchange?.name) {
			dispatch(setPage(1))

			dispatch(
				getTournaments({
					exchange: exchange.name,
					page: 1,
					size: limit,
					search,
				})
			)
		}
	}, [limit, dispatch])

	useEffect(() => {
		if (exchange?.name) {
			dispatch(
				getTournaments({
					exchange: exchange.name,
					page,
					size: limit,
					search,
				})
			)
		}
	}, [dispatch, exchange, sort, page, search])

	useEffect(() => {
		return () => {
			dispatch(clearTournaments())

			if (user?.id) {
				dispatch(getUser(user.id))
			}
		}
	}, [location, dispatch, user?.id])

	const registrationClosed = moment(tournament?.registration_date).isBefore(
		moment()
	)

	const alreadyJoined =
		users &&
		users.length > 0 &&
		users.some(participant => participant.id === user.id)

	return (
		<PageLayout
			update={handleClickUpdate}
			chartWidth={600}
			entries={true}
			search={true}
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
					emptyWarn={
						errorMessage ||
						'No tournament participants found for this tournament!'
					}
				/>
			</div>

			<OuterBlock>
				<DescLayout
					icon={'cup'}
					title={
						tournament?.name ? (
							tournament?.name || ''
						) : (
							<>
								Take part in the tournament <br /> for the title of the best
								trader
							</>
						)
					}
					description={
						tournament?.description ? (
							tournament?.description || ''
						) : (
							<>
								Lorem ipsum, dolor sit amet consectetur adipisicing elit.
								Explicabo, provident unde! Quasi repellendus enim minus
								blanditiis dolore, saepe eligendi suscipit a nostrum sit,
								deleniti in commodi nemo perferendis, error qui?
							</>
						)
					}
				>
					{tournament?.cover && (
						<div className={styles.battle_cover}>
							<InnerBlock>
								<img src={tournament?.cover} alt='tournament' />
							</InnerBlock>
						</div>
					)}

					{tournament?.registration_date && (
						<div className={styles.battle_desc_bottom}>
							<CountdownTimer
								targetDate={tournament ? tournament?.start_date : new Date()}
							/>
						</div>
					)}

					<div className={styles.battle_desc_bottom_buttons}>
						{user?.role === 'admin' && tournament?.name && (
							<div className={styles.battle_desc_bottom_button_delete}>
								<RootButton
									// disabled={fakeUsers}
									icon={'cross'}
									text={'Delete tournament'}
									onClickBtn={handleClickDeleteTournament}
								/>
							</div>
						)}

						{user?.role === 'admin' && !tournament?.name && (
							<RootButton
								// disabled={fakeUsers}
								onClickBtn={handleClickNewTournament}
								text={'New tournament'}
								icon={'join'}
							/>
						)}

						{tournament?.registration_date && (
							<RootButton
								disabled={alreadyJoined || registrationClosed}
								onClickBtn={handleClickJoin}
								text={'Join'}
								icon={'join'}
							>
								{(alreadyJoined || registrationClosed) && (
									<ClosedContent
										title={
											alreadyJoined
												? 'You have already joined this tournament!'
												: registrationClosed
												? 'Registration is closed!'
												: ''
										}
										width={30}
									/>
								)}
							</RootButton>
						)}
					</div>
				</DescLayout>
			</OuterBlock>
		</PageLayout>
	)
}
