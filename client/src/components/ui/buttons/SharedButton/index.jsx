import { usePopup } from '@/components/layouts/popups/PopupLayout/PopupProvider'
import { ClosedContent } from '@/components/layouts/utils/ClosedContent'

import styles from './styles.module.scss'

export const SharedButton = ({ disabled, popup }) => {
	const { openPopup } = usePopup()

	const handleClickShared = () => {
		openPopup(popup, { shared: true })
	}

	return (
		<button
			disabled={disabled}
			//onClick={disabled ? undefined : handleClickShared}
			onClick={undefined}
			style={{
				pointerEvents: 'none',
				cursor: 'default',
				background: 'var(--disabled)',
				opacity: 0.5,
			}}
			type='button'
			className={styles.shared_button}
			aria-label='shared'
		>
			{/* <Icon id='shared' /> */}

			<ClosedContent width={20} />
		</button>
	)
}
