import React, { useEffect } from 'react';

import { Icon } from '@/components/ui/general/Icon';
import { OuterBlock } from '@/components/ui/general/OuterBlock';

import { usePopup } from './PopupProvider';
import styles from './styles.module.scss';

export const PopupLayout = React.memo(() => {
	const { popupContent, closePopup } = usePopup()
	const { shared, direction } = popupContent

	useEffect(() => {
		if (popupContent.content) {
			const scrollBarWidth =
				window.innerWidth - document.documentElement.clientWidth

			document.body.style.overflow = 'hidden'
			document.body.style.paddingRight = `${scrollBarWidth}rem`
		}

		return () => {
			document.body.style.overflow = ''
			document.body.style.paddingRight = ''
		}
	}, [popupContent.content])

	return (
		popupContent.content && (
			<div className={styles.overlay} id='popup'>
				<div
					className={`${styles.popup_wrapper} ${
						shared && styles.popup_shared_wrapper
					} ${direction === 'reverse' && styles.popup_reverse_wrapper}`}
				>
					<OuterBlock>
						<div onClick={closePopup} className={styles.popup_close}>
							<OuterBlock>
								<Icon id='remove' />
							</OuterBlock>
						</div>

						{popupContent.content}
					</OuterBlock>
				</div>
			</div>
		)
	)
})
