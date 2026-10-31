'use client';
import { useEffect, useState } from 'react';
import { BREAKPOINTS } from '@/shared/lib/breakpoints';

/**
 * Tracks whether the viewport width is below the given breakpoint.
 *
 * Returns false on the server and on the first client render, so the desktop
 * layout paints for one frame before correcting on mobile.
 */
export default function useIsMobile(
  breakpoint: number = BREAKPOINTS.mobile,
): boolean {
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
