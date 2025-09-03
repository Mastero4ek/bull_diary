import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Logo } from '@/components/ui/navigation/Logo';

import styles from './styles.module.scss';

export const Loader = React.memo(({ logo = true }) => {
  const { isLoadingTheme } = useSelector((state) => state.settings);
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoadingTheme) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}rem`;

      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isLoadingTheme]);

  const loaderText = t('loading');

  return (
    <i
      className={styles.loader}
      style={
        isLoadingTheme ? { backdropFilter: 'blur(40rem) grayscale(100%)' } : {}
      }
    >
      {logo && <Logo desc={false} />}

      <i>
        {loaderText &&
          loaderText
            .split('')
            .map((letter, index) => <span key={index}>{letter}</span>)}
      </i>
    </i>
  );
});
