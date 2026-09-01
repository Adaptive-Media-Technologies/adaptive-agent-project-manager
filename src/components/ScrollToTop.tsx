import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.gtag?.('event', 'page_view', {
      page_path: pathname + search,
      page_location: window.location.href,
    });
  }, [pathname, search]);

  useEffect(() => {
    const id = hash.slice(1);
    const marketingHashes = new Set([
      'features',
      'openclaw',
      'how-it-works',
      'pricing',
      'faq',
    ]);

    if (pathname !== '/' && marketingHashes.has(id)) {
      navigate({ pathname: '/', hash }, { replace: true });
      return;
    }

    if (hash) {
      const delays = [0, 50, 150, 400, 800];
      const timers: ReturnType<typeof setTimeout>[] = [];
      let found = false;

      delays.forEach((delay) => {
        timers.push(setTimeout(() => {
          if (found) return;
          const element = document.getElementById(id);
          if (element) {
            found = true;
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, delay));
      });

      return () => timers.forEach(clearTimeout);
    }
    window.scrollTo(0, 0);
  }, [pathname, search, hash, navigate]);

  return null;
};

export default ScrollToTop;
