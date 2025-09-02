import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { motion } from 'framer-motion';
import moment from 'moment/min/moment-with-locales';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import avatarDefault from '@/assets/images/general/default_avatar.png';
import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { Logo } from '@/components/ui/navigation/Logo';
import { SideBarItem } from '@/components/ui/navigation/SideBarItem';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';

import styles from './styles.module.scss';

export const UserWrapper = React.memo(() => {
  const { t } = useTranslation();

  const { isTablet, isMobile } = useSelector((state) => state.settings);
  const { user } = useSelector((state) => state.candidate);
  const [currentTime, setCurrentTime] = useState(moment());
  const [open, setOpen] = useState(false);

  const selectRef = useRef();

  const userMenu = [
    { id: 1, name: t('sidebar.profile'), link: '/profile', icon: 'profile' },
    user?.role === 'admin' && {
      id: 2,
      name: t('sidebar.users'),
      link: '/all-users',
      icon: 'all-users',
    },
    { id: 3, name: t('sidebar.settings'), link: '/settings', icon: 'settings' },
    { id: 4, name: t('sidebar.contacts'), link: '/contacts', icon: 'contacts' },
    { id: 5, name: t('sidebar.logout'), link: '/logout', icon: 'logout' },
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
    if (isMobile) {
      document.body.addEventListener('click', handleClickOutside);

      return () =>
        document.body.removeEventListener('click', handleClickOutside);
    }
  }, [handleClickOutside, isMobile]);

  useEffect(() => {
    if (!isTablet) {
      let timeoutId;

      const updateTime = () => {
        setCurrentTime(moment());

        const now = new Date();
        const msToNextSecond = 1000 - now.getMilliseconds();

        timeoutId = setTimeout(updateTime, msToNextSecond);
      };

      updateTime();

      return () => clearTimeout(timeoutId);
    }
  }, [isTablet]);

  return (
    <>
      {!isTablet && (
        <RootDesc>
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <b>{moment(currentTime).format('DD MMMM YYYY')}</b>
            <br />
            <span
              style={{
                fontWeight: '400',
                opacity: '0.5',
                display: 'inline-block',
                marginLeft: 'auto',
              }}
            >
              {moment(currentTime).format('HH:mm:ss')}
            </span>
          </span>
        </RootDesc>
      )}

      {isMobile && (
        <div className={styles.header_logo}>
          <Logo desc={false} />
        </div>
      )}

      <div
        ref={selectRef}
        onClick={isMobile ? toggleOpen : undefined}
        className={styles.header_user_wrapper}
      >
        <OuterBlock>
          <div className={styles.header_user}>
            <RootDesc>
              <span>
                {user?.name && user?.last_name
                  ? `${user.name} ${user.last_name}`
                  : t('user_default.name')}
              </span>
            </RootDesc>

            <div className={styles.header_avatar}>
              <img src={user?.cover || avatarDefault} alt="avatar" />
            </div>
          </div>
        </OuterBlock>

        {isMobile && (
          <motion.ul
            style={{
              left: 'auto',
              right: '0',
              top: '80rem',
              width: '100%',
            }}
            className={`${styles.header_settings_list}`}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            animate={{
              height: open ? 'auto' : '0',
              opacity: open ? 1 : 0,
              filter: open ? 'none' : 'blur(10rem)',
            }}
          >
            {isTablet &&
              userMenu.map((item) => (
                <li key={item.id}>
                  <SideBarItem open={true} item={item} />
                </li>
              ))}
          </motion.ul>
        )}
      </div>
    </>
  );
});
