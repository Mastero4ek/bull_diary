import React from 'react'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { Icon } from '@/components/ui/general/Icon'

import styles from './styles.module.scss'

export const RootButton = React.memo(
	({ type = 'button', disabled, onClickBtn, text, icon, children }) => {
		return (
			<button
				disabled={disabled}
				onClick={!disabled ? onClickBtn : undefined}
				type={type}
				className={styles.root_button}
			>
				{text && (
					<RootDesc>
						<span>{text}</span>
					</RootDesc>
				)}
				{icon && <Icon id={icon} />}

				{children}
			</button>
		)
	}
)
