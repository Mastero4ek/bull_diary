import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Cookies from 'js-cookie';
import moment from 'moment/min/moment-with-locales';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { useLocation } from 'react-router-dom';

import { BottomBar } from '@/components/layouts/core/BottomBar';
import { FooterLayout } from '@/components/layouts/core/FooterLayout';
import { HeaderLayout } from '@/components/layouts/core/HeaderLayout';
import { SideBarFakeLayout } from '@/components/layouts/core/SideBarFakeLayout';
import { SideBarLayout } from '@/components/layouts/core/SideBarLayout';
import { LazyLoader } from '@/components/layouts/utils/LazyLoader';
import { RouteRenderer } from '@/components/layouts/utils/RouteRenderer';
import { Loader } from '@/components/ui/feedback/Loader';
import { useRouteValidation } from '@/hooks/useRouteValidation';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useWebSocket } from '@/hooks/useWebSocket';
import { checkAuth } from '@/redux/slices/candidateSlice';
import { setSearch } from '@/redux/slices/filtersSlice';
import { setScreenParams } from '@/redux/slices/settingsSlice';
import { createRoutes } from '@/routes/routeConfig.js';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  const { isAuth, user, serverStatus } = useSelector(
    (state) => state.candidate
  );
  const { exchange } = useSelector((state) => state.filters);
  const {
    language,
    theme,
    mark,
    amount,
    help,
    color,
    isLoadingTheme,
    isLoadingLanguage,
    isMobile,
  } = useSelector((state) => state.settings);

  const dispatch = useDispatch();
  const location = useLocation();
  const { isPathValid } = useRouteValidation();
  const {
    connect,
    disconnect,
    subscribeToPositions,
    unsubscribeFromPositions,
    subscribeToTournaments,
    unsubscribeFromTournaments,
  } = useWebSocket();

  useSyncStatus();

  const handleResize = useCallback(() => {
    dispatch(
      setScreenParams({
        isMobile: window.innerWidth < 460,
        isTablet: window.innerWidth < 768,
        width: window.innerWidth,
      })
    );
  }, [dispatch]);

  const handleLoading = useCallback(async () => {
    try {
      const resultAction = await dispatch(checkAuth());

      const originalPromiseResult = unwrapResult(resultAction);

      if (originalPromiseResult) {
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  useEffect(() => {
    moment.locale(language);
  }, [language]);

  useEffect(() => {
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    document.documentElement.setAttribute('language', language);
    document.documentElement.dataset.theme = theme;

    Cookies.set('language', language);
    Cookies.set('dark_theme', theme);
    Cookies.set('mark', mark);
    Cookies.set('amount', amount);
    Cookies.set('color', color);
    Cookies.set('help', help);

    const favicon = document.querySelector("link[rel*='icon']");

    if (favicon) {
      favicon.href = theme ? '/favicon-dark.ico' : '/favicon-light.ico';
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize, language, theme, mark, amount, color, help]);

  useEffect(() => {
    handleLoading();
  }, [handleLoading]);

  useEffect(() => {
    if (isAuth && user?.is_activated && user?.id && exchange?.name) {
      connect();

      const timer = setTimeout(() => {
        subscribeToPositions();
        subscribeToTournaments();
      }, 1000);

      return () => {
        clearTimeout(timer);
        unsubscribeFromPositions();
        unsubscribeFromTournaments();
        disconnect();
      };
    }
  }, [
    isAuth,
    user?.is_activated,
    user?.id,
    exchange?.name,
    connect,
    subscribeToPositions,
    unsubscribeFromPositions,
    subscribeToTournaments,
    unsubscribeFromTournaments,
    disconnect,
  ]);

  useEffect(() => {
    dispatch(setSearch(''));
  }, [location, dispatch]);

  const routes = useMemo(() => createRoutes(isAuth, user), [isAuth, user]);

  return (
    <div
      style={!isPathValid ? { padding: 0 } : {}}
      className={
        isAuth && user.is_activated ? styles.app_container : styles.container
      }
    >
      {isLoading ? (
        <Loader />
      ) : (
        <LazyLoader>
          {(serverStatus === 'loading' ||
            isLoadingTheme ||
            isLoadingLanguage) && <Loader />}

          {isAuth && user.is_activated && !isMobile && (
            <>
              <SideBarLayout />
              <SideBarFakeLayout />
            </>
          )}

          <div
            style={
              !isPathValid
                ? { height: 'auto', minHeight: 'auto', gap: '60rem' }
                : {}
            }
            className={
              isAuth && user.is_activated ? styles.app_screen : styles.screen
            }
          >
            <HeaderLayout />

            <RouteRenderer routes={routes} />

            {(!isAuth || !user.is_activated) && <FooterLayout />}
          </div>

          {isAuth && user.is_activated && isMobile && <BottomBar />}
        </LazyLoader>
      )}
    </div>
  );
};
