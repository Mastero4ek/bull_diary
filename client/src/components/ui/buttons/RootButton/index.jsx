import React from 'react'

import { Icon } from '@/components/ui/media/Icon'
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'

import styles from './styles.module.scss'

export const RootButton = React.memo(
	({ type = 'button', style, disabled, onClickBtn, text, icon, children }) => {
		return (
			<button
				style={{ ...style }}
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
