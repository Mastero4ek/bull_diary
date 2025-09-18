import React from 'react';

import { H2 } from '@/components/ui/typography/titles/H2';

import styles from './styles.module.scss';

export const Paragraph = React.memo(({ item }) => {
  return (
    <section id={item?.anchor} className={styles.paragraph}>
      {item?.title && (
        <div className={styles.paragraph_title}>
          <H2>{item?.title}</H2>
        </div>
      )}

      {item?.content && (
        <div className={styles.paragraph_content}>{item?.content}</div>
      )}
    </section>
  );
});
