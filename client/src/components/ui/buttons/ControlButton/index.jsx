import React from 'react'

import styles from './styles.module.scss'

import { Icon } from '@/components/ui/general/Icon'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'

export const ControlButton = React.memo(
	({ disabled, onClickBtn, icon, text, animate }) => {
		return (
			<button
				disabled={disabled}
				onClick={!disabled ? onClickBtn : undefined}
				type='button'
				className={
					animate
						? `${styles.control_button_animate} ${styles.control_button}`
						: styles.control_button
				}
			>
				{text && (
					<RootDesc>
						<span>{text}</span>
					</RootDesc>
				)}

				{icon && <Icon id={icon} />}
			</button>
		)
	}
)
