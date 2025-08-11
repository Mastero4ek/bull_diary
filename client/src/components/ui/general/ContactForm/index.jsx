import React, { useCallback } from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootInput } from '@/components/ui/inputs/RootInput';

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
				<RootInput
					name='name'
					label={t('form.label.name')}
					errorMessage={t('form.error.name')}
					errors={errors}
					type='text'
					defaultValue={isAuth ? user?.name : ''}
					register={register('name', { required: true })}
				/>

				<RootInput
					name='email'
					label={t('form.label.email')}
					errorMessage={t('form.error.email')}
					errors={errors}
					type='email'
					defaultValue={isAuth ? user?.email : ''}
					register={{
						...register('email', {
							required: true,
							pattern:
								/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
						}),
					}}
				/>

				<RootInput
					name='subject'
					label={t('form.label.subject')}
					errorMessage={t('form.error.subject')}
					errors={errors}
					type='text'
					register={register('subject')}
				/>

				<RootInput
					name='message'
					label={t('form.label.message')}
					errorMessage={t('form.error.message')}
					errors={errors}
					type='textarea'
					register={register('message', { required: true })}
				/>

				<RootButton type={'submit'} text={t('button.submit')} icon='submit' />
			</form>
		</div>
	)
})
