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
import { useLocation } from 'react-router-dom';

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
import { ClosedContent } from '@/components/ui/general/ClosedContent';
import { CountdownTimer } from '@/components/ui/general/CountdownTimer';
import { InnerBlock } from '@/components/ui/general/InnerBlock';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { capitalize } from '@/helpers/functions';
import { ConfirmPopup } from '@/popups/ConfirmPopup';
import { NewTournamentPopup } from '@/popups/NewTournamentPopup';
import { getUser } from '@/redux/slices/candidateSlice';
import {
  addTournamentUser,
  clearTournaments,
  deleteTournament,
  getTournaments,
  removeTournamentUser,
  setPage,
  setSort,
} from '@/redux/slices/tournamentSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const BattlePage = () => {
	const { t } = useTranslation()
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
			Header: t('table.avatar'),
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
			Header: t('table.name'),
			accessor: row => `${row.name} ${row.last_name}`,
			width: '100%',
			Cell: ({ cell: { value }, row }) => (
				<>
					{row.original.name} {row.original.last_name}
				</>
			),
		},
		{
			Header: t('table.level'),
			accessor: 'level',
			Cell: ({ cell: { value } }) => <>{capitalize(value.name)}</>,
			width: '100%',
		},
		{
			Header: t('table.score'),
			accessor: 'level.value',
			Cell: ({ cell: { value } }) => <>{value}</>,
			width: '100%',
		},
		{
			Header: t('table.roe'),
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

	const removeUser = useCallback(
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
					showSuccess(t('page.battle.remove_user_success'))
				} else {
					showError(t('page.battle.remove_user_error'))
				}
			} catch (e) {
				console.log(e)
				if (e?.payload?.message) {
					showError(e.payload.message)
				} else {
					showError(t('page.battle.remove_user_error'))
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

	const handleClickDelete = item => {
		openPopup(
			<ConfirmPopup
				subtitle={t('popup.confirm.tournament_user_remove_subtitle')}
				onClickConfirm={() => removeUser(item)}
			/>,
			{ shared: true }
		)
	}

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
				showSuccess(t('page.battle.update_success'))
			} else {
				showError(t('page.battle.update_error'))
			}
		} catch (e) {
			showError(t('page.battle.update_error'))
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
					exchange: exchange.name,
					email: user.email,
					id: user?.id,
				})
			)
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				showSuccess(t('page.battle.join_user_success'))
			} else {
				showError(t('page.battle.join_user_error'))
			}
		} catch (e) {
			showError(t('page.battle.join_user_error'))
			console.log(e)
		}
	}, [dispatch, exchange.name, user.email, showSuccess, showError])

	const handleClickNewTournament = useCallback(() => {
		openPopup(<NewTournamentPopup />)
	}, [])

	const removeTournament = useCallback(async () => {
		try {
			if (!tournament?._id) return

			const resultAction = await dispatch(deleteTournament(tournament._id))
			const originalPromiseResult = unwrapResult(resultAction)

			if (originalPromiseResult) {
				showSuccess(t('page.battle.remove_battle_success'))
			} else {
				showError(t('page.battle.remove_battle_error'))
			}
		} catch (e) {
			showError(t('page.battle.remove_battle_error'))
			console.log(e)
		}
	}, [dispatch, tournament, showSuccess, showError])

	const handleClickDeleteTournament = () => {
		openPopup(
			<ConfirmPopup
				subtitle={t('popup.confirm.tournament_remove_subtitle')}
				onClickConfirm={() => removeTournament()}
			/>,
			{ shared: true }
		)
	}

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
					emptyWarn={errorMessage || t('page.battle.empty_users')}
				/>
			</div>

			<OuterBlock>
				<DescLayout
					icon={'cup'}
					title={
						tournament?.name ? (
							tournament?.name || ''
						) : (
							<span
								dangerouslySetInnerHTML={{ __html: t('page.battle.title') }}
							></span>
						)
					}
					description={
						tournament?.description ? (
							tournament?.description || ''
						) : (
							<span
								dangerouslySetInnerHTML={{ __html: t('page.battle.subtitle') }}
							></span>
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
									icon={'cross'}
									text={t('button.remove_battle')}
									onClickBtn={handleClickDeleteTournament}
								/>
							</div>
						)}

						{user?.role === 'admin' && !tournament?.name && (
							<RootButton
								onClickBtn={handleClickNewTournament}
								text={t('button.new_battle')}
								icon={'join'}
							/>
						)}

						{tournament?.registration_date && (
							<RootButton
								disabled={alreadyJoined || registrationClosed}
								onClickBtn={handleClickJoin}
								text={t('button.join')}
								icon={'join'}
							>
								{(alreadyJoined || registrationClosed) && (
									<ClosedContent
										title={
											alreadyJoined
												? t('closed_title.already_joined')
												: registrationClosed
												? t('closed_title.registr_closed')
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
