import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { DotList } from '@/components/ui/data/DotList';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';

import styles from './styles.module.scss';

export const Precedence = () => {
  const { t } = useTranslation();

  const precedenceList = [
    {
      id: 0,
      text: t('page.home.precedence.list_1.title'),
    },
    {
      id: 1,
      text: t('page.home.precedence.list_2.title'),
    },
    {
      id: 2,
      text: t('page.home.precedence.list_3.title'),
    },
    {
      id: 3,
      text: t('page.home.precedence.list_4.title'),
    },
    {
      id: 4,
      text: t('page.home.precedence.list_5.title'),
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
        duration: 0.5,
        delay: 0.75,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section id="tournament" className={styles.precedence}>
      <div className={styles.container_wrapper}>
        <div className={styles.precedence_wrap}>
          <div className={styles.precedence_image}>
            <img src="" alt="Championship-banner" />
          </div>

          <motion.div
            className={styles.precedence_content}
            variants={contentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 1 }}
          >
            <H1>
              <b
                dangerouslySetInnerHTML={{
                  __html: t('page.home.precedence.title'),
                }}
              />
            </H1>

            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.home.precedence.subtitle'),
                }}
              />
            </RootDesc>

            <DotList listArr={precedenceList} direction="right" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
