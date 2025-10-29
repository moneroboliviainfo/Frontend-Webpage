import { useEffect, useState } from 'react';

/**
 * useIsMobile
 * Tracks whether the viewport width is below the provided breakpoint.
 * Defaults to 768px.
 *
 * Usage:
 * const isMobile = useIsMobile();
 */
export default function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const check = () =>
      setIsMobile(
        typeof window !== 'undefined' && window.innerWidth < breakpoint
      );
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}
