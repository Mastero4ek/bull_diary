import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import advantagesImage from '@/assets/images/home/advantages-bg.png';
import blobDark from '@/assets/images/home/blob-1-dark.png';
import blobLight from '@/assets/images/home/blob-1-light.png';
import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { AnimatedShowBlock } from '@/components/animations/AnimatedShowBlock';
import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { Icon } from '@/components/ui/media/Icon';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/typography/descriptions/SmallDesc';
import { H1 } from '@/components/ui/typography/titles/H1';
import { H4 } from '@/components/ui/typography/titles/H4';

import styles from './styles.module.scss';

export const Advantages = () => {
  const { t } = useTranslation();
  const { theme } = useSelector((state) => state.settings);

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
      title: t('page.home.advantages.card_2.title'),
      subtitle: t('page.home.advantages.card_2.subtitle'),
    },
    {
      id: 2,
      iconId: 'econom-clock',
      title: t('page.home.advantages.card_3.title'),
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
  ];

  return (
    <section id="advantages" className={styles.advantages}>
      <div className={styles.container_wrapper}>
        <div className={styles.advantages_wrap}>
          <div className={styles.advantages_blob}>
            <img src={theme ? blobDark : blobLight} alt="blob-image" />
          </div>

          <div className={styles.advantages_image}>
            <img src={advantagesImage} alt="Advantages-background-image" />
          </div>

          <AnimatedShowBlock
            className={styles.advantages_content}
            direction="right"
          >
            <H1>
              <b
                dangerouslySetInnerHTML={{
                  __html: t('page.home.advantages.title'),
                }}
              />
            </H1>

            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.home.advantages.subtitle'),
                }}
              />
            </RootDesc>
          </AnimatedShowBlock>
        </div>

        <OuterBlock>
          <ul className={styles.advantages_list}>
            {advantagesList &&
              advantagesList.length > 0 &&
              advantagesList.map((card, index) => (
                <AnimatedCard key={card.id} y={15} index={index}>
                  <InnerBlock>
                    <Icon id={card.iconId} />

                    <div>
                      <H4>
                        <span
                          dangerouslySetInnerHTML={{ __html: card.title }}
                        />
                      </H4>

                      <SmallDesc>
                        <span
                          dangerouslySetInnerHTML={{ __html: card.subtitle }}
                        />
                      </SmallDesc>
                    </div>
                  </InnerBlock>
                </AnimatedCard>
              ))}
          </ul>
        </OuterBlock>
      </div>
    </section>
  );
};
