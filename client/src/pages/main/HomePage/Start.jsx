import { useTranslation } from 'react-i18next';

import { AnimatedCard } from '@/components/animations/AnimatedCard';
import {
  AnimatedTypewritter,
} from '@/components/animations/AnimatedTypewritter';
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

  return (
    <section id="start" className={styles.start}>
      <div className={styles.container_wrapper}>
        <div className={styles.start_wrapper}>
          <H1>
            <AnimatedTypewritter text={t('page.home.start.title')} />
          </H1>

          <OuterBlock>
            <div className={styles.start_wrap}>
              <ul className={styles.start_list}>
                {stepList &&
                  stepList.length > 0 &&
                  stepList.map((stepItem, index) => (
                    <AnimatedCard y={15} key={stepItem.id} index={index}>
                      <InnerBlock>
                        <H4>
                          <span
                            dangerouslySetInnerHTML={{ __html: stepItem.title }}
                          />
                        </H4>

                        <RootDesc>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: stepItem.subtitle,
                            }}
                          />
                        </RootDesc>

                        <strong
                          dangerouslySetInnerHTML={{ __html: stepItem.step }}
                        />
                      </InnerBlock>
                    </AnimatedCard>
                  ))}
              </ul>

              <AnimatedCard
                y={15}
                index={stepList.length}
                key={stepList.length}
              >
                <RootButton
                  onClickBtn={handleClickSignup}
                  text={t('button.sign_up')}
                  icon="sign-up"
                />
              </AnimatedCard>
            </div>
          </OuterBlock>
        </div>
      </div>
    </section>
  );
};
