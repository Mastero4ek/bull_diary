import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

export const AnimatedSidebar = (props) => {
  const { handleMouseEnter, className, handleMouseLeave, children } = props;

  const { isTablet, sideBar } = useSelector((state) => state.settings);

  return (
    <motion.aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${className}`}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      animate={{
        width:
          !isTablet && (sideBar.open || sideBar.blocked_value === 'open')
            ? '300rem'
            : isTablet
              ? '80rem'
              : '100rem',
      }}
    >
      {children}
    </motion.aside>
  );
};
