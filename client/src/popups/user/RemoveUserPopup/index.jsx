import React, { useEffect } from 'react';

import { useForm } from 'react-hook-form';
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
  PopupDescLayout,
} from '@/components/layouts/popups/PopupLayout/PopupDescLayout';
import {
  PopupFormLayout,
} from '@/components/layouts/popups/PopupLayout/PopupFormLayout';
import {
  usePopup,
} from '@/components/layouts/popups/PopupLayout/PopupProvider';
import {
  useNotification,
} from '@/components/layouts/specialized/NotificationLayout/NotificationProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { Loader } from '@/components/ui/feedback/Loader';
import { RootInput } from '@/components/ui/inputs/RootInput';
import {
  removeUser as removeUserCandidate,
  setChangeUser as setChangeUserCandidate,
} from '@/redux/slices/candidateSlice';
import {
  getUsers,
  getUsersList,
  removeUser as removeUserUsers,
  setChangeUser as setChangeUserUsers,
} from '@/redux/slices/usersSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const RemoveUserPopup = React.memo(({ item }) => {
  const { t } = useTranslation();
  const { closePopup } = usePopup();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminContext = location.pathname.includes('/all-users');

  const { errorArray, serverStatus, isAuth } = useSelector((state) =>
    isAdminContext ? state.users : state.candidate
  );
  const currentUser = useSelector((state) => state.candidate.user);
  const { sort, search, page, limit } = useSelector((state) => state.users);
  const { date } = useSelector((state) => state.filters);
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submit = async (data) => {
    try {
      const resultAction1 = await dispatch(
        isAdminContext
          ? removeUserUsers({
              current_email: item.email,
              fill_email: data.email,
              userId: item._id,
            })
          : removeUserCandidate({
              current_email: item.email,
              fill_email: data.email,
              userId: item.id,
            })
      );
      const originalPromiseResult1 = unwrapResult(resultAction1);

      let originalPromiseResult2 = true;

      if (isAdminContext) {
        const resultAction2 = await dispatch(
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
        originalPromiseResult2 = unwrapResult(resultAction2);
      }

      if (
        originalPromiseResult1 &&
        (isAdminContext ? originalPromiseResult2 : true)
      ) {
        showSuccess(
          isAdminContext
            ? t('popup.remove_user.admin_success')
            : t('popup.remove_user.user_success')
        );
        reset();
        closePopup();

        if (location.pathname.match(/\/all-users\/[^/]+$/)) {
          navigate(-1);
        }
      } else {
        showError(
          isAdminContext
            ? t('popup.remove_user.admin_error')
            : t('popup.remove_user.user_error')
        );
      }
    } catch (rejectedValueOrSerializedError) {
      showError(
        isAdminContext
          ? t('popup.remove_user.admin_error')
          : t('popup.remove_user.user_error')
      );
    }
  };

  useEffect(() => {
    if (!isAdminContext && !isAuth) {
      dispatch(
        isAdminContext ? setChangeUserUsers(item) : setChangeUserCandidate(item)
      );

      closePopup();
    }
  }, [isAuth, dispatch, isAdminContext, item, closePopup]);

  return (
    <>
      <PopupDescLayout
        title={
          <span
            dangerouslySetInnerHTML={{
              __html: t('popup.remove_user.title'),
            }}
          />
        }
        text={
          isAdminContext ? (
            <span
              dangerouslySetInnerHTML={{
                __html: t('popup.remove_user.admin_subtitle'),
              }}
            ></span>
          ) : (
            <span
              dangerouslySetInnerHTML={{
                __html: t('popup.remove_user.user_subtitle'),
              }}
            ></span>
          )
        }
      />

      <PopupFormLayout>
        <form
          className={styles.remove_form_wrapper}
          onSubmit={handleSubmit((data) => submit(data))}
        >
          <RootInput
            name="email"
            defaultValue={isAdminContext ? item?.email || '' : ''}
            readOnly={isAdminContext}
            label={
              isAdminContext
                ? t('form.label.user_email')
                : t('form.label.account_email')
            }
            errorMessage={t('form.error.email')}
            errorArray={errorArray}
            errors={errors}
            type="email"
            register={{
              ...register('email', {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
              }),
            }}
          />

          <RootButton
            type={'submit'}
            text={
              isAdminContext
                ? t('button.admin_yes_remove')
                : t('button.user_yes_remove')
            }
            disabled={serverStatus === 'loading' ? true : false}
          />

          {serverStatus === 'loading' && <Loader logo={false} />}
        </form>
      </PopupFormLayout>
    </>
  );
});
