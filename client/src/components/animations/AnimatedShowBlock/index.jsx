import React from 'react';

import { motion } from 'framer-motion';

export const AnimatedShowBlock = React.memo((props) => {
  const { children, className, direction = 'left' } = props;

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -100 : 100,
      filter: 'blur(2rem)',
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0rem)',
      transition: {
        duration: 0.75,
        delay: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {children}
    </motion.div>
  );
});
