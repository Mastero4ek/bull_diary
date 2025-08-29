import React from 'react';

import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc';

import styles from './styles.module.scss';

export const DotList = React.memo(({ listArr, direction = 'left' }) => {
  const { isTablet, isMobile } = useSelector((state) => state.settings);

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -60 : 60,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    hover: {
      scale: 1.02,
      x: direction === 'left' ? 5 : -5,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <ul
      className={`${styles.dot_list} ${
        isTablet || isMobile ? styles.center : ''
      }`}
    >
      {listArr &&
        listArr.length > 0 &&
        listArr.map((item, index) => (
          <motion.li
            key={item.id}
            className={
              (!isTablet || !isMobile) && direction === 'left'
                ? styles.left
                : styles.right
            }
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              delay: index * 5,
            }}
          >
            <RootDesc>
              <span dangerouslySetInnerHTML={{ __html: item.text }} />
            </RootDesc>
          </motion.li>
        ))}
    </ul>
  );
});
