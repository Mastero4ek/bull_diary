import { motion } from 'framer-motion';

export const AnimatedChartTooltip = (props) => {
  const { className, children } = props;

  const variants = {
    hidden: {
      opacity: 0,
      scale: 0.7,
      filter: 'blur(10rem)',
      transition: { duration: 0.25 },
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0rem)',
      transition: { duration: 0.25 },
    },
    exit: {
      opacity: 0,
      scale: 0.7,
      filter: 'blur(10rem)',
      transition: { duration: 0.25 },
    },
  };

  return (
    <motion.article
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
    >
      {children}
    </motion.article>
  );
};
