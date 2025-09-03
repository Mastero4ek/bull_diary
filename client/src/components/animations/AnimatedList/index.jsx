import React from 'react';

import { motion } from 'framer-motion';

export const AnimatedList = React.memo((props) => {
  const { index, direction, className, children } = props;

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -100 : 100,
      scale: 0.9,
      transition: {
        duration: 0.75,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.75,
        delay: index * 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.li
      key={index}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className={className}
    >
      {children}
    </motion.li>
  );
});
