import React, {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';

export const AnimatedTypewritter = React.memo((props) => {
  const { text, speed = 100 } = props;

  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);

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
    if (isInView) {
      setDisplayText('');
      setCurrentIndex(0);
    }
  }, [text, isInView]);

  useEffect(() => {
    if (isInView && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed, isInView]);

  return (
    <motion.div
      initial="hidden"
      variants={variants}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      onViewportEnter={() => setIsInView(true)}
      onViewportLeave={() => setIsInView(false)}
    >
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
});
