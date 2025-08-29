import React from 'react'

import { Icon } from '@/components/ui/media/Icon'

import styles from './styles.module.scss'

export const CheckboxSwitch = React.memo(props => {
	const { name, onSwitch, checked, icons = false } = props

	return (
		<article className={styles.switch}>
			<input
				id={`switch-${name}`}
				checked={checked}
				onChange={onSwitch}
				type='checkbox'
			/>

			<label htmlFor={`switch-${name}`}>
				{icons && (
					<>
						<Icon id={'sun'} />
						<Icon id={'moon'} />
					</>
				)}
			</label>
		</article>
	)
})
