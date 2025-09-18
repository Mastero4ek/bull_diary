import React from 'react';

import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { Icon } from '@/components/ui/media/Icon';

import styles from './styles.module.scss';

export const InfoCard = React.memo(({ children, type }) => {
  const getIconByType = (type) => {
    switch (type) {
      case 'success':
        return 'checked-icon';

      case 'error':
        return 'error-icon';

      case 'warning':
        return 'warning-icon';

      case 'info':
        return 'info-icon';

      default:
        return 'info-icon';
    }
  };

  return (
    <div className={styles.info_card_wrapper}>
      <OuterBlock>
        <div className={`${styles.info_card} ${styles[`info_card_${type}`]}`}>
          <Icon id={getIconByType(type)} />

          <div className={styles.info_card_content}>{children}</div>
        </div>
      </OuterBlock>
    </div>
  );
});
