import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { AnimatedCounts } from '@/components/animations/AnimatedCounts';
import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H2 } from '@/components/ui/typography/titles/H2';
import { getIntroCounts } from '@/redux/slices/introSlice';

import styles from './styles.module.scss';

export const Counts = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    usersCount,
    usersActiveCount,
    ordersCount,
    tournamentsCount,
    serverStatus,
  } = useSelector((state) => state.intro);

  const countsList = [
    {
      id: 0,
      countEnd: usersCount,
      text: t('page.home.counts.registered_users'),
    },
    {
      id: 1,
      countEnd: ordersCount,
      text: t('page.home.counts.deposits_saved'),
    },
    {
      id: 2,
      countEnd: usersActiveCount,
      text: t('page.home.counts.users_use'),
    },
    {
      id: 3,
      countEnd: tournamentsCount,
      text: t('page.home.counts.tournaments_held'),
    },
  ];

  useEffect(() => {
    dispatch(getIntroCounts());
  }, [dispatch]);

  return (
    <OuterBlock>
      {serverStatus === 'success' && (
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
      )}
    </OuterBlock>
  );
};
