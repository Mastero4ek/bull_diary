import {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';

export const AnimatedTypewritter = (props) => {
  const { text, speed = 100 } = props;

  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const variants = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <motion.div initial="hidden" animate="visible" variants={variants}>
      <b dangerouslySetInnerHTML={{ __html: displayText }}></b>

      {currentIndex < text.length && (
        <motion.span
          initial="hidden"
          animate="visible"
          variants={variants}
          style={{ display: 'inline-block' }}
        >
          |
        </motion.span>
      )}
    </motion.div>
  );
};
