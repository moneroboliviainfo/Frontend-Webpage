/**
 * Feature flags configuration
 * Controls which features and sections are enabled/disabled
 */

export const FEATURE_FLAGS = {
  /**
   * Enable/disable women's section
   * When false, homepage (/) redirects to /men
   */
  WOMEN_ENABLED: true,
} as const;
