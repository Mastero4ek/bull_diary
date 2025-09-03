import { motion } from 'framer-motion';

export const AnimatedButton = (props) => {
  const { children } = props;

  const variants = {
    hidden: {
      opacity: 0,
      y: '150%',
      transition: {
        duration: 0.75,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 1 }}
    >
      {children}
    </motion.div>
  );
};
