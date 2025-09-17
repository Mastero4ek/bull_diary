import { motion } from 'framer-motion';

export const AnimatedDropdownList = (props) => {
  const { isOpen, isScrollable = true, className, style, children } = props;

  return (
    <motion.ul
      style={style}
      className={className}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      initial={{
        height: '0',
        opacity: 0,
        filter: 'blur(10rem)',
        overflowY: 'hidden',
      }}
      animate={{
        height: isOpen ? 'auto' : '0',
        opacity: isOpen ? 1 : 0,
        filter: isOpen ? 'none' : 'blur(10rem)',
        overflowY: isOpen ? (isScrollable ? 'scroll' : 'visible') : 'hidden',
      }}
    >
      {children}
    </motion.ul>
  );
};
