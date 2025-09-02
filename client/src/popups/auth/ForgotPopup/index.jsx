import React from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
import { RootInput } from '@/components/ui/inputs/RootInput';
import { setIsAuth } from '@/redux/slices/candidateSlice';

import styles from './styles.module.scss';

export const ForgotPopup = React.memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { closePopup } = usePopup();
  const { showSuccess, showError } = useNotification();

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submit = async (data) => {
    try {
      showSuccess(t('popup.forgot.success'));

      reset();
      dispatch(setIsAuth(true));
      navigate('/wallet');
      closePopup();
    } catch (e) {
      showError(t('popup.forgot.error'));
    }
  };

  return (
    <>
      <PopupDescLayout
        title={
          <span dangerouslySetInnerHTML={{ __html: t('popup.forgot.title') }} />
        }
        text={
          <span
            dangerouslySetInnerHTML={{
              __html: t('popup.forgot.subtitle'),
            }}
          ></span>
        }
      />

      <PopupFormLayout>
        <form
          className={styles.forgot_form_wrapper}
          onSubmit={handleSubmit((data) => submit(data))}
        >
          <RootInput
            name="email"
            label={t('form.label.email')}
            errorMessage={t('form.error.email')}
            errors={errors}
            type="email"
            register={{
              ...register('email', {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
              }),
            }}
          />

          <RootButton type={'submit'} text={t('button.submit')} icon="submit" />
        </form>
      </PopupFormLayout>
    </>
  );
});
