import React, { useEffect } from 'react';

import { animateScroll } from 'react-scroll';

export const PrivacyPage = React.memo(() => {
  useEffect(() => {
    animateScroll.scrollTo(0, {
      duration: 500,
      smooth: 'easeInOutQuad',
    });
  }, []);

  return <div>Privacy</div>;
});
