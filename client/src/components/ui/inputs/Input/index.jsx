import React from 'react';

import styles from './styles.module.scss';

export const Input = React.memo(props => {
	const {
		disabled,
		error,
		type,
		id,
		placeholder,
		value,
		defaultValue,
		onChange,
		children,
	} = props

	return (
		<div className={styles.control}>
			<label htmlFor={id}>
				<input
					className={error ? styles.error + ' ' + styles.input : styles.input}
					autoComplete={type === 'password' ? 'off' : 'new-password'}
					autoCorrect={type === 'password' ? 'off' : undefined}
					autoCapitalize={type === 'password' ? 'off' : undefined}
					spellCheck={type === 'password' ? 'false' : undefined}
					type={type}
					id={id}
					name={id}
					placeholder={placeholder}
					value={value}
					defaultValue={defaultValue}
					onChange={onChange}
					disabled={disabled}
				/>

				{children}
			</label>
		</div>
	)
})
