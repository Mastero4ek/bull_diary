import React, { useEffect } from 'react';

import { animateScroll } from 'react-scroll';

export const TermsPage = React.memo(() => {
  useEffect(() => {
    animateScroll.scrollTo(0, {
      duration: 500,
      smooth: 'easeInOutQuad',
    });
  }, []);

  return <div>Terms</div>;
});
