import {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import {
  usePopup,
} from '@/components/layouts/popups/PopupLayout/PopupProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';
import { SignUpPopup } from '@/popups/auth/SignUpPopup';

import { Counts } from './Counts';
import styles from './styles.module.scss';

const TypewriterEffect = ({ text, speed = 100 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <b dangerouslySetInnerHTML={{ __html: displayText }}></b>

      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ display: 'inline-block' }}
        >
          |
        </motion.span>
      )}
    </motion.div>
  );
};

export const Intro = () => {
  const { openPopup } = usePopup();
  const { t } = useTranslation();

  const handleClickSignup = () => {
    openPopup(<SignUpPopup />);
  };

  return (
    <section id="intro" className={styles.intro}>
      <div className={styles.container_wrapper}>
        <div className={styles.intro_wrap}>
          <div className={styles.intro_content}>
            <H1>
              <TypewriterEffect text={t('page.home.intro.title')} />
            </H1>

            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.home.intro.description'),
                }}
              />
            </RootDesc>

            <RootButton
              onClickBtn={handleClickSignup}
              text={t('button.sign_up')}
              icon="sign-up"
            />
          </div>

          <div className={styles.intro_image}>
            <img src="" alt="intro-background-image" />
          </div>
        </div>

        <div className={styles.counts}>
          <Counts />
        </div>
      </div>
    </section>
  );
};
