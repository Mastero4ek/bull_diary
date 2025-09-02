import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { InnerBlock } from '@/components/layouts/utils/InnerBlock';

import { FilterLayout } from '../../specialized/FilterLayout';
import { ExchangeMobile } from './ExchangeMobile';
import styles from './styles.module.scss';

export const PageLayout = (props) => {
  const {
    disabled = false,
    periods,
    entries,
    calendar,
    search,
    searchOptions,
    onChange,
    total,
    children,
    chartWidth = 0,
    update,
    minDate,
    placeholder,
    searchPlaceholder,
  } = props;

  const { isTablet, isMobile } = useSelector((state) => state.settings);
  const location = useLocation();

  return (
    <div className={styles.page_wrapper}>
      <InnerBlock>
        <div className={styles.page}>
          {!isMobile &&
            isTablet &&
            !(
              location.pathname.includes('all-users') ||
              location.pathname.includes('profile') ||
              location.pathname.includes('settings') ||
              location.pathname.includes('contacts')
            ) && <ExchangeMobile />}

          <FilterLayout
            disabled={disabled}
            periods={periods}
            entries={entries}
            calendar={calendar}
            search={search}
            searchOptions={searchOptions}
            onChange={onChange}
            total={total}
            update={update}
            minDate={minDate}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
          />

          {isMobile &&
            !(
              location.pathname.includes('all-users') ||
              location.pathname.includes('profile') ||
              location.pathname.includes('settings') ||
              location.pathname.includes('contacts')
            ) && <ExchangeMobile />}

          <div
            className={styles.page_content}
            style={
              chartWidth > 0
                ? { gridTemplateColumns: `1fr ${chartWidth}rem` }
                : { display: 'flex' }
            }
          >
            {children}
          </div>
        </div>
      </InnerBlock>
    </div>
  );
};
