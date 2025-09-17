import React, { useEffect } from 'react';

import { animateScroll } from 'react-scroll';

export const NotFoundPage = React.memo(() => {
  useEffect(() => {
    animateScroll.scrollTo(0, {
      duration: 500,
      smooth: 'easeInOutQuad',
    });
  }, []);

  return <div>NotFound</div>;
});
