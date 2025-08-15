import { useTranslation } from 'react-i18next';

import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { H1 } from '@/components/ui/titles/H1';
import { SignUpPopup } from '@/popups/SignUpPopup';

import { Counts } from './Counts';
import styles from './styles.module.scss';

export const Intro = () => {
	const { openPopup } = usePopup()
	const { t } = useTranslation()

	const handleClickSignup = () => {
		openPopup(<SignUpPopup />)
	}

	return (
		<section id='intro' className={styles.intro}>
			<div className={styles.container_wrapper}>
				<div className={styles.intro_wrap}>
					<div className={styles.intro_content}>
						<H1>
							<b>{t('page.home.intro.title')}</b>
						</H1>

						<RootDesc>
							<span>{t('page.home.intro.description')}</span>
						</RootDesc>

						<RootButton
							onClickBtn={handleClickSignup}
							text={t('button.sign_up')}
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
