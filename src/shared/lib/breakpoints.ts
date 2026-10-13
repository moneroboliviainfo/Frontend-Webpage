export const BREAKPOINTS = {
  /** Phone vs. larger screens. Default for the useIsMobile hook. */
  mobile: 768,
  /**
   * Where the checkout switches from modal steps to inline steps.
   * Must stay in sync with the `min-width: 1024px` queries in checkout.css —
   * if they diverge, the JS picks one layout while the CSS renders the other.
   */
  checkoutDesktop: 1024,
} as const;

/** Imperative check for event handlers, where hooks cannot be called. */
export const isBelowCheckoutDesktop = (): boolean =>
  typeof window !== 'undefined' &&
  window.innerWidth < BREAKPOINTS.checkoutDesktop;
