import { useTranslation } from 'react-i18next';

import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { InnerBlock } from '@/components/ui/general/InnerBlock';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { H1 } from '@/components/ui/titles/H1';
import { H4 } from '@/components/ui/titles/H4';
import { SignUpPopup } from '@/popups/SignUpPopup';

import styles from './styles.module.scss';

export const Start = () => {
	const { openPopup } = usePopup()
	const { t } = useTranslation()

	const handleClickSignup = () => {
		openPopup(<SignUpPopup />)
	}

	const stepList = [
		{
			id: 0,
			title: t('page.home.start.step_1.title'),
			subtitle: t('page.home.start.step_1.subtitle'),
			step: '01',
		},
		{
			id: 1,
			title: t('page.home.start.step_2.title'),
			subtitle: t('page.home.start.step_2.subtitle'),
			step: '02',
		},
		{
			id: 2,
			title: t('page.home.start.step_3.title'),
			subtitle: t('page.home.start.step_3.subtitle'),
			step: '03',
		},
	]

	return (
		<section id='start' className={styles.start}>
			<div className={styles.container_wrapper}>
				<div className={styles.start_wrapper}>
					<div className={styles.start_content}>
						<H1>
							<b>{t('page.home.start.title')}</b>
						</H1>
					</div>

					<OuterBlock>
						<div className={styles.start_wrap}>
							<ul className={styles.start_list}>
								{stepList &&
									stepList.length > 0 &&
									stepList.map(stepItem => (
										<li key={stepItem.id}>
											<InnerBlock>
												<H4>
													<span>{stepItem.title}</span>
												</H4>

												<RootDesc>
													<span>{stepItem.subtitle}</span>
												</RootDesc>

												<strong>{stepItem.step}</strong>
											</InnerBlock>
										</li>
									))}
							</ul>

							<RootButton
								onClickBtn={handleClickSignup}
								text={t('button.sign_up')}
								icon='sign-up'
							/>
						</div>
					</OuterBlock>
				</div>
			</div>
		</section>
	)
}
