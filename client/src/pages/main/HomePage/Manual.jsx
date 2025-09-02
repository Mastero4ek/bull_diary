import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';
import { H4 } from '@/components/ui/typography/titles/H4';

import styles from './styles.module.scss';

const AnimatedCard = ({ card, index }) => {
  const { t } = useTranslation();

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.85,
      rotateX: -20,
      filter: 'blur(4rem)',
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: 'blur(0rem)',
      transition: {
        duration: 0.5,
        delay: index * 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.li
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, amount: 1 }}
    >
      <OuterBlock>
        <H4>
          <span>
            <b>{card.id + 1}.</b>{' '}
            <span
              dangerouslySetInnerHTML={{
                __html: t(`page.home.manual.step_${card.id + 1}.title`),
              }}
            />
          </span>
        </H4>

        <RootDesc>
          <span dangerouslySetInnerHTML={{ __html: card.subtitle }} />
        </RootDesc>
      </OuterBlock>
    </motion.li>
  );
};

export const Manual = () => {
  const { t } = useTranslation();

  const manualList = [
    {
      id: 0,
      title: (
        <>
          <b>1.</b>{' '}
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.home.manual.step_1.title'),
            }}
          />
        </>
      ),
      subtitle: t('page.home.manual.step_1.subtitle'),
    },
    {
      id: 1,
      title: (
        <>
          <b>2.</b>{' '}
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.home.manual.step_2.title'),
            }}
          />
        </>
      ),
      subtitle: t('page.home.manual.step_2.subtitle'),
    },
    {
      id: 2,
      title: (
        <>
          <b>3.</b>{' '}
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.home.manual.step_3.title'),
            }}
          />
        </>
      ),
      subtitle: t('page.home.manual.step_3.subtitle'),
    },
    {
      id: 3,
      title: (
        <>
          <b>4.</b>{' '}
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.home.manual.step_4.title'),
            }}
          />
        </>
      ),
      subtitle: t('page.home.manual.step_4.subtitle'),
    },
    {
      id: 4,
      title: (
        <>
          <b>5.</b>{' '}
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.home.manual.step_5.title'),
            }}
          />
        </>
      ),
      subtitle: t('page.home.manual.step_5.subtitle'),
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
    <section id="manual" className={styles.manual}>
      <div className={styles.container_wrapper}>
        <div className={styles.manual_wrapper}>
          <div className={styles.manual_image}>
            <img src="" alt="Manual-background-image" />
          </div>

          <div className={styles.manual_wrap}>
            <motion.div
              className={styles.manual_content}
              variants={contentVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 1 }}
            >
              <H1>
                <b
                  dangerouslySetInnerHTML={{
                    __html: t('page.home.manual.title'),
                  }}
                />
              </H1>

              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.home.manual.subtitle'),
                  }}
                />
              </RootDesc>
            </motion.div>

            <ul className={styles.manual_list}>
              {manualList &&
                manualList.length > 0 &&
                manualList.map((card, index) => (
                  <AnimatedCard key={card.id} card={card} index={index} />
                ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
