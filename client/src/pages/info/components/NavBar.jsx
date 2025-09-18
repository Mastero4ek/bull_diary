import React from 'react';

import { Link } from 'react-scroll';
import { Scrollbar } from 'react-typescript-scrollbar';

import { OuterBlock } from '@/components/layouts/utils/OuterBlock';
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';

import styles from './styles.module.scss';

export const NavBar = React.memo(({ items }) => {
  return (
    <div className={styles.nav_bar_wrapper}>
      <OuterBlock>
        <Scrollbar
          style={{ padding: '20rem' }}
          mask={true}
          maskSize={80}
          units="rem"
          contentHeight={540}
          contentPadding={8}
          barColor="var(--bgLight)"
          barWidth={4}
          barRadius={8}
          thumbColor="var(--text)"
          thumbWidth={4}
          thumbRadius={8}
        >
          <ul>
            {items &&
              items.length > 0 &&
              items.map(
                (item) =>
                  item.anchor && (
                    <li key={item.id}>
                      <Link
                        to={item.anchor}
                        spy={true}
                        smooth={true}
                        duration={500}
                        offset={-140}
                        activeClass={styles.active}
                      >
                        <RootDesc>
                          <span title={item.name}>{item.name}</span>
                        </RootDesc>
                      </Link>
                    </li>
                  )
              )}
          </ul>
        </Scrollbar>
      </OuterBlock>
    </div>
  );
});
