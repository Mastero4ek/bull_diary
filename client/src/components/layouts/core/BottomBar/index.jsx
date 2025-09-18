import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { Icon } from '@/components/ui/media/Icon';
import { SmallDesc } from '@/components/ui/typography/descriptions/SmallDesc';
import { useRouteValidation } from '@/hooks/useRouteValidation';

import styles from './styles.module.scss';

export const BottomBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    isWalletDetailsPage,
    isDiaryPositionPage,
    isTablePositionPage,
    isBookmarksPositionPage,
    isAllUsersPage,
  } = useRouteValidation();

  const { language } = useSelector((state) => state.settings);

  const menuItems = [
    { id: 0, name: t('sidebar.battle'), link: '/battle/users', icon: 'battle' },

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
    { id: 4, name: t('sidebar.wallet'), link: '/wallet', icon: 'wallet' },
  ];

  const backButton = { id: 777, link: 'back', icon: 'back-arrow' };

  const shouldShowBackButton = (item) => {
    return (
      (isWalletDetailsPage && item.id === 4) ||
      (isDiaryPositionPage && item.id === 1) ||
      (isTablePositionPage && item.id === 2) ||
      (isBookmarksPositionPage && item.id === 3) ||
      (isAllUsersPage && item.id === 5)
    );
  };

  return (
    <div className={styles.bottom_bar_wrapper}>
      <OuterBlock>
        <ul className={styles.bottom_bar_list}>
          {menuItems.map((item) => (
            <li
              key={item?.id}
              className={
                location.pathname === item?.link || shouldShowBackButton(item)
                  ? styles.active
                  : ''
              }
            >
              {shouldShowBackButton(item) ? (
                <Link to={item?.link}>
                  <Icon id={backButton?.icon} />

                  <SmallDesc>
                    <span>{`${t('sidebar.back_to')} ${language === 'en' ? item.name.toLowerCase() : ''}`}</span>
                  </SmallDesc>
                </Link>
              ) : (
                <Link to={item?.link}>
                  <Icon id={item?.icon} />

                  <SmallDesc>
                    <span>{item?.name}</span>
                  </SmallDesc>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </OuterBlock>
    </div>
  );
};
