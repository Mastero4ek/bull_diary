import { useTranslation } from 'react-i18next';

import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { AnimatedCounts } from '@/components/animations/AnimatedCounts';
import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H2 } from '@/components/ui/typography/titles/H2';

import styles from './styles.module.scss';

export const Counts = () => {
  const { t } = useTranslation();

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
  ];

  return (
    <OuterBlock>
      <ul className={styles.counts}>
        {countsList &&
          countsList.length > 0 &&
          countsList.map((count, index) => (
            <AnimatedCard key={count.id} y={15} index={index}>
              <InnerBlock>
                <H2>
                  <AnimatedCounts value={count.countEnd} duration={15} />+
                </H2>

                <RootDesc>
                  <span>{count.text}</span>
                </RootDesc>
              </InnerBlock>
            </AnimatedCard>
          ))}

        <AnimatedCard y={15} index={countsList.length}>
          <InnerBlock>
            <H2>24/7</H2>

            <RootDesc>
              <span>{t('page.home.counts.client_support')}</span>
            </RootDesc>
          </InnerBlock>
        </AnimatedCard>
      </ul>
    </OuterBlock>
  );
};
