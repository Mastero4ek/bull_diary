import { H1 } from '@/components/ui/titles/H1'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { SignUpPopup } from '@/popups/SignUpPopup'
import { Counts } from './Counts'

import styles from './styles.module.scss'

export const Intro = () => {
	const { openPopup } = usePopup()

	const handleClickSignup = () => {
		openPopup(<SignUpPopup />)
	}

	return (
		<section className={styles.intro}>
			<div className={styles.container_wrapper}>
				<div className={styles.intro_wrap}>
					<div className={styles.intro_content}>
						<H1>
							<b>Unleash Your Trading Ambitions</b>
						</H1>

						<RootDesc>
							<span>
								Bull Diary is not only a multifunctional platform that allows
								you to save trading history and analyze trading decisions. This
								is also an assistant for identifying errors in trading
								settlement strategies.
							</span>
						</RootDesc>

						<RootButton
							onClickBtn={handleClickSignup}
							text={'Sign up'}
							icon='sign-up'
						/>
					</div>

					<div className={styles.intro_image}>
						<img src='' alt='intro-background-image' />
					</div>
				</div>

				<div className={styles.counts}>
					<Counts />
				</div>
			</div>
		</section>
	)
}
