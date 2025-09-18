import { useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import { protectedRoutes, publicRoutes, specialRoutes } from '@/routes';

export const useRouteValidation = () => {
  const location = useLocation();

  const isPathValid = useMemo(() => {
    const allRoutes = [...publicRoutes, ...protectedRoutes];
    const validSpecialRoutes = specialRoutes.filter(
      (route) => route.path !== '*'
    );
    allRoutes.push(...validSpecialRoutes);

    return allRoutes.some((route) => {
      if (route.path === location.pathname) {
        return true;
      }

      if (route.path.includes(':')) {
        const routePattern = route.path.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(location.pathname);
      }

      return false;
    });
  }, [location.pathname]);

  return {
    isPathValid,
    currentPath: location.pathname,
    isAdminContext: location.pathname.includes('/all-users'),
    isInfoPage:
      location.pathname.includes('privacy') ||
      location.pathname.includes('terms'),
    isExchangePage:
      location.pathname.includes('all-users') ||
      location.pathname.includes('profile') ||
      location.pathname.includes('settings') ||
      location.pathname.includes('contacts'),
    isAdditionalPage:
      location.pathname.includes('/wallet/details') ||
      location.pathname.includes('/diary/position/') ||
      location.pathname.includes('/table/position/') ||
      location.pathname.includes('/bookmarks/position/') ||
      location.pathname.includes('/all-users/'),
    isWalletDetailsPage: location.pathname.includes('/wallet/details'),
    isDiaryPositionPage: location.pathname.includes('/diary/position/'),
    isTablePositionPage: location.pathname.includes('/table/position/'),
    isBookmarksPositionPage: location.pathname.includes('/bookmarks/position/'),
    isAllUsersPage: location.pathname.includes('/all-users/'),
  };
};
