import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { AnimatedSidebar } from '@/components/animations/AnimatedSidebar';
import { Logo } from '@/components/ui/navigation/Logo';
import { SideBarItem } from '@/components/ui/navigation/SideBarItem';
import { useRouteValidation } from '@/hooks/useRouteValidation';
import { setSideBar } from '@/redux/slices/settingsSlice';

import styles from './styles.module.scss';

export const SideBarLayout = React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    isWalletDetailsPage,
    isDiaryPositionPage,
    isTablePositionPage,
    isBookmarksPositionPage,
    isAllUsersPage,
  } = useRouteValidation();
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

  const backButton = { id: 777, link: 'back', icon: 'back-arrow' };

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
      (isWalletDetailsPage && item.id === 0) ||
      (isDiaryPositionPage && item.id === 1) ||
      (isTablePositionPage && item.id === 2) ||
      (isBookmarksPositionPage && item.id === 3) ||
      (isAllUsersPage && item.id === 5 && user?.role === 'admin')
    );
  };

  return (
    <AnimatedSidebar
      className={`${styles.sidebar_wrapper}`}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
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
                      ...backButton,
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
    </AnimatedSidebar>
  );
});
