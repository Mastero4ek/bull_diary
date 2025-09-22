import React, { useEffect, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { animateScroll } from 'react-scroll';

import amounts_en from '@/assets/images/pages/info/tuning/amounts-en.png';
import amounts_ru from '@/assets/images/pages/info/tuning/amounts-ru.png';
import color_en from '@/assets/images/pages/info/tuning/color-en.png';
import color_ru from '@/assets/images/pages/info/tuning/color-ru.png';
import desc_en from '@/assets/images/pages/info/tuning/desc-en.png';
import desc_ru from '@/assets/images/pages/info/tuning/desc-ru.png';
import language_en from '@/assets/images/pages/info/tuning/language-en.png';
import language_ru from '@/assets/images/pages/info/tuning/language-ru.png';
import markers_en from '@/assets/images/pages/info/tuning/markers-en.png';
import markers_ru from '@/assets/images/pages/info/tuning/markers-ru.png';
import sidebar_close_en from '@/assets/images/pages/info/tuning/sidebar-close-en.png';
import sidebar_close_ru from '@/assets/images/pages/info/tuning/sidebar-close-ru.png';
import sidebar_open_en from '@/assets/images/pages/info/tuning/sidebar-open-en.png';
import sidebar_open_ru from '@/assets/images/pages/info/tuning/sidebar-open-ru.png';
import theme_en from '@/assets/images/pages/info/tuning/theme-en.png';
import theme_ru from '@/assets/images/pages/info/tuning/theme-ru.png';
import { InfoPageLayout } from '@/components/layouts/specialized/InfoPageLayout';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';

export const TuningPage = React.memo(() => {
  const { t } = useTranslation();
  const { language } = useSelector((state) => state.settings);

  const amounts = language === 'ru' ? amounts_ru : amounts_en;
  const color = language === 'ru' ? color_ru : color_en;
  const desc = language === 'ru' ? desc_ru : desc_en;
  const lang = language === 'ru' ? language_ru : language_en;
  const markers = language === 'ru' ? markers_ru : markers_en;
  const sidebar_open = language === 'ru' ? sidebar_open_ru : sidebar_open_en;
  const sidebar_close = language === 'ru' ? sidebar_close_ru : sidebar_close_en;
  const theme = language === 'ru' ? theme_ru : theme_en;

  const tuningList = useMemo(
    () => [
      {
        id: 0,
        title: undefined,
        name: undefined,
        anchor: undefined,
        content: (
          <div>
            <RootDesc>
              <ul>
                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.tuning.language'),
                    }}
                  />

                  <img src={lang} alt="language" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.tuning.theme'),
                    }}
                  />

                  <img src={theme} alt="theme" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.tuning.markers'),
                    }}
                  />

                  <img src={markers} alt="markers" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.tuning.amounts'),
                    }}
                  />

                  <img src={amounts} alt="amounts" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.tuning.color'),
                    }}
                  />

                  <img src={color} alt="color" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.tuning.desc'),
                    }}
                  />

                  <img src={desc} alt="desc" />
                </li>

                <li>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('page.settings.tuning.sidebar'),
                    }}
                  />

                  <img src={sidebar_open} alt="sidebar_open" />
                </li>

                <li>
                  <img src={sidebar_close} alt="sidebar_close" />
                </li>
              </ul>
            </RootDesc>
          </div>
        ),
      },
    ],
    [t]
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
        termsList={tuningList}
        title={t('page.settings.tuning.title')}
      />
    </>
  );
});
