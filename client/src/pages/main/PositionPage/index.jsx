import React, { useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { useLocation } from 'react-router-dom';

import { PageLayout } from '@/components/layouts/core/PageLayout';
import {
  useNotification,
} from '@/components/layouts/specialized/NotificationLayout/NotificationProvider';
import {
  PositionLayout,
} from '@/components/layouts/specialized/PositionLayout';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { Loader } from '@/components/ui/feedback/Loader';
import { RootInput } from '@/components/ui/inputs/RootInput';
import {
  clearDescription,
  getOrderDescription,
  updateOrderDescription,
} from '@/redux/slices/ordersSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const PositionPage = React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const position = useLocation()?.state?.item;
  const { showSuccess, showError } = useNotification();

  const { serverStatus, description } = useSelector((state) => state.orders);
  const { isTablet } = useSelector((state) => state.settings);

  const { reset, register, handleSubmit } = useForm();

  const submit = async (data) => {
    try {
      const resultAction = await dispatch(
        updateOrderDescription({ id: position?.id, text: data.description })
      );
      const originalPromiseResult = unwrapResult(resultAction);

      if (originalPromiseResult) {
        reset();
        showSuccess(t('page.position.update_desc_success'));
      } else {
        showError(t('page.position.update_desc_error'));
      }
    } catch (e) {
      console.log(e);

      if (e?.payload?.message) {
        showError(e.payload.message);
      } else {
        showError(t('page.position.update_desc_error'));
      }
    }
  };

  useEffect(() => {
    dispatch(getOrderDescription({ id: position?.id }));

    return () => {
      dispatch(clearDescription());
    };
  }, [dispatch, position?.id]);

  return (
    <PageLayout
      chartWidth={460}
      periods={true}
      calendar={true}
      search={true}
      entries={true}
      disabled={true}
    >
      {serverStatus === 'loading' && <Loader />}

      <div style={{ width: '100%', order: isTablet ? 2 : 1 }}>
        <PositionLayout />
      </div>

      <form
        className={styles.order_desc}
        onSubmit={handleSubmit((data) => submit(data))}
      >
        <RootInput
          name="description"
          placeholder={t('form.placeholder.order_description')}
          type="textarea"
          defaultValue={description}
          register={register('description', { required: false })}
        />

        <RootButton
          type="submit"
          text={t('button.save')}
          icon={'save-changes'}
        />
      </form>
    </PageLayout>
  );
});
