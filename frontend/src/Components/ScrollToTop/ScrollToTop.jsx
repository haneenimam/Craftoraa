import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'PUSH' || navigationType === 'REPLACE') {
      window.scrollTo(0, 0);
    }

    if (navigationType === 'POP') {
      const timeout = setTimeout(() => window.scrollTo(0, 0), 0);
      return () => clearTimeout(timeout);
    }
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
