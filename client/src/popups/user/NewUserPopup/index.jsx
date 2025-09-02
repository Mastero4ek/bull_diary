import './phone_input.scss';

import {
  useCallback,
  useState,
} from 'react';

import {
  Controller,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import ru from 'react-phone-input-2/lang/ru.json';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

import coverDefault from '@/assets/images/general/default_tournament.png';
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
import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootInput } from '@/components/ui/inputs/RootInput';
import { RootSelect } from '@/components/ui/inputs/RootSelect';
import { Icon } from '@/components/ui/media/Icon';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/typography/descriptions/SmallDesc';
import { createUser } from '@/redux/slices/candidateSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const NewUserPopup = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const { showSuccess, showError } = useNotification();
  const { errorArray } = useSelector((state) => state.candidate);
  const [cover, setCover] = useState(null);
  const { closePopup } = usePopup();
  const dispatch = useDispatch();

  const ROLE_OPTIONS = [
    { name: t('popup.new_user.role.admin'), value: 'admin' },
    { name: t('popup.new_user.role.user'), value: 'user' },
  ];

  const handleCoverChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setCover(file);
      setValue('cover', file);
    }
  };

  const handleRemoveCover = () => {
    setCover(null);
    setValue('cover', null);
  };

  const submit = async (data) => {
    try {
      const fullData = {
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        cover,
        phone: data.phone,
        role: data.role,
      };

      const resultAction = await dispatch(createUser({ data: fullData }));
      const originalPromiseResult = unwrapResult(resultAction);

      if (originalPromiseResult) {
        reset();
        setCover(null);

        closePopup();
        showSuccess(t('popup.new_user.create_success'));
      } else {
        showError(t('popup.new_user.create_error'));
      }
    } catch (e) {
      if (e?.payload?.message) {
        showError(e.payload.message);
      } else {
        showError(t('popup.new_user.create_error'));
      }
    }
  };

  const findErrorField = useCallback((field) => {
    if (errorArray) {
      return errorArray.find((item) => item.field === field);
    } else return false;
  }, []);

  return (
    <>
      <PopupDescLayout title={t('popup.new_user.title')}>
        <RootInput
          name="name"
          label={t('form.label.name')}
          errorMessage={t('form.error.name')}
          errors={errors}
          type="text"
          register={register('name', { required: true })}
        />

        <RootInput
          name="last_name"
          label={t('form.label.last_name')}
          type="text"
          register={register('last_name')}
        />

        <label htmlFor="cover" className={`${styles.user_form_label}`}>
          <div className={styles.user_form_control}>
            <div className={styles.user_photo}>
              <InnerBlock>
                <img
                  style={{ opacity: cover ? 1 : 0.5 }}
                  src={cover ? URL.createObjectURL(cover) : coverDefault}
                  alt="cover"
                />

                <label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    style={{ display: 'none' }}
                  />
                  <Icon id="change-photo" />
                </label>
              </InnerBlock>

              <RootButton
                disabled={!cover}
                onClickBtn={handleRemoveCover}
                icon="cancel"
                text={t('button.remove_cover')}
              />
            </div>
          </div>
        </label>
      </PopupDescLayout>

      <PopupFormLayout>
        <form
          className={styles.user_form_wrapper}
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
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('form.error.email'),
                },
              }),
            }}
          />

          <RootInput
            name="password"
            label={t('form.label.password')}
            errorMessage={t('form.error.password')}
            errorArray={errorArray}
            errors={errors}
            type="password"
            register={{
              ...register('password', {
                required: true,
              }),
            }}
          />

          <label htmlFor="phone" className={styles.user_form_label}>
            <div className={styles.user_form_control}>
              <RootDesc>
                <span>{t('form.label.phone')}</span>
              </RootDesc>
            </div>

            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <PhoneInput
                  localization={ru}
                  disableSearchIcon={true}
                  disableDropdown={true}
                  enableSearch={true}
                  value={field.value ? field.value.toString() : ''}
                  onChange={field.onChange}
                  inputProps={{
                    name: 'phone',
                  }}
                />
              )}
            />
          </label>

          <div className={styles.user_form_label}>
            <div className={styles.user_form_control}>
              <RootDesc>
                <span>{t('form.label.role')}</span>
              </RootDesc>
            </div>

            <Controller
              name="role"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <RootSelect
                  arrow={!fieldState.error}
                  className={`${styles.user_form_select} ${
                    fieldState.error ? styles.error : ''
                  }`}
                  options={ROLE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.value}
                >
                  {(errors.role || findErrorField('role')) && (
                    <>
                      <SmallDesc>
                        <p>{t('form.error.role')}</p>
                      </SmallDesc>

                      <Icon id={'error-icon'} />
                    </>
                  )}
                </RootSelect>
              )}
            />
          </div>

          <RootButton
            type="submit"
            text={t('button.create_user')}
            icon="join"
          />
        </form>
      </PopupFormLayout>
    </>
  );
};
