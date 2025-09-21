import { useSelector } from 'react-redux';

import { Icon } from '@/components/ui/media/Icon';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';
import { H1 } from '@/components/ui/typography/titles/H1';
import { NavBar } from '@/pages/info/components/NavBar';
import { Paragraph } from '@/pages/info/components/Paragraph';

import styles from './styles.module.scss';

export const InfoPageLayout = ({ termsList, title, iconTitle, lastUpdate }) => {
  const { isTablet, isMobile } = useSelector((state) => state.settings);
  const { isAuth, user } = useSelector((state) => state.candidate);

  return (
    <div
      className={styles.info_page_wrapper}
      style={{
        padding:
          isAuth && user.is_activated && !isMobile && !isTablet
            ? '0 40rem 40rem 0'
            : isMobile || isTablet
              ? '40rem 16rem'
              : '40rem 380rem 40rem 300rem',
      }}
    >
      {!isTablet && !isMobile && !isAuth && !user.is_activated && (
        <NavBar items={termsList} />
      )}

      <div className={styles.info_page_content}>
        {(title || iconTitle) && (
          <div className={styles.info_page_title}>
            {iconTitle && <Icon id={iconTitle} />}

            {title && (
              <H1>
                <span dangerouslySetInnerHTML={{ __html: title }} />
              </H1>
            )}
          </div>
        )}

        {lastUpdate && (
          <RootDesc>
            <span dangerouslySetInnerHTML={{ __html: lastUpdate }} />
          </RootDesc>
        )}

        {termsList &&
          termsList.length > 0 &&
          termsList.map((item) => <Paragraph key={item.id} item={item} />)}
      </div>
    </div>
  );
};
