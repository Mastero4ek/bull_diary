import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-scroll';

import { AnimatedDropdownList } from '@/components/animations/AnimatedDropdownList';
import { Icon } from '@/components/ui/media/Icon';
import { SideBarItem } from '@/components/ui/navigation/SideBarItem';
import { useRouteValidation } from '@/hooks/useRouteValidation';
import { useScrollOffset } from '@/hooks/useScrollOffset';

import styles from './styles.module.scss';

export const SettingsList = React.memo(() => {
  const selectRef = useRef();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { isTablet } = useSelector((state) => state.settings);
  const { scrollOffset } = useScrollOffset();
  const { isPathValid, isInfoPage } = useRouteValidation();

  const themeItem = { name: t('sidebar.theme'), icon: 'theme' };
  const languageItem = { name: t('sidebar.language'), icon: 'language' };

  const mobileMenu = [
    {
      id: 0,
      name: (
        <Link
          onClick={() => setOpen(false)}
          to={'manual'}
          spy={true}
          smooth={true}
          duration={500}
          offset={scrollOffset}
        >
          <span>{t('nav.manual')}</span>
        </Link>
      ),
      icon: 'manual',
    },
    {
      id: 1,
      name: (
        <Link
          onClick={() => setOpen(false)}
          to={'advantages'}
          spy={true}
          smooth={true}
          duration={500}
          offset={scrollOffset}
        >
          {t('nav.advantages')}
        </Link>
      ),
      icon: 'bookmarks',
    },
    {
      id: 2,
      name: (
        <Link
          onClick={() => setOpen(false)}
          to={'platform'}
          spy={true}
          smooth={true}
          duration={500}
          offset={scrollOffset}
        >
          {t('nav.platform')}
        </Link>
      ),
      icon: 'platform',
    },
    {
      id: 3,
      name: (
        <Link
          onClick={() => setOpen(false)}
          to={'contacts'}
          spy={true}
          smooth={true}
          duration={500}
          offset={scrollOffset}
        >
          {t('nav.contacts')}
        </Link>
      ),
      icon: 'contacts',
    },
  ];

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleClickOutside = useCallback((e) => {
    const path = e.composedPath ? e.composedPath() : e.path;

    if (!path.includes(selectRef.current)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.body.addEventListener('click', handleClickOutside);

    return () => document.body.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={selectRef} className={styles.header_settings_wrap}>
      <div
        className={`${styles.header_settings_head} ${
          open ? styles.header_settings_head_active : ''
        }`}
        onClick={toggleOpen}
      >
        <Icon width={24} height={24} id={isTablet ? 'burger' : 'settings'} />
      </div>

      <AnimatedDropdownList
        className={`${styles.header_settings_list}`}
        isOpen={open}
        isScrollable={false}
      >
        {isTablet &&
          !isInfoPage &&
          isPathValid &&
          mobileMenu.map((item) => (
            <li key={item.id}>
              <SideBarItem item={item} />
            </li>
          ))}

        <li>
          <SideBarItem item={themeItem} />
        </li>

        <li>
          <SideBarItem item={languageItem} />
        </li>
      </AnimatedDropdownList>
    </div>
  );
});
