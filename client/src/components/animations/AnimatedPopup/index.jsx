import React from 'react';

import { motion } from 'framer-motion';

export const AnimatedPopup = React.memo((props) => {
  const { overlayClass, popupClass, children } = props;

  const overlayVariants = {
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: 'easeIn',
      },
    },
  };

  const popupVariants = {
    visible: {
      transform: 'translateY(0)',
      transition: {
        duration: 0.35,
        ease: 'easeOut',
      },
    },
    hidden: {
      transform: 'translateY(-100vh)',
      transition: {
        duration: 0.35,
        ease: 'easeIn',
      },
    },
    exit: {
      transform: 'translateY(100vh)',
      transition: {
        duration: 0.35,
        ease: 'easeIn',
      },
    },
  };

  return (
    <motion.div
      key="popup-overlay"
      className={overlayClass}
      id="popup"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={overlayVariants}
    >
      <motion.div
        className={`${popupClass}`}
        variants={popupVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.div>
    </motion.div>
  );
});
