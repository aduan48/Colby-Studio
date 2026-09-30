import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Define the pages where you DO NOT want to jump to the top
    const ignoredPaths = ['/contact'];

    // 2. Only scroll to the top if the current page is NOT in that list
    if (!ignoredPaths.includes(pathname)) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop; 