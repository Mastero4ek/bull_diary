import { useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import {
  protectedRoutes,
  publicRoutes,
  specialRoutes,
} from '@/routes';

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
  };
};
