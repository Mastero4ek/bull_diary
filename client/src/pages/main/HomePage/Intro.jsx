import { useTranslation } from 'react-i18next';

import { AnimatedShowBlock } from '@/components/animations/AnimatedShowBlock';
import {
  AnimatedTypewritter,
} from '@/components/animations/AnimatedTypewritter';
import {
  usePopup,
} from '@/components/layouts/popups/PopupLayout/PopupProvider';
import { RootButton } from '@/components/ui/buttons/RootButton';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';
import { SignUpPopup } from '@/popups/auth/SignUpPopup';

import { Counts } from './Counts';
import styles from './styles.module.scss';

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
              <AnimatedTypewritter text={t('page.home.intro.title')} />
            </H1>

            <AnimatedShowBlock>
              <RootDesc>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.home.intro.description'),
                  }}
                />
              </RootDesc>
            </AnimatedShowBlock>

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
