import React from 'react';

import { AnimatedSidebar } from '@/components/animations/AnimatedSidebar';

import styles from './styles.module.scss';

export const SideBarFakeLayout = React.memo(() => {
  return (
    <AnimatedSidebar
      className={`${styles.sidebar_fake_wrapper}`}
    ></AnimatedSidebar>
  );
});
