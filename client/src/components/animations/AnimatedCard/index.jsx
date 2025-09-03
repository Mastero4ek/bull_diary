import { motion } from 'framer-motion';

export const AnimatedCard = (props) => {
  const { y = 60, index, children } = props;

  const cardVariants = {
    hidden: {
      opacity: 0,
      y,
      scale: 0.85,
      rotateX: -20,
      filter: 'blur(4rem)',
      transition: {
        duration: 0.5,
        delay: index * 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: 'blur(0rem)',
      transition: {
        duration: 0.5,
        delay: index * 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.li
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.75 }}
    >
      {children}
    </motion.li>
  );
};
