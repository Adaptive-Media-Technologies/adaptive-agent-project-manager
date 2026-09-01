import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    window.gtag?.('event', 'page_view', {
      page_path: pathname + search,
      page_location: window.location.href,
    });
  }, [pathname, search]);

  useEffect(() => {
    // When a hash is present (e.g. /#features), scroll to that section instead
    // of the top — this lets homepage-rooted hash links work from inner pages
    // (the target element only exists on the homepage, so the page must mount
    // first). A double rAF gives the routed page time to render.
    if (hash) {
      const id = hash.slice(1);
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        })
      );
      return () => cancelAnimationFrame(raf);
    }
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
