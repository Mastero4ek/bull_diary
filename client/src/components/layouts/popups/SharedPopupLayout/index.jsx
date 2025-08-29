import React from 'react'

import { useSelector } from 'react-redux'

import bybit from '@/assets/images/exchanges/bybit-logo.svg'
import mexc from '@/assets/images/exchanges/mexc-logo.svg'
import okx from '@/assets/images/exchanges/okx-logo.svg'
import { OuterBlock } from '@/components/layouts/utils/OuterBlock'
import { DownloadButton } from '@/components/ui/buttons/DownloadButton'
import { Logo } from '@/components/ui/navigation/Logo'
import { H2 } from '@/components/ui/typography/titles/H2'

import styles from './styles.module.scss'

const exchangeImages = { bybit, mexc, okx }

export const SharedPopupLayout = React.forwardRef((props, ref) => {
	const { popup_id, popup_name, children } = props
	const { user } = useSelector(state => state.candidate)
	const { exchange } = useSelector(state => state.filters)

	const currentExchange = () => {
		return exchangeImages[exchange?.name] || exchangeImages.bybit
	}

	return (
		<>
			<div ref={ref} id={popup_id} className={styles.info_wrapper}>
				<div className={styles.info_head}>
					<Logo />

					<div className={styles.info_head_name}>
						<OuterBlock>
							<H2>
								<span>{user?.name || 'User_name'}</span>
							</H2>
						</OuterBlock>
					</div>
				</div>

				<div className={styles.info_wrap}>
					<div className={styles.info_exchange}>
						<img src={currentExchange()} alt='exchange' />
					</div>

					{children}
				</div>
			</div>

			<DownloadButton ref={ref} selector={`#${popup_id}`} name={popup_name} />
		</>
	)
})
