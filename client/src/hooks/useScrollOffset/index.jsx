import {
  useEffect,
  useState,
} from 'react';

import { useSelector } from 'react-redux';

export const useScrollOffset = () => {
  const { isTablet, isMobile, width } = useSelector((state) => state.settings);

  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    if (isTablet) {
      setScrollOffset(-120);
    } else if (isMobile) {
      setScrollOffset(-60);
    } else {
      setScrollOffset(-150);
    }
  }, [width, isTablet, isMobile]);

  return { scrollOffset };
};
