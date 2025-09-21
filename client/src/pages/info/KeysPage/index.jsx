import React, {
  useEffect,
  useMemo,
} from 'react';

import { useTranslation } from 'react-i18next';
import { animateScroll } from 'react-scroll';

import {
  InfoPageLayout,
} from '@/components/layouts/specialized/InfoPageLayout';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';

export const KeysPage = React.memo(() => {
  const { t } = useTranslation();

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
        anchor: undefined,
        content: (
          <div>
            <RootDesc>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.settings.keys.bybit.content'),
                }}
              />
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
        termsList={keysList}
        title={t('page.settings.keys.title')}
      />
    </>
  );
});
