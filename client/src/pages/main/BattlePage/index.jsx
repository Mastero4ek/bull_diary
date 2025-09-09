import {
  useCallback,
  useEffect,
} from 'react';

import moment from 'moment/min/moment-with-locales';
import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

import avatarDefault from '@/assets/images/general/default_avatar.png';
import { PageLayout } from '@/components/layouts/core/PageLayout';
import { DescLayout } from '@/components/layouts/core/PageLayout/DescLayout';
import {
  usePopup,
} from '@/components/layouts/popups/PopupLayout/PopupProvider';
import {
  useNotification,
} from '@/components/layouts/specialized/NotificationLayout/NotificationProvider';
import { TableLayout } from '@/components/layouts/specialized/TableLayout';
import { ClosedContent } from '@/components/layouts/utils/ClosedContent';
import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { ControlButton } from '@/components/ui/buttons/ControlButton';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { CountdownTimer } from '@/components/ui/data/CountdownTimer';
import {
  capitalize,
  colorizedNum,
} from '@/helpers/functions';
import { useTableActions } from '@/hooks/useTableActions';
import { useWebSocket } from '@/hooks/useWebSocket';
import { NewTournamentPopup } from '@/popups/data/NewTournamentPopup';
import { ConfirmPopup } from '@/popups/system/ConfirmPopup';
import { getUser } from '@/redux/slices/candidateSlice';
import { setSearch } from '@/redux/slices/filtersSlice';
import {
  addTournamentUser,
  clearTournaments,
  clearTournamentUsersList,
  deleteTournament,
  getTournamentUsersList,
  removeTournamentUser,
  setPage,
  setSort,
} from '@/redux/slices/tournamentSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const BattlePage = () => {
  const { t } = useTranslation();
  const { openPopup } = usePopup();
  const dispatch = useDispatch();
  const { updateTournamentSubscription, subscribeToTournaments } =
    useWebSocket();

  const { showSuccess, showError } = useNotification();

  const { color, amount, isTablet } = useSelector((state) => state.settings);
  const { search, limit } = useSelector((state) => state.filters);
  const { tournamentUsersList } = useSelector((state) => state.tournaments);
  const {
    tournament,
    fakeUsers,
    users,
    serverStatus,
    errorMessage,
    page,
    totalPages,
    sort,
  } = useSelector((state) => state.tournaments);
  const { user } = useSelector((state) => state.candidate);
  const { exchange } = useSelector((state) => state.filters);

  const { goToPage, sortBy } = useTableActions(setPage, setSort, sort);

  const columns = [
    {
      Header: t('table.avatar'),
      accessor: 'cover',
      Cell: ({ cell: { value } }) => (
        <img
          src={value || avatarDefault}
          alt="avatar"
          style={{
            width: isTablet ? '50rem' : '40rem',
            height: isTablet ? '50rem' : '40rem',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      ),
    },
    {
      Header: t('table.name'),
      accessor: 'name',
      Cell: ({ row }) => (
        <span style={{ fontSize: isTablet ? '22rem' : '18rem' }}>
          {row.original.name} {row.original.last_name}
        </span>
      ),
    },
    {
      Header: t('table.level'),
      accessor: 'level',
      Cell: ({ cell: { value } }) => <>{capitalize(value.name)}</>,
    },
    {
      Header: t('table.score'),
      accessor: 'score',
      Cell: ({ row }) => <>{row.original.level?.value}</>,
    },
    {
      Header: t('table.roi'),
      accessor: 'roi',
      Cell: ({ cell: { value = '0.0000' } }) => (
        <span
          style={{
            color: `var(--${color ? colorizedNum(value, true) : 'text'})`,
            fontSize: isTablet ? '22rem' : '18rem',
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
    },
  ];

  const removeUser = useCallback(
    async (item) => {
      try {
        const resultAction1 = await dispatch(
          removeTournamentUser({
            tournamentId: tournament._id,
            userId: item.id,
          })
        );
        const originalPromiseResult1 = unwrapResult(resultAction1);

        updateTournamentSubscription({
          page,
          size: limit,
          search,
          sort,
        });

        if (originalPromiseResult1) {
          showSuccess(t('page.battle.remove_user_success'));

          if (tournament?._id) {
            dispatch(getTournamentUsersList(tournament._id));
          }
        } else {
          showError(t('page.battle.remove_user_error'));
        }
      } catch (e) {
        console.log(e);
        if (e?.payload?.message) {
          showError(e.payload.message);
        } else {
          showError(t('page.battle.remove_user_error'));
        }
      }
    },
    [
      dispatch,
      tournament,
      page,
      limit,
      search,
      showSuccess,
      showError,
      sort,
      t,
      updateTournamentSubscription,
    ]
  );

  const handleClickDelete = (item) => {
    openPopup(
      <ConfirmPopup
        subtitle={t('popup.confirm.tournament_user_remove_subtitle')}
        onClickConfirm={() => removeUser(item)}
      />,
      { shared: true }
    );
  };

  const handleClickUpdate = () => {
    try {
      updateTournamentSubscription({
        page,
        size: limit,
        search,
        sort,
      });
      showSuccess(t('page.battle.update_success'));
    } catch (e) {
      showError(t('page.battle.update_error'));
      console.log(e);
    }
  };

  const handleClickBattle = useCallback((item) => {
    console.log('Battle clicked:', item);
  }, []);

  const handleClickJoin = useCallback(async () => {
    try {
      const resultAction = await dispatch(
        addTournamentUser({
          exchange: exchange.name,
          email: user.email,
          id: user?.id,
        })
      );
      const originalPromiseResult = unwrapResult(resultAction);

      if (originalPromiseResult) {
        showSuccess(t('page.battle.join_user_success'));

        updateTournamentSubscription({
          page,
          size: limit,
          search,
          sort,
        });

        if (tournament?._id) {
          dispatch(getTournamentUsersList(tournament._id));
        }
      } else {
        showError(t('page.battle.join_user_error'));
      }
    } catch (e) {
      showError(t('page.battle.join_user_error'));
      console.log(e);
    }
  }, [
    dispatch,
    exchange.name,
    user.email,
    showSuccess,
    showError,
    tournament?._id,
    t,
    user?.id,
    page,
    limit,
    search,
    sort,
    updateTournamentSubscription,
  ]);

  const handleClickNewTournament = useCallback(() => {
    openPopup(<NewTournamentPopup />);
  }, [openPopup]);

  const handleUserSearch = useCallback(
    (selectedValue) => {
      const selectedUser = tournamentUsersList.find(
        (user) => user.value === selectedValue
      );
      const searchTerm = selectedUser ? selectedUser.label : selectedValue;

      dispatch(setSearch(searchTerm));
      dispatch(setPage(1));

      updateTournamentSubscription({
        page: 1,
        size: limit,
        search: searchTerm,
        sort,
      });
    },
    [tournamentUsersList, dispatch, limit, sort, updateTournamentSubscription]
  );

  const removeTournament = useCallback(async () => {
    try {
      if (!tournament?._id) return;

      const resultAction = await dispatch(deleteTournament(tournament._id));
      const originalPromiseResult = unwrapResult(resultAction);

      if (originalPromiseResult) {
        showSuccess(t('page.battle.remove_battle_success'));

        updateTournamentSubscription({
          page,
          size: limit,
          search,
          sort,
        });

        if (tournament?._id) {
          dispatch(getTournamentUsersList(tournament._id));
        }
      } else {
        showError(t('page.battle.remove_battle_error'));
      }
    } catch (e) {
      showError(t('page.battle.remove_battle_error'));
      console.log(e);
    }
  }, [
    dispatch,
    tournament,
    showSuccess,
    showError,
    t,
    page,
    limit,
    search,
    sort,
    updateTournamentSubscription,
  ]);

  const handleClickDeleteTournament = () => {
    openPopup(
      <ConfirmPopup
        subtitle={t('popup.confirm.tournament_remove_subtitle')}
        onClickConfirm={() => removeTournament()}
      />,
      { shared: true }
    );
  };

  useEffect(() => {
    if (exchange?.name) {
      dispatch(setPage(1));

      subscribeToTournaments();

      updateTournamentSubscription({
        page: 1,
        size: limit,
        search,
        sort,
      });
    }
  }, [
    limit,
    dispatch,
    sort,
    exchange?.name,
    updateTournamentSubscription,
    subscribeToTournaments,
  ]);

  useEffect(() => {
    if (exchange?.name) {
      updateTournamentSubscription({
        page,
        size: limit,
        search,
        sort,
      });
    }
  }, [exchange?.name, page, limit, search, sort, updateTournamentSubscription]);

  useEffect(() => {
    return () => {
      dispatch(clearTournaments());

      if (user?.id) {
        dispatch(getUser(user.id));
      }
    };
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (tournament?._id) {
      dispatch(getTournamentUsersList(tournament._id));
    }

    return () => {
      dispatch(clearTournamentUsersList());
    };
  }, [dispatch, tournament?._id]);

  const registrationClosed = moment(tournament?.registration_date).isBefore(
    moment()
  );

  const alreadyJoined =
    user?.tournaments &&
    user.tournaments.length > 0 &&
    user.tournaments.some((userTournament) => {
      const userTournamentId = userTournament.id;
      const currentTournamentId = tournament?._id;

      const stringMatch =
        String(userTournamentId) === String(currentTournamentId);

      return stringMatch;
    });

  const buttonDisabled = alreadyJoined || registrationClosed;

  return (
    <PageLayout
      update={handleClickUpdate}
      chartWidth={600}
      entries={true}
      search={true}
      searchOptions={tournamentUsersList}
      onChange={handleUserSearch}
      placeholder={t('filter.search.users_placeholder')}
      searchPlaceholder={t('filter.search.users_placeholder')}
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
            tournament?.name && users.length === 0
              ? t('page.battle.no_participants')
              : errorMessage || t('page.battle.empty_users')
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
                <img src={tournament?.cover} alt="tournament" />
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
                disabled={buttonDisabled}
                onClickBtn={handleClickJoin}
                text={t('button.join')}
                icon={'join'}
              >
                {buttonDisabled && (
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
  );
};
