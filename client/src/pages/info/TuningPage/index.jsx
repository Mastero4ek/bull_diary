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

export const TuningPage = React.memo(() => {
  const { t } = useTranslation();

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
              <span
                dangerouslySetInnerHTML={{
                  __html: t('page.settings.tuning.content'),
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
        termsList={tuningList}
        title={t('page.settings.tuning.title')}
      />
    </>
  );
});
