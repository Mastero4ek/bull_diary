import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import battleImageDark from '@/assets/images/home/battle-bg-dark.png';
import battleImageLight from '@/assets/images/home/battle-bg-light.png';
import blobDark from '@/assets/images/home/blob-3-dark.png';
import blobLight from '@/assets/images/home/blob-3-light.png';
import { AnimatedShowBlock } from '@/components/animations/AnimatedShowBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { DotList } from '@/components/ui/data/DotList';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';

import styles from './styles.module.scss';

export const Precedence = () => {
  const { t } = useTranslation();

  const { theme } = useSelector((state) => state.settings);

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

  return (
    <section id="tournament" className={styles.precedence}>
      <div className={styles.container_wrapper}>
        <div className={styles.precedence_wrap}>
          <div className={styles.precedence_blob}>
            <img src={theme ? blobDark : blobLight} alt="blob-image" />
          </div>

          <div className={styles.precedence_image}>
            <img
              src={theme ? battleImageDark : battleImageLight}
              alt="Championship-banner"
            />
          </div>

          <div className={styles.precedence_content}>
            <AnimatedShowBlock direction="right">
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
            </AnimatedShowBlock>

            <OuterBlock>
              <DotList listArr={precedenceList} direction="right" />
            </OuterBlock>
          </div>
        </div>
      </div>
    </section>
  );
};
