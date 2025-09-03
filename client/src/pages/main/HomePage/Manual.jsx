import { useTranslation } from 'react-i18next';

import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { AnimatedShowBlock } from '@/components/animations/AnimatedShowBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';
import { H4 } from '@/components/ui/typography/titles/H4';

import styles from './styles.module.scss';

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

  return (
    <section id="manual" className={styles.manual}>
      <div className={styles.container_wrapper}>
        <div className={styles.manual_wrapper}>
          <div className={styles.manual_image}>
            <img src="" alt="Manual-background-image" />
          </div>

          <div className={styles.manual_wrap}>
            <AnimatedShowBlock
              className={styles.manual_content}
              direction="right"
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
            </AnimatedShowBlock>

            <ul className={styles.manual_list}>
              {manualList &&
                manualList.length > 0 &&
                manualList.map((card, index) => (
                  <AnimatedCard key={card.id} index={index}>
                    <OuterBlock>
                      <H4>
                        <span>{card.title}</span>
                      </H4>

                      <RootDesc>
                        <span
                          dangerouslySetInnerHTML={{ __html: card.subtitle }}
                        />
                      </RootDesc>
                    </OuterBlock>
                  </AnimatedCard>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
