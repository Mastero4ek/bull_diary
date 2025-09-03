import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import moment from 'moment/min/moment-with-locales';
import {
  Controller,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  AnimatedDropdownList,
} from '@/components/animations/AnimatedDropdownList';
import {
  usePopup,
} from '@/components/layouts/popups/PopupLayout/PopupProvider';
import {
  useNotification,
} from '@/components/layouts/specialized/NotificationLayout/NotificationProvider';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { ControlButton } from '@/components/ui/buttons/ControlButton';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootInput } from '@/components/ui/inputs/RootInput';
import { RootSelect } from '@/components/ui/inputs/RootSelect';
import { Icon } from '@/components/ui/media/Icon';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/typography/descriptions/SmallDesc';
import { H2 } from '@/components/ui/typography/titles/H2';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ConfirmPopup } from '@/popups/system/ConfirmPopup';
import { updateKeys } from '@/redux/slices/candidateSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const Keys = React.memo(
  ({ handleClickRadio, isOpen, onHeaderClick }) => {
    const { user, errorArray } = useSelector((state) => state.candidate);

    const {
      isSyncing,
      syncProgress: progress,
      syncStatus: status,
      syncMessage: message,
      startDataSync,
      cancelSync,
    } = useWebSocket();
    const { openPopup } = usePopup();

    const dispatch = useDispatch();
    const { showSuccess, showError } = useNotification();
    const { t } = useTranslation();

    const [selectedExchange, setSelectedExchange] = useState(null);

    const startDate = moment().startOf('year').toISOString();
    const endDate = moment().toISOString();

    const {
      register,
      handleSubmit,
      setValue,
      control,
      watch,
      formState: { errors },
    } = useForm({ mode: 'onChange' });

    const watchedExchange = watch('exchange');

    const hasNoSelectedExchange = !selectedExchange;
    const hasNoApiKey = !selectedExchange?.api || selectedExchange.api === '';
    const hasNoSecretKey =
      !selectedExchange?.secret || selectedExchange.secret === '';
    const hasNoKeys = hasNoSelectedExchange || hasNoApiKey || hasNoSecretKey;
    const hasKeys =
      selectedExchange &&
      selectedExchange.api &&
      selectedExchange.secret &&
      selectedExchange.api !== '' &&
      selectedExchange.secret !== '';

    const EXCHANGE_OPTIONS = [
      {
        name: (
          <>
            <Icon id="bybit-logo" />
            <span> (Bybit)</span>

            {user.keys.find((key) => key.name === 'bybit')?.sync && (
              <div className={styles.keys_selected_icon}>
                <Icon id="checked-icon" />
              </div>
            )}
          </>
        ),
        value: 'bybit',
      },
      {
        name: (
          <>
            <Icon id="mexc-logo" />
            <span> (Mexc)</span>

            {user.keys.find((key) => key.name === 'mexc')?.sync && (
              <div className={styles.keys_selected_icon}>
                <Icon id="checked-icon" />
              </div>
            )}
          </>
        ),
        value: 'mexc',
      },
      {
        name: (
          <>
            <Icon id="okx-logo" />
            <span> (OKX)</span>

            {user.keys.find((key) => key.name === 'okx')?.sync && (
              <div className={styles.keys_selected_icon}>
                <Icon id="checked-icon" />
              </div>
            )}
          </>
        ),
        value: 'okx',
      },
    ];

    const removeKeys = useCallback(
      async (exchange) => {
        try {
          const resultAction = await dispatch(
            updateKeys({
              exchange: exchange.name.toLowerCase(),
              api: '',
              secret: '',
            })
          );

          const originalPromiseResult = unwrapResult(resultAction);

          if (originalPromiseResult) {
            showSuccess(t('page.settings.keys_removed_successfully'));
          } else {
            showError(t('page.settings.keys_error_removing'));
          }
        } catch (e) {
          showError(t('page.settings.keys_error_removing'));
        }
      },
      [dispatch, showError, showSuccess, t]
    );

    const handleCancelSync = useCallback(() => {
      console.log('Cancelling sync...');
      cancelSync();

      setValue('api-key', '');
      setValue('secret-key', '');

      if (selectedExchange) {
        setSelectedExchange({
          ...selectedExchange,
          api: '',
          secret: '',
        });
      }

      console.log('Sync cancelled, showing success message');
      showSuccess(t('page.settings.sync_cancelled_successfully'));
    }, [cancelSync, showSuccess, t, setValue, selectedExchange]);

    const handleClickRemove = () => {
      if (!selectedExchange) return;

      openPopup(
        <ConfirmPopup
          subtitle={t('popup.confirm.keys_remove_subtitle')}
          onClickConfirm={() => removeKeys(selectedExchange)}
        />,
        { shared: true }
      );
    };

    const submit = useCallback(
      async (data) => {
        if (!selectedExchange) {
          showError(t('page.settings.keys_error_no_exchange'));

          return;
        }

        try {
          const api = data['api-key'];
          const secret = data['secret-key'];

          if (
            selectedExchange?.api &&
            selectedExchange?.secret &&
            (!api || !secret)
          ) {
            return;
          }

          const resultAction = await dispatch(
            updateKeys({
              exchange: selectedExchange.name.toLowerCase(),
              api,
              secret,
            })
          );

          const originalPromiseResult = unwrapResult(resultAction);

          if (originalPromiseResult) {
            showSuccess(t('page.settings.keys_updated_successfully'));

            if (selectedExchange?.name) {
              startDataSync(startDate, endDate);
            }
          } else {
            showError(t('page.settings.keys_error_updating'));
          }
        } catch (e) {
          console.error('Keys update error:', e);
          showError(t('page.settings.keys_error_updating'));
        }
      },
      [
        dispatch,
        showError,
        showSuccess,
        t,
        selectedExchange,
        startDataSync,
        endDate,
        startDate,
      ]
    );

    useEffect(() => {
      if (watchedExchange && user?.keys) {
        const exchangeKey = watchedExchange.toLowerCase();
        const exchangeData = user.keys.find(
          (key) => key.name.toLowerCase() === exchangeKey
        );

        if (exchangeData) {
          setSelectedExchange(exchangeData);

          if (
            !exchangeData.api ||
            !exchangeData.secret ||
            exchangeData.api === '' ||
            exchangeData.secret === ''
          ) {
            setValue('api-key', exchangeData.api || '');
            setValue('secret-key', exchangeData.secret || '');
          } else {
            setValue('api-key', undefined);
            setValue('secret-key', undefined);
          }
        }
      }
    }, [watchedExchange, user?.keys, setValue]);

    return (
      <>
        <OuterBlock>
          <div
            className={styles.keys_wrapper}
            style={{ gap: isOpen ? '50rem' : '0' }}
          >
            <input
              id="settings"
              type="radio"
              name="accordion"
              className={styles.keys_radio}
              onChange={() => {
                handleClickRadio();
                onHeaderClick?.();
              }}
              checked={!!isOpen}
              readOnly
            />

            <label
              htmlFor="settings"
              className={styles.keys_header}
              onClick={onHeaderClick}
            >
              <H2>
                <span>{t('page.settings.keys_api_title')}</span>
              </H2>

              <ControlButton text={<i></i>} />
            </label>

            <AnimatedDropdownList
              isScrollable={false}
              isOpen={isOpen}
              className={styles.keys_dropdown}
            >
              <form
                className={styles.keys_form}
                onSubmit={handleSubmit(submit)}
              >
                <div className={styles.keys_warning}>
                  <SmallDesc>
                    <Icon id="warning-icon" />

                    <span
                      dangerouslySetInnerHTML={{
                        __html: t('page.settings.keys_warning'),
                      }}
                      style={{ color: 'var(--orange)' }}
                    ></span>
                  </SmallDesc>
                </div>

                <label htmlFor="exchange" className={styles.keys_label}>
                  <div className={styles.keys_control}>
                    <RootDesc>
                      <span>{t('form.label.exchange')}</span>
                    </RootDesc>

                    <Controller
                      name="exchange"
                      control={control}
                      rules={{ required: true }}
                      render={({ field, fieldState }) => (
                        <RootSelect
                          arrow={!fieldState.error}
                          className={`${styles.keys_select} ${
                            fieldState.error ? styles.error : ''
                          }`}
                          options={EXCHANGE_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                          getLabel={(item) => item.name}
                          getValue={(item) => item.value}
                          disabled={isSyncing}
                        >
                          {fieldState.error && (
                            <>
                              <SmallDesc>
                                <p>{t('form.error.exchange')}</p>
                              </SmallDesc>

                              <Icon id="error-icon" />
                            </>
                          )}
                        </RootSelect>
                      )}
                    />
                  </div>
                </label>

                <RootInput
                  label={t('form.label.api_key')}
                  name={`api-key`}
                  errorMessage={t('form.error.api_key')}
                  errorArray={errorArray}
                  errors={errors}
                  type="text"
                  register={register(`api-key`, { required: hasNoKeys })}
                  placeholder={hasKeys ? selectedExchange?.api || '' : ''}
                  value={hasKeys ? '' : undefined}
                  disabled={isSyncing || !hasNoKeys}
                />

                <RootInput
                  label={t('form.label.secret_key')}
                  name={`secret-key`}
                  errorMessage={t('form.error.secret_key')}
                  errors={errors}
                  errorArray={errorArray}
                  type="text"
                  register={register(`secret-key`, {
                    required: hasNoKeys,
                  })}
                  placeholder={hasKeys ? selectedExchange?.secret || '' : ''}
                  value={hasKeys ? '' : undefined}
                  disabled={isSyncing || !hasNoKeys}
                />

                <RootInput
                  name="agreement-key"
                  errorMessage={t('form.error.agreement_key')}
                  errorArray={errorArray}
                  errors={errors}
                  type="checkbox"
                  label={
                    <span style={{ opacity: '0.75' }}>
                      {t('form.label.agreement_key')}
                    </span>
                  }
                  register={{
                    ...register('agreement-key', {
                      required: hasNoKeys,
                    }),
                  }}
                  disabled={isSyncing || !hasNoKeys}
                />

                {status === 'loading' && (
                  <div className={styles.sync_progress}>
                    <div className={styles.sync_progress_header}>
                      <SmallDesc>
                        <b dangerouslySetInnerHTML={{ __html: message }}></b>
                      </SmallDesc>

                      <div className={styles.sync_progress_controls}>
                        <SmallDesc>
                          <b>{Math.round(progress || 0)}%</b>
                        </SmallDesc>

                        <button
                          onClick={handleCancelSync}
                          title={t('button.cancel_sync')}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className={styles.sync_progress_bar}>
                      <div
                        className={`${styles.sync_progress_fill} ${
                          status === 'loading'
                            ? styles.loading
                            : status === 'success'
                              ? styles.success
                              : ''
                        }`}
                        style={{
                          width: `${Math.max(0, Math.min(100, progress || 0))}%`,
                          transition:
                            status === 'loading'
                              ? 'width 0.3s ease-in-out'
                              : 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.keys_inputs_btns}>
                  <RootButton
                    disabled={status === 'loading' || hasNoKeys || isSyncing}
                    text={t('button.remove')}
                    icon="remove"
                    onClickBtn={() =>
                      hasNoKeys || isSyncing ? undefined : handleClickRemove()
                    }
                  />

                  <RootButton
                    disabled={status === 'loading' || hasKeys || isSyncing}
                    text={t('button.save')}
                    icon="update"
                    type="submit"
                  />
                </div>
              </form>
            </AnimatedDropdownList>
          </div>
        </OuterBlock>
      </>
    );
  }
);
