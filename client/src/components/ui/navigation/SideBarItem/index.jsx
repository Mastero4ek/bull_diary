import React, { useCallback } from 'react';

import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  AnimatedSidebarLink,
} from '@/components/animations/AnimatedSidebarLink';
import {
  useNotification,
} from '@/components/layouts/specialized/NotificationLayout/NotificationProvider';
import { InnerBlock } from '@/components/layouts/utils/InnerBlock';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { CheckboxSwitch } from '@/components/ui/inputs/CheckboxSwitch';
import { Icon } from '@/components/ui/media/Icon';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { usePreloadComponent } from '@/hooks/useLazyComponent';
import { useRouteValidation } from '@/hooks/useRouteValidation';
import i18n from '@/i18n';
import { logout } from '@/redux/slices/candidateSlice';
import {
  setIsLoadingLanguage,
  setIsLoadingTheme,
  setLanguage,
  setTheme,
} from '@/redux/slices/settingsSlice';
import { unwrapResult } from '@reduxjs/toolkit';

import styles from './styles.module.scss';

export const SideBarItem = React.memo(({ item, open = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();
  const { isPathValid, isInfoPage } = useRouteValidation();

  const routeToComponentMap = {
    '/wallet': 'WalletPage',
    '/diary/positions': 'DiaryPage',
    '/table/positions': 'TablePage',
    '/bookmarks/positions': 'BookmarksPage',
    '/battle/users': 'BattlePage',
    '/all-users': 'UsersPage',
    '/profile': 'ProfilePage',
    '/settings': 'SettingsPage',
    '/contacts': 'ContactsPage',
  };

  const componentName = routeToComponentMap[item?.link];
  const { preload } = usePreloadComponent(componentName);

  const { language, sideBar, isTablet, theme } = useSelector(
    (state) => state.settings
  );
  const { user } = useSelector((state) => state.candidate);

  const languageList = ['ru', 'en'];

  const handleClickItem = useCallback(async () => {
    if (item.link && item?.link === 'back') {
      navigate(-1);
    } else if (item?.link) {
      navigate(item.link);
    }

    if (item?.icon === 'logout') {
      try {
        const resultAction = await dispatch(logout());
        const originalPromiseResult = unwrapResult(resultAction);

        navigate('/home');
        showSuccess(t('error.logout_success'));
      } catch (e) {
        showError(t('error.logout_error'));
      }
    }
  }, [dispatch, showSuccess, showError, item?.icon, item?.link, navigate, t]);

  const changeLanguage = useCallback(
    (value) => {
      dispatch(setIsLoadingLanguage(true));

      document.documentElement.setAttribute('lang', value);
      Cookies.set('language', value);
      i18n.changeLanguage(value);

      dispatch(setLanguage(value));

      setTimeout(() => {
        dispatch(setIsLoadingLanguage(false));
      }, 2000);
    },
    [dispatch]
  );

  const changeTheme = useCallback(() => {
    const currentTheme = theme === true ? false : true;

    dispatch(setIsLoadingTheme(true));
    dispatch(setTheme(currentTheme));

    setTimeout(() => {
      dispatch(setIsLoadingTheme(false));
    }, 2000);
  }, [theme, dispatch]);

  const isActive = location.pathname.includes(item?.icon);
  const ItemBlock = isActive ? InnerBlock : OuterBlock;

  return (
    <ItemBlock>
      <div
        onClick={handleClickItem}
        onMouseEnter={() => {
          if (componentName) {
            preload();
          }
        }}
        className={`${item?.icon === 'theme' ? styles.item_theme : ''} ${
          styles.sidebar_body_item
        } ${
          item?.link === 'back' ? styles.sidebar_back_button : ''
        } ${isActive ? styles.active : ''}`}
        style={
          item?.link === 'back' &&
          ((sideBar.blocked_value === 'unblock' && !sideBar.open) ||
            (sideBar.blocked_value === 'close' && sideBar.open) ||
            (sideBar.blocked_value === 'close' && !sideBar.open))
            ? { gap: '0' }
            : { gap: '20rem' }
        }
      >
        <Icon id={item?.icon} />

        <AnimatedSidebarLink
          className={styles.sidebar_item_desc}
          open={
            open ||
            sideBar.open ||
            (sideBar.blocked_value === 'open' && !isTablet) ||
            location.pathname.includes('home') ||
            isInfoPage ||
            !isPathValid
          }
        >
          <RootDesc>
            <span>{item?.name}</span>
          </RootDesc>

          {item?.icon === 'theme' && (
            <div style={{ marginLeft: 'auto' }}>
              <CheckboxSwitch
                name={'theme'}
                onSwitch={changeTheme}
                checked={theme}
              />
            </div>
          )}

          {item?.icon === 'language' && (
            <ul className={styles.item_language}>
              {languageList &&
                languageList.length > 0 &&
                languageList.map((lang) => {
                  const ItemBlock = language === lang ? InnerBlock : OuterBlock;

                  return (
                    <li key={lang}>
                      <RootDesc>
                        <ItemBlock>
                          <b
                            onClick={() => changeLanguage(lang)}
                            style={
                              language === lang
                                ? {
                                    color: 'var(--primaryDef)',
                                    pointerEvents: 'none',
                                  }
                                : {}
                            }
                          >
                            {lang}
                          </b>
                        </ItemBlock>
                      </RootDesc>
                    </li>
                  );
                })}
            </ul>
          )}
        </AnimatedSidebarLink>
      </div>
    </ItemBlock>
  );
});
