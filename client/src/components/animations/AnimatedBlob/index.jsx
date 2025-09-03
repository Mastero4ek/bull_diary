import {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';

export const AnimatedBlob = ({ children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const animatePosition = () => {
      const randomX = (Math.random() - 0.5) * 3;
      const randomY = (Math.random() - 0.5) * 3;

      setPosition({ x: randomX, y: randomY });
    };

    const interval = setInterval(animatePosition, 100 + Math.random() * 100);

    animatePosition();

    return () => clearInterval(interval);
  }, []);

  const variants = {
    hidden: { opacity: 0, x: 0, y: 0 },
    visible: {
      opacity: 1,
      x: position.x,
      y: position.y,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        x: { duration: 0.5, ease: 'easeInOut' },
        y: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    exit: { opacity: 0, x: 0, y: 0 },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: 'relative',
        transform: `translate(${position.x}%, ${position.y}%)`,
        transition: 'transform 0.5s ease-in-out',
      }}
    >
      {children}
    </motion.div>
  );
};
