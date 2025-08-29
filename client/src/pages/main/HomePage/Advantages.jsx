import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: 'blur(2rem)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0rem)',
      transition: {
        duration: 0.6,
        delay: 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section id="advantages" className={styles.advantages}>
      <div className={styles.container_wrapper}>
        <div className={styles.advantages_wrap}>
          <div className={styles.advantages_image}>
            <img src="" alt="Advantages-background-image" />
          </div>

          <motion.div
            className={styles.advantages_content}
            variants={contentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
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
          </motion.div>
        </div>

        <OuterBlock>
          <ul className={styles.advantages_list}>
            {advantagesList &&
              advantagesList.length > 0 &&
              advantagesList.map((card) => (
                <li key={card.id}>
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
                </li>
              ))}
          </ul>
        </OuterBlock>
      </div>
    </section>
  );
};
