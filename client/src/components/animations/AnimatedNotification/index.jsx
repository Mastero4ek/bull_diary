import React from 'react';

import { motion } from 'framer-motion';

export const AnimatedNotification = React.forwardRef((props, ref) => {
  const { index, className, children } = props;

  const notificationVariants = {
    initial: {
      opacity: 0,
      y: 50,
      scale: 0.3,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      key={index}
      variants={notificationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
});
