import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { PageLayout } from '@/components/layouts/core/PageLayout';
import { DescLayout } from '@/components/layouts/core/PageLayout/DescLayout';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { RootButton } from '@/components/ui/buttons/RootButton';

import { Keys } from './Keys';
import styles from './styles.module.scss';
import { Tuning } from './Tuning';

export const SettingsPage = React.memo(() => {
  const [changeDesc, setChangeDesc] = useState(false);
  const [openSection, setOpenSection] = useState('tuning');

  const { help, isTablet, isMobile } = useSelector((state) => state.settings);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleOpenTuning = () => {
    setOpenSection((prev) => (prev === 'tuning' ? null : 'tuning'));
    setChangeDesc(false);
  };

  const handleOpenKeys = () => {
    setOpenSection((prev) => (prev === 'keys' ? null : 'keys'));
    setChangeDesc(true);
  };

  return (
    <PageLayout
      chartWidth={help && (isTablet || isMobile) ? 0 : 600}
      filter={false}
    >
      <div style={{ marginBottom: 'auto' }}>
        <div className={styles.settings_wrapper}>
          <Keys
            handleClickRadio={() => setChangeDesc(!changeDesc)}
            isOpen={openSection === 'keys'}
            onHeaderClick={handleOpenKeys}
          />

          <Tuning
            handleClickRadio={() => setChangeDesc(!changeDesc)}
            isOpen={openSection === 'tuning'}
            onHeaderClick={handleOpenTuning}
          />
        </div>
      </div>

      {(!help || (!isTablet && !isMobile)) && (
        <OuterBlock>
          {!changeDesc ? (
            <DescLayout
              icon={'settings'}
              title={
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.settings.tuning_title'),
                  }}
                />
              }
              description={
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.settings.tuning_description'),
                  }}
                />
              }
            >
              <RootButton
                onClickBtn={() => navigate('/settings/tuning')}
                text={t('button.more')}
              />
            </DescLayout>
          ) : (
            <DescLayout
              icon={'keys'}
              title={
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.settings.keys_title'),
                  }}
                />
              }
              description={
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('page.settings.keys_description'),
                  }}
                />
              }
            >
              <RootButton
                onClickBtn={() => navigate('/settings/keys')}
                text={t('button.more')}
              />
            </DescLayout>
          )}
        </OuterBlock>
      )}
    </PageLayout>
  );
});
