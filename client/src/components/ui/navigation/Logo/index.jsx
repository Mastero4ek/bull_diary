import React, { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-scroll';

import logoDark from '@/assets/images/logo-dark.svg';
import logoLight from '@/assets/images/logo-light.svg';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/typography/descriptions/SmallDesc';

import styles from './styles.module.scss';

export const Logo = React.memo((props) => {
  const location = useLocation();

  const { desc = true } = props;
  const { theme, isLoadingTheme, isLoadingLanguage } = useSelector(
    (state) => state.settings
  );
  const { user, isAuth } = useSelector((state) => state.candidate);

  const logoSrc = useMemo(() => (theme ? logoDark : logoLight), [theme]);

  const { t } = useTranslation();

  const isScrollLink = useMemo(() => {
    return (
      location.pathname === '/home' &&
      !isAuth &&
      !user.is_activated &&
      !isLoadingTheme &&
      !isLoadingLanguage
    );
  }, [
    location.pathname,
    isAuth,
    user.is_activated,
    isLoadingTheme,
    isLoadingLanguage,
  ]);

  if (isScrollLink) {
    return (
      <Link
        style={!desc ? { borderRadius: '50%' } : {}}
        className={styles.logo_wrapper}
        to={'intro'}
        spy={true}
        smooth={true}
        duration={500}
        offset={-210}
      >
        <img src={logoSrc} alt="logo" />

        {desc && (
          <div className={styles.logo_desc}>
            <RootDesc>
              <span>
                <b>Bull</b> <span className={styles.lightWeight}>Diary</span>
              </span>
            </RootDesc>

            <SmallDesc>
              <span>
                <i
                  className={styles.opacity}
                  dangerouslySetInnerHTML={{ __html: t('logo.analyze_earn') }}
                />
              </span>
            </SmallDesc>
          </div>
        )}
      </Link>
    );
  } else {
    return (
      <div
        style={!desc ? { borderRadius: '50%' } : {}}
        className={styles.logo_wrapper}
      >
        <img src={logoSrc} alt="logo" />

        {desc && (
          <div className={styles.logo_desc}>
            <RootDesc>
              <span>
                <b>Bull</b> <span className={styles.lightWeight}>Diary</span>
              </span>
            </RootDesc>

            <SmallDesc>
              <span>
                <i
                  className={styles.opacity}
                  dangerouslySetInnerHTML={{ __html: t('logo.analyze_earn') }}
                />
              </span>
            </SmallDesc>
          </div>
        )}
      </div>
    );
  }
});
