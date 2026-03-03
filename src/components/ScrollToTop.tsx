import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    window.gtag?.('event', 'page_view', {
      page_path: pathname + search,
      page_location: window.location.href,
    });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
