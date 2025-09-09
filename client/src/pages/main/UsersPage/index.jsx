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
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import avatarDefault from '@/assets/images/general/default_avatar.png';
import { PageLayout } from '@/components/layouts/core/PageLayout';
import {
  usePopup,
} from '@/components/layouts/popups/PopupLayout/PopupProvider';
import {
  useNotification,
} from '@/components/layouts/specialized/NotificationLayout/NotificationProvider';
import { TableLayout } from '@/components/layouts/specialized/TableLayout';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { ControlButton } from '@/components/ui/buttons/ControlButton';
import { useTableActions } from '@/hooks/useTableActions';
import { RemoveUserPopup } from '@/popups/user/RemoveUserPopup';
import { getUser } from '@/redux/slices/candidateSlice';
import { setSearch } from '@/redux/slices/filtersSlice';
import {
  activeUser,
  clearUsers,
  clearUsersCalendarData,
  clearUsersList,
  getUsers,
  getUsersActivity,
  getUsersList,
  inactiveUser,
  setPage,
  setSort,
} from '@/redux/slices/usersSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import { CalendarChart } from './CalendarChart';
import styles from './styles.module.scss';

export const UsersPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openPopup } = usePopup();
  const { showSuccess, showError } = useNotification();

  const { search, limit, date } = useSelector((state) => state.filters);
  const {
    fakeUsers,
    users,
    usersList,
    serverStatus,
    errorMessage,
    page,
    totalPages,
    sort,
  } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.candidate);
  const { isTablet } = useSelector((state) => state.settings);

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
      Cell: ({ cell: { value }, row }) => (
        <span style={{ fontSize: isTablet ? '22rem' : '18rem' }}>
          {value} {row.original.last_name}
        </span>
      ),
    },
    {
      Header: t('table.email'),
      accessor: 'email',
    },
    {
      Header: t('table.created_at'),
      accessor: 'created_at',
      Cell: ({ cell: { value } }) => (
        <b>
          {moment(value).format('DD/MM/YYYY')}
          <br />
          <span style={{ fontWeight: '400', opacity: '0.5' }}>
            {moment(value).format('HH:mm:ss')}
          </span>
        </b>
      ),
    },
    // {
    // 	Header: t('table.updated_at'),
    // 	accessor: 'updated_at',
    // 	Cell: ({ cell: { value } }) => (
    // 		<b>
    // 			{moment(value).format('DD/MM/YYYY')}
    // 			<br />
    // 			<span style={{ fontWeight: '400', opacity: '0.5' }}>
    // 				{moment(value).format('HH:mm:ss')}
    // 			</span>
    // 		</b>
    // 	),
    // },
    // {
    // 	Header: t('table.active'),
    // 	accessor: 'inactive',
    // 	Cell: ({ cell: { value } }) =>
    // 		value ? (
    // 			<Icon
    // 				width={isTablet ? 32 : 28}
    // 				height={isTablet ? 32 : 28}
    // 				id={'user-inactive'}
    // 			/>
    // 		) : (
    // 			<Icon
    // 				width={isTablet ? 32 : 28}
    // 				height={isTablet ? 32 : 28}
    // 				id={'user-active'}
    // 			/>
    // 		),
    // },
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
            disabled={!users || users.length === 0}
            icon={'view'}
            onClickBtn={() => handleClickView(row.original)}
          />

          <div
            className={
              row.original.inactive
                ? styles.user_active_button
                : styles.user_inactive_button
            }
          >
            <ControlButton
              disabled={!users || users.length === 0}
              icon={row.original.inactive ? 'active' : 'inactive'}
              onClickBtn={() =>
                row.original.inactive
                  ? handleClickActive(row.original)
                  : handleClickInactive(row.original)
              }
            />
          </div>

          <div className={styles.user_delete_button}>
            <ControlButton
              disabled={!users || users.length === 0}
              icon={'cross'}
              onClickBtn={() => handleClickRemove(row.original)}
            />
          </div>
        </div>
      ),
    },
  ];

  const handleClickRemove = useCallback(
    async (item) => {
      openPopup(<RemoveUserPopup item={item} />, { shared: true });
    },
    [openPopup]
  );

  const handleClickInactive = useCallback(
    async (item) => {
      try {
        const resultAction = await dispatch(inactiveUser(item));

        const originalPromiseResult = unwrapResult(resultAction);

        if (originalPromiseResult) {
          showSuccess(t('page.users.success_inactive'));

          dispatch(
            getUsers({
              sort,
              search,
              page,
              limit,
              start_time: date.start_date,
              end_time: date.end_date,
            })
          );

          dispatch(getUsersList());
        } else {
          showError(t('page.users.error_inactive'));
        }
      } catch (e) {
        showError(t('page.users.error_inactive'));
      }
    },
    [dispatch, showSuccess, showError, t, date, search, page, limit, sort]
  );

  const handleClickActive = useCallback(
    async (item) => {
      try {
        const resultAction = await dispatch(activeUser(item));

        const originalPromiseResult = unwrapResult(resultAction);

        if (originalPromiseResult) {
          showSuccess(t('page.users.success_active'));

          dispatch(
            getUsers({
              sort,
              search,
              page,
              limit,
              start_time: date.start_date,
              end_time: date.end_date,
            })
          );

          dispatch(getUsersList());
        } else {
          showError(t('page.users.error_active'));
        }
      } catch (e) {
        showError(t('page.users.error_active'));
      }
    },
    [dispatch, showSuccess, showError, t, date, search, page, limit, sort]
  );

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
      );

      const originalPromiseResult = unwrapResult(resultAction);

      if (originalPromiseResult) {
        showSuccess(t('page.users.success_update'));
      } else {
        showError(t('page.users.error_update'));
      }
    } catch (e) {
      showError(t('page.users.error_update'));
      console.log(e);
    }
  };

  const handleClickView = useCallback(
    (item) => {
      const id = item?._id;

      navigate(`/all-users/${id}`, { state: { item } });
    },
    [navigate]
  );

  const handleUserSearch = useCallback(
    (selectedValue) => {
      const selectedUser = usersList.find(
        (user) => user.value === selectedValue
      );
      const searchTerm = selectedUser ? selectedUser.label : selectedValue;

      dispatch(setSearch(searchTerm));
    },
    [usersList, dispatch]
  );

  useEffect(() => {
    if (date?.start_date && date?.end_date) {
      dispatch(setPage(1));

      dispatch(
        getUsers({
          sort,
          search,
          page: 1,
          limit,
          start_time: date.start_date,
          end_time: date.end_date,
        })
      );
    }
  }, [limit, dispatch]);

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
      );
    }
  }, [dispatch, date, sort, page, search]);

  useEffect(() => {
    return () => {
      dispatch(clearUsers());

      if (user?.id) {
        dispatch(getUser(user.id));
      }
    };
  }, [location, dispatch, user?.id]);

  useEffect(() => {
    dispatch(getUsersList());
    dispatch(getUsersActivity());

    return () => {
      dispatch(clearUsersCalendarData());
      dispatch(clearUsersList());
      dispatch(setSearch(''));
    };
  }, [dispatch]);

  return (
    <PageLayout
      update={handleClickUpdate}
      chartWidth={720}
      entries={true}
      periods={true}
      calendar={false}
      search={true}
      searchOptions={usersList}
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
          emptyWarn={errorMessage || t('page.users.empty_error')}
        />
      </div>

      <OuterBlock>
        <CalendarChart />
      </OuterBlock>
    </PageLayout>
  );
};
