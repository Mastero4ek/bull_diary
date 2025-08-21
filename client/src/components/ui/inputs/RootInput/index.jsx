import React, { useCallback } from 'react';

import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { Icon } from '@/components/ui/general/Icon';

import styles from './styles.module.scss';

export const RootInput = ({
	name,
	className,
	errors,
	errorArray,
	defaultValue,
	label,
	errorMessage,
	warningMessage,
	readOnly,
	register,
	placeholder,
	type,
	disabled,
}) => {
	const findErrorField = useCallback(field => {
		if (errorArray) {
			return errorArray.find(item => item.field === field)
		} else return false
	}, [])

	return type === 'checkbox' ? (
		<label
			htmlFor={name}
			className={styles.label}
			style={{
				opacity: disabled ? '0.5' : '1',
				cursor: disabled ? 'not-allowed' : 'pointer',
				pointerEvents: disabled ? 'none' : 'auto',
			}}
		>
			<input
				id={name}
				type={type}
				className={className}
				defaultValue={defaultValue}
				disabled={disabled}
				readOnly={readOnly}
				{...register}
			/>

			<div className={styles.label_checkbox}>
				<i
					style={
						errors && (errors[name] || findErrorField(name))
							? { border: '1rem solid var(--red)' }
							: {}
					}
				>
					<Icon id={'checked'} />
				</i>

				{label && (
					<SmallDesc>
						<span>{label}</span>
					</SmallDesc>
				)}
			</div>
		</label>
	) : (
		<label
			style={{
				opacity: disabled ? '0.5' : '1',
				cursor: disabled ? 'not-allowed' : 'pointer',
				pointerEvents: disabled ? 'none' : 'auto',
			}}
			htmlFor={name}
			className={`${styles.label} ${warningMessage && styles.label_warning} ${
				errors && (errors[name] || findErrorField(name)) && styles.label_error
			}`}
		>
			{label && (
				<div className={styles.label_control}>
					<RootDesc>
						<span>{label}</span>
					</RootDesc>

					{errors && (errors[name] || findErrorField(name)) && (
						<>
							<Icon id={'error-icon'} />

							{errorMessage && (
								<SmallDesc>
									<p>{errorMessage}</p>
								</SmallDesc>
							)}
						</>
					)}

					{warningMessage && (
						<>
							<Icon id={'warning-icon'} />

							<SmallDesc>
								<p>{warningMessage}</p>
							</SmallDesc>
						</>
					)}
				</div>
			)}

			{type === 'textarea' ? (
				<textarea
					type={'text'}
					id={name}
					placeholder={placeholder}
					className={className}
					defaultValue={defaultValue}
					disabled={disabled}
					readOnly={readOnly}
					{...register}
				/>
			) : (
				<input
					id={name}
					placeholder={placeholder}
					type={type}
					className={className}
					defaultValue={defaultValue}
					disabled={disabled}
					readOnly={readOnly}
					autoComplete={type === 'password' ? 'off' : undefined}
					autoCorrect={type === 'password' ? 'off' : undefined}
					autoCapitalize={type === 'password' ? 'off' : undefined}
					spellCheck={type === 'password' ? 'false' : undefined}
					{...register}
				/>
			)}
		</label>
	)
}
