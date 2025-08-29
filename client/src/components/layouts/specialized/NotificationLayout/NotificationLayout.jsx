import React from 'react'

import { OuterBlock } from '@/components/layouts/utils/OuterBlock'
import { Icon } from '@/components/ui/media/Icon'
import { SmallDesc } from '@/components/ui/typography/descriptions/SmallDesc'

import { useNotification } from './NotificationProvider'
import styles from './styles.module.scss'

export const NotificationLayout = React.memo(() => {
	const { notifications, removeNotification } = useNotification()

	const getIconByType = type => {
		switch (type) {
			case 'success':
				return 'checked-icon'

			case 'error':
				return 'error-icon'

			case 'warning':
				return 'warning-icon'

			case 'info':
				return 'info-icon'

			default:
				return 'info-icon'
		}
	}

	const handleRemove = id => {
		removeNotification(id)
	}

	return (
		<div className={styles.notifications_container}>
			{notifications.map((notification, index) => (
				<div
					key={notification.id}
					className={`${styles.notification} ${
						styles[`notification_${notification.type}`]
					} ${
						notifications.length > 1 && index > 0
							? styles.notification_multiple
							: ''
					}`}
				>
					<div className={styles.notification_content}>
						<div className={styles.notification_icon}>
							<Icon
								id={getIconByType(notification.type)}
								width={24}
								height={24}
							/>
						</div>

						<SmallDesc>
							<span
								dangerouslySetInnerHTML={{ __html: notification.message }}
							/>
						</SmallDesc>

						<div
							onClick={() => handleRemove(notification.id)}
							className={styles.notification_close}
						>
							<OuterBlock>
								<Icon id='remove' />
							</OuterBlock>
						</div>
					</div>
				</div>
			))}
		</div>
	)
})
