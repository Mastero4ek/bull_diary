import React, { useEffect, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { animateScroll } from 'react-scroll';

import step_1_en from '@/assets/images/pages/info/keys/step-1-en.png';
import step_1_ru from '@/assets/images/pages/info/keys/step-1-ru.png';
import step_2_en from '@/assets/images/pages/info/keys/step-2-en.png';
import step_2_ru from '@/assets/images/pages/info/keys/step-2-ru.png';
import step_3_en from '@/assets/images/pages/info/keys/step-3-en.png';
import step_3_ru from '@/assets/images/pages/info/keys/step-3-ru.png';
import step_4_en from '@/assets/images/pages/info/keys/step-4-en.png';
import step_4_ru from '@/assets/images/pages/info/keys/step-4-ru.png';
import step_5_en from '@/assets/images/pages/info/keys/step-5-en.png';
import step_5_ru from '@/assets/images/pages/info/keys/step-5-ru.png';
import step_6_en from '@/assets/images/pages/info/keys/step-6-en.png';
import step_6_ru from '@/assets/images/pages/info/keys/step-6-ru.png';
import { InfoPageLayout } from '@/components/layouts/specialized/InfoPageLayout';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';

export const KeysPage = React.memo(() => {
  const { t } = useTranslation();
  const { language } = useSelector((state) => state.settings);

  const step_1 = language === 'ru' ? step_1_ru : step_1_en;
  const step_2 = language === 'ru' ? step_2_ru : step_2_en;
  const step_3 = language === 'ru' ? step_3_ru : step_3_en;
  const step_4 = language === 'ru' ? step_4_ru : step_4_en;
  const step_5 = language === 'ru' ? step_5_ru : step_5_en;
  const step_6 = language === 'ru' ? step_6_ru : step_6_en;

  const keysList = useMemo(
    () => [
      {
        id: 0,
        title: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.settings.keys.bybit.title'),
            }}
          />
        ),
        name: (
          <span
            dangerouslySetInnerHTML={{
              __html: t('page.settings.keys.bybit.title'),
            }}
          />
        ),
        anchor: t('page.settings.keys.bybit.title'),
        content: (
          <div>
            <RootDesc>
              <ul>
                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.keys.bybit.step_1'),
                    }}
                  />

                  <img src={step_1} alt="step-1" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.keys.bybit.step_2'),
                    }}
                  />

                  <img src={step_2} alt="step-2" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.keys.bybit.step_3'),
                    }}
                  />

                  <img src={step_3} alt="step-3" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.keys.bybit.step_4'),
                    }}
                  />

                  <img src={step_4} alt="step-4" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.keys.bybit.step_5'),
                    }}
                  />

                  <img src={step_5} alt="step-5" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.keys.bybit.step_6'),
                    }}
                  />

                  <img src={step_6} alt="step-6" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.keys.bybit.step_finish'),
                    }}
                  />
                </li>
              </ul>
            </RootDesc>
          </div>
        ),
      },
    ],
    [t, step_1, step_2, step_3, step_4, step_5, step_6]
  );

  useEffect(() => {
    animateScroll.scrollTo(0, {
      duration: 500,
      smooth: 'easeInOutQuad',
    });
  }, []);

  return (
    <>
      <InfoPageLayout
        termsList={keysList}
        title={t('page.settings.keys.title')}
      />
    </>
  );
});
