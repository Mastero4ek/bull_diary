import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import {
  usePopup,
} from '@/components/layouts/popups/PopupLayout/PopupProvider';
import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';
import { H4 } from '@/components/ui/typography/titles/H4';
import { SignUpPopup } from '@/popups/auth/SignUpPopup';

import styles from './styles.module.scss';

const AnimatedCard = ({ card, index }) => {
  const cardVariants = {
    hidden: {
      opacity: 0,
      scale: 0.85,
      y: 25,
      filter: 'blur(4rem)',
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
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
      key={card.id}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 1 }}
    >
      <InnerBlock>
        <H4>
          <span dangerouslySetInnerHTML={{ __html: card.title }} />
        </H4>

        <RootDesc>
          <span dangerouslySetInnerHTML={{ __html: card.subtitle }} />
        </RootDesc>

        <strong dangerouslySetInnerHTML={{ __html: card.step }} />
      </InnerBlock>
    </motion.li>
  );
};

export const Start = () => {
  const { openPopup } = usePopup();
  const { t } = useTranslation();

  const handleClickSignup = () => {
    openPopup(<SignUpPopup />);
  };

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
    <section id="start" className={styles.start}>
      <div className={styles.container_wrapper}>
        <div className={styles.start_wrapper}>
          <motion.div
            className={styles.start_content}
            variants={contentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 1 }}
          >
            <H1>
              <b
                dangerouslySetInnerHTML={{ __html: t('page.home.start.title') }}
              />
            </H1>
          </motion.div>

          <OuterBlock>
            <div className={styles.start_wrap}>
              <ul className={styles.start_list}>
                {stepList &&
                  stepList.length > 0 &&
                  stepList.map((stepItem, index) => (
                    <AnimatedCard
                      key={stepItem.id}
                      card={stepItem}
                      index={index}
                    />
                  ))}
              </ul>

              <RootButton
                onClickBtn={handleClickSignup}
                text={t('button.sign_up')}
                icon="sign-up"
              />
            </div>
          </OuterBlock>
        </div>
      </div>
    </section>
  );
};
