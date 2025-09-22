import { AuthCallback } from '@/pages/auth/AuthCallback';
import { AuthError } from '@/pages/auth/AuthError';
import { ContactsPage } from '@/pages/info/ContactsPage';
import { KeysPage } from '@/pages/info/KeysPage';
import { NotFoundPage } from '@/pages/info/NotFoundPage';
import { PrivacyPage } from '@/pages/info/PrivacyPage';
import { TermsPage } from '@/pages/info/TermsPage';
import { TuningPage } from '@/pages/info/TuningPage';
import { BattlePage } from '@/pages/main/BattlePage';
import { BookmarksPage } from '@/pages/main/BookmarksPage';
import { DiaryPage } from '@/pages/main/DiaryPage';
import { HomePage } from '@/pages/main/HomePage';
import { PositionPage } from '@/pages/main/PositionPage';
import { ProfilePage } from '@/pages/main/ProfilePage';
import { SettingsPage } from '@/pages/main/SettingsPage';
import { TablePage } from '@/pages/main/TablePage';
import { UsersPage } from '@/pages/main/UsersPage';
import { WalletDetailsPage } from '@/pages/main/WalletDetailsPage';
import { WalletPage } from '@/pages/main/WalletPage';

export const publicRoutes = [
  {
    path: '/home',
    component: HomePage,
  },
  {
    path: '/auth/success',
    component: AuthCallback,
  },
  {
    path: '/auth/error',
    component: AuthError,
  },
  {
    path: '/privacy',
    component: PrivacyPage,
  },
  {
    path: '/terms',
    component: TermsPage,
  },
];

export const protectedRoutes = [
  {
    path: '/wallet',
    component: WalletPage,
  },
  {
    path: '/wallet/details',
    component: WalletDetailsPage,
  },
  {
    path: '/diary/positions',
    component: DiaryPage,
  },
  {
    path: '/table/positions',
    component: TablePage,
  },
  {
    path: '/table/position/:id',
    component: PositionPage,
  },
  {
    path: '/battle/users',
    component: BattlePage,
  },
  {
    path: '/bookmarks/positions',
    component: BookmarksPage,
  },
  {
    path: '/bookmarks/position/:id',
    component: PositionPage,
  },
  {
    path: '/all-users',
    component: UsersPage,
  },
  {
    path: '/all-users/:id',
    component: ProfilePage,
  },
  {
    path: '/profile',
    component: ProfilePage,
  },
  {
    path: '/settings',
    component: SettingsPage,
  },
  {
    path: '/contacts',
    component: ContactsPage,
  },
  {
    path: '/settings/keys',
    component: KeysPage,
  },
  {
    path: '/settings/tuning',
    component: TuningPage,
  },
];

export const specialRoutes = [
  {
    path: '/',
    redirect: (isAuth, user) =>
      isAuth && user?.is_activated ? '/wallet' : '/home',
  },
  {
    path: '*',
    component: NotFoundPage,
  },
];

export const createRoutes = (isAuth, user) => {
  const routes = [];

  specialRoutes.forEach((route) => {
    if (route.redirect && typeof route.redirect === 'function') {
      const redirectPath = route.redirect(isAuth, user);
      routes.push({
        ...route,
        redirect: redirectPath,
      });
    } else if (route.component) {
      routes.push(route);
    }
  });

  publicRoutes.forEach((route) => {
    if (route.component) {
      if (route.path === '/home' && isAuth && user?.is_activated) {
        routes.push({
          path: '/home',
          redirect: '/wallet',
        });
      } else {
        routes.push(route);
      }
    }
  });

  if (isAuth && user?.is_activated) {
    protectedRoutes.forEach((route) => {
      if (route.component) {
        routes.push(route);
      }
    });
  } else {
    protectedRoutes.forEach((route) => {
      routes.push({
        path: route.path,
        redirect: '/home',
      });
    });
  }

  return routes.filter((route) => route && route.path);
};
