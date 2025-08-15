import { useTranslation } from 'react-i18next';

import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { Icon } from '@/components/ui/general/Icon';
import { InnerBlock } from '@/components/ui/general/InnerBlock';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { H1 } from '@/components/ui/titles/H1';
import { H4 } from '@/components/ui/titles/H4';

import styles from './styles.module.scss';

export const Advantages = () => {
	const { t } = useTranslation()

	const advantagesList = [
		{
			id: 0,
			iconId: 'protections-keys',
			title: t('page.home.advantages.card_1.title'),
			subtitle: t('page.home.advantages.card_1.subtitle'),
		},
		{
			id: 1,
			iconId: 'save-history',
			title: <>{t('page.home.advantages.card_2.title')}</>,
			subtitle: t('page.home.advantages.card_2.subtitle'),
		},
		{
			id: 2,
			iconId: 'econom-clock',
			title: <>{t('page.home.advantages.card_3.title')}</>,
			subtitle: t('page.home.advantages.card_3.subtitle'),
		},
		{
			id: 3,
			iconId: 'people-shared',
			title: t('page.home.advantages.card_4.title'),
			subtitle: t('page.home.advantages.card_4.subtitle'),
		},
		{
			id: 4,
			iconId: 'deleted-user',
			title: t('page.home.advantages.card_5.title'),
			subtitle: t('page.home.advantages.card_5.subtitle'),
		},
	]

	return (
		<section id='advantages' className={styles.advantages}>
			<div className={styles.container_wrapper}>
				<div className={styles.advantages_wrap}>
					<div className={styles.advantages_image}>
						<img src='' alt='Advantages-background-image' />
					</div>

					<div className={styles.advantages_content}>
						<H1>
							<b>{t('page.home.advantages.title')}</b>
						</H1>

						<RootDesc>
							<span>{t('page.home.advantages.subtitle')}</span>
						</RootDesc>
					</div>
				</div>

				<OuterBlock>
					<ul className={styles.advantages_list}>
						{advantagesList &&
							advantagesList.length > 0 &&
							advantagesList.map(card => (
								<li key={card.id}>
									<InnerBlock>
										<Icon id={card.iconId} />

										<div>
											<H4>
												<span>{card.title}</span>
											</H4>

											<SmallDesc>
												<span>{card.subtitle}</span>
											</SmallDesc>
										</div>
									</InnerBlock>
								</li>
							))}
					</ul>
				</OuterBlock>
			</div>
		</section>
	)
}
