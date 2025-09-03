import React from 'react';

import { motion } from 'framer-motion';

export const AnimatedSidebarLink = React.forwardRef((props, ref) => {
  const { open, children, className } = props;

  return (
    <motion.div
      className={className}
      ref={ref}
      initial={{ opacity: 0, x: -50, filter: 'blur(2rem)' }}
      animate={{
        opacity: open ? 1 : 0,
        x: open ? 0 : -20,
        filter: open ? 'blur(0rem)' : 'blur(2rem)',
      }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
});
