import React from 'react';

import { useSelector } from 'react-redux';
import { Link } from 'react-scroll';

import {
  NotificationLayout,
} from '@/components/layouts/specialized/NotificationLayout';
import { Logo } from '@/components/ui/navigation/Logo';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { useNavList } from '@/hooks/useNavigation';
import { useRouteValidation } from '@/hooks/useRouteValidation';
import { useScrollOffset } from '@/hooks/useScrollOffset';

import { Exchange } from './Exchange';
import { SettingsWrapper } from './SettingsWrapper';
import styles from './styles.module.scss';
import { UserWrapper } from './UserWrapper';

export const HeaderLayout = React.memo(() => {
  const { NAVLIST } = useNavList();
  const { scrollOffset } = useScrollOffset();
  const { isPathValid, isInfoPage, isExchangePage } = useRouteValidation();

  const { isTablet, isMobile } = useSelector((state) => state.settings);
  const { isAuth, user } = useSelector((state) => state.candidate);

  return (
    <header
      style={
        isAuth && user.is_activated
          ? {
              paddingRight: isMobile ? '0' : isTablet ? '16rem' : '40rem',
            }
          : isPathValid
            ? { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }
            : { position: 'relative' }
      }
    >
      <div className={styles.header_wrapper}>
        {isAuth && user.is_activated ? (
          isMobile || isTablet || (!isExchangePage && <Exchange />)
        ) : (
          <div className={styles.header_logo}>
            <Logo desc={isMobile ? false : true} />
          </div>
        )}

        {!isAuth &&
          !isTablet &&
          !user.is_activated &&
          isPathValid &&
          !isInfoPage && (
            <nav className={styles.header_nav}>
              <ul>
                {NAVLIST &&
                  NAVLIST.length > 0 &&
                  NAVLIST.map((nav) => (
                    <li key={nav?.id}>
                      <RootDesc>
                        <Link
                          to={nav?.anchor}
                          spy={true}
                          smooth={true}
                          duration={500}
                          offset={scrollOffset}
                        >
                          <span>{nav?.name}</span>
                        </Link>
                      </RootDesc>
                    </li>
                  ))}
              </ul>
            </nav>
          )}

        {isAuth && user.is_activated ? <UserWrapper /> : <SettingsWrapper />}

        <NotificationLayout />
      </div>
    </header>
  );
});
