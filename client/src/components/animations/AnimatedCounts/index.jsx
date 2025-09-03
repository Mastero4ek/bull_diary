import {
  useEffect,
  useState,
} from 'react';

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from 'framer-motion';

export const AnimatedCounts = (props) => {
  const { value, duration = 2 } = props;

  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  const numberString = displayValue.toString();
  const digits = numberString.split('');

  const variants = {
    hidden: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  useMotionValueEvent(count, 'change', (latest) => {
    setDisplayValue(Math.round(latest));
  });

  useEffect(() => {
    const controls = animate(count, value, { duration });

    return controls.stop;
  }, [count, value, duration]);

  return (
    <>
      {digits &&
        digits.length > 0 &&
        digits.map((digit, index) => (
          <motion.span
            key={index}
            initial="hidden"
            animate="visible"
            variants={variants}
          >
            {digit}
          </motion.span>
        ))}
    </>
  );
};
