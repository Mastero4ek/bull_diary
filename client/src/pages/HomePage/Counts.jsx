import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';

import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { InnerBlock } from '@/components/ui/general/InnerBlock';
import { OuterBlock } from '@/components/ui/general/OuterBlock';
import { H2 } from '@/components/ui/titles/H2';

import styles from './styles.module.scss';

export const Counts = () => {
	const { t } = useTranslation()

	const countsList = [
		{
			id: 0,
			countEnd: 1745,
			text: t('page.home.counts.registered_users'),
		},
		{
			id: 1,
			countEnd: 2698,
			text: t('page.home.counts.deposits_saved'),
		},
		{
			id: 2,
			countEnd: 1002,
			text: t('page.home.counts.users_use'),
		},
		{
			id: 3,
			countEnd: 17,
			text: t('page.home.counts.tournaments_held'),
		},
	]

	return (
		<OuterBlock>
			<ul className={styles.counts}>
				{countsList &&
					countsList.length > 0 &&
					countsList.map(count => (
						<li key={count.id}>
							<InnerBlock>
								<H2>
									<CountUp duration={3} end={count.countEnd} />+
								</H2>

								<RootDesc>
									<span>{count.text}</span>
								</RootDesc>
							</InnerBlock>
						</li>
					))}

				<li>
					<InnerBlock>
						<H2>24/7</H2>

						<RootDesc>
							<span>{t('page.home.counts.client_support')}</span>
						</RootDesc>
					</InnerBlock>
				</li>
			</ul>
		</OuterBlock>
	)
}
