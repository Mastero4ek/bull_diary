import React, { useEffect } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { useLocation } from 'react-router-dom';

import { Logo } from '@/components/ui/navigation/Logo';
import { SideBarItem } from '@/components/ui/navigation/SideBarItem';
import { setSideBar } from '@/redux/slices/settingsSlice';

import styles from './styles.module.scss';

export const SideBarLayout = React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.candidate);
  const { sideBar, language, isTablet } = useSelector(
    (state) => state.settings
  );

  const logoutItem = { name: t('sidebar.logout'), icon: 'logout' };

  const sideBarItems = [
    { id: 0, name: t('sidebar.wallet'), link: '/wallet', icon: 'wallet' },
    {
      id: 1,
      name: t('sidebar.diary'),
      link: '/diary/positions',
      icon: 'diary',
    },
    {
      id: 2,
      name: t('sidebar.table'),
      link: '/table/positions',
      icon: 'table',
    },
    {
      id: 3,
      name: t('sidebar.bookmarks'),
      link: '/bookmarks/positions',
      icon: 'bookmarks',
    },
    { id: 4, name: t('sidebar.battle'), link: '/battle/users', icon: 'battle' },
    user?.role === 'admin' && {
      id: 5,
      name: t('sidebar.users'),
      link: '/all-users',
      icon: 'all-users',
    },
    { id: 6, name: t('sidebar.profile'), link: '/profile', icon: 'profile' },
    { id: 7, name: t('sidebar.settings'), link: '/settings', icon: 'settings' },
    { id: 8, name: t('sidebar.contacts'), link: '/contacts', icon: 'contacts' },
  ];

  useEffect(() => {
    if (!isTablet && sideBar.blocked_value === 'unblock') {
      dispatch(setSideBar({ open: false }));
    }
  }, [dispatch, isTablet, sideBar.blocked_value]);

  const handleMouseEnter = () => {
    if (!isTablet && sideBar.blocked_value === 'unblock') {
      dispatch(setSideBar({ open: true }));
    }
  };

  const handleMouseLeave = () => {
    if (!isTablet && sideBar.blocked_value === 'unblock') {
      dispatch(setSideBar({ open: false }));
    }
  };

  const shouldShowBackButton = (item) => {
    return (
      (location.pathname.includes('/wallet/details') && item.id === 0) ||
      (location.pathname.includes('/diary/position/') && item.id === 1) ||
      (location.pathname.includes('/table/position/') && item.id === 2) ||
      (location.pathname.includes('/bookmarks/position/') && item.id === 3) ||
      (location.pathname.includes('/all-users/') && item.id === 5)
    );
  };

  return (
    <motion.aside
      className={`${styles.sidebar_wrapper}`}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      animate={{
        width:
          !isTablet && (sideBar.open || sideBar.blocked_value === 'open')
            ? '300rem'
            : isTablet
              ? '80rem'
              : '100rem',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.sidebar_header}>
        <Logo
          desc={(sideBar.open || sideBar.blocked_value === 'open') && !isTablet}
        />
      </div>

      <ul className={styles.sidebar_body}>
        {sideBarItems.map(
          (item) =>
            item && (
              <li key={item.id}>
                {shouldShowBackButton(item) ? (
                  <SideBarItem
                    item={{
                      id: 0,
                      link: 'back',
                      icon: 'back-arrow',
                      name:
                        sideBar.open || sideBar.blocked_value === 'open'
                          ? `${t('sidebar.back_to')} ${
                              language === 'en' ? item.name.toLowerCase() : ''
                            }`
                          : '',
                    }}
                  />
                ) : (
                  <SideBarItem item={item} />
                )}
              </li>
            )
        )}
      </ul>

      <div className={styles.sidebar_footer}>
        <SideBarItem item={logoutItem} />
      </div>
    </motion.aside>
  );
});
