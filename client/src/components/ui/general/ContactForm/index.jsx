import React, { useCallback } from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { Icon } from '@/components/ui/general/Icon';

import styles from './styles.module.scss';

export const ContactForm = React.memo(() => {
	const { isAuth, user } = useSelector(state => state.candidate)
	const { t } = useTranslation()

	const {
		reset,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm()

	const submit = useCallback(data => {
		console.log(data)
		reset()
	}, [])

	return (
		<div className={styles.contact_form_wrapper}>
			<form onSubmit={handleSubmit(data => submit(data))}>
				<label
					htmlFor='name'
					className={`${styles.contact_form_label} ${
						errors.name && styles.error
					}`}
				>
					<div className={styles.contact_form_control}>
						<RootDesc>
							<span>{t('form.label.name')}</span>
						</RootDesc>

						{errors.name && (
							<>
								<Icon id={'error-icon'} />

								<SmallDesc>
									<p>{t('form.error.name')}</p>
								</SmallDesc>
							</>
						)}
					</div>

					<input
						defaultValue={isAuth ? user?.name : ''}
						{...register('name', { required: true })}
					/>
				</label>

				<label
					htmlFor='email'
					className={`${styles.contact_form_label} ${
						errors.email && styles.error
					}`}
				>
					<div className={styles.contact_form_control}>
						<RootDesc>
							<span>{t('form.label.email')}</span>
						</RootDesc>

						{errors.email && (
							<>
								<Icon id={'error-icon'} />

								<SmallDesc>
									<p>{t('form.error.email')}</p>
								</SmallDesc>
							</>
						)}
					</div>

					<input
						defaultValue={isAuth ? user?.email : ''}
						{...register('email', {
							required: true,
							pattern:
								/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
						})}
					/>
				</label>

				<label
					htmlFor='subject'
					className={`${styles.contact_form_label} ${
						errors.subject && styles.error
					}`}
				>
					<div className={styles.contact_form_control}>
						<RootDesc>
							<span>{t('form.label.subject')}</span>
						</RootDesc>

						{errors.subject && (
							<>
								<Icon id={'error-icon'} />

								<SmallDesc>
									<p>{t('form.error.subject')}</p>
								</SmallDesc>
							</>
						)}
					</div>

					<input {...register('subject')} />
				</label>

				<label
					htmlFor='message'
					className={`${styles.contact_form_label} ${
						errors.message && styles.error
					}`}
				>
					<div className={styles.contact_form_control}>
						<RootDesc>
							<span>{t('form.label.message')}</span>
						</RootDesc>

						{errors.message && (
							<>
								<Icon id={'error-icon'} />

								<SmallDesc>
									<p>{t('form.error.message')}</p>
								</SmallDesc>
							</>
						)}
					</div>

					<textarea {...register('message', { required: true })} />
				</label>

				<RootButton
					type={'submit'}
					onClickBtn={() => console.log('')}
					text={t('button.submit')}
					icon='submit'
				/>
			</form>
		</div>
	)
})
