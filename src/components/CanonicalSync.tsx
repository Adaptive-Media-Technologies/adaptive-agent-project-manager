import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ORIGIN = 'https://agntive.ai';

/**
 * Keeps a single canonical link + og:url in the head, reusing the pre-boot tags
 * written by index.html so there is never a gap without a user-selected canonical.
 * Query strings are ignored; trailing slashes are stripped (homepage stays "/").
 */
const CanonicalSync = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const url = ORIGIN + (pathname.replace(/\/+$/, '') || '/');

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      link.setAttribute('data-early-canonical', '');
      document.head.appendChild(link);
    }
    link.href = url;

    let og = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!og) {
      og = document.createElement('meta');
      og.setAttribute('property', 'og:url');
      og.setAttribute('data-early-canonical', '');
      document.head.appendChild(og);
    }
    og.setAttribute('content', url);
  }, [pathname]);

  return null;
};

export default CanonicalSync;
