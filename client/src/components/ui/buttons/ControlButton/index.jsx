import React from 'react'

import { Icon } from '@/components/ui/media/Icon'
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'

import styles from './styles.module.scss'

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
