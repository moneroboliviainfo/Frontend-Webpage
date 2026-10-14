/**
 * Environment configuration.
 *
 * This file used to be generated: `dev` and `build` copied env.qa.ts or
 * env.prod.ts over it, which meant a tracked file the build kept rewriting and
 * scripts that only ran on one OS (`copy` on Windows, `cp` on Linux).
 * It now reads the environment instead.
 */

const FALLBACK_API_URL = 'https://api.moneroget.com/api/';

/**
 * The fallback keeps a deploy from going down if NEXT_PUBLIC_API_URL is missing,
 * but it points at production — so warn in development, where silently talking
 * to the live API is exactly what we want to avoid.
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[env] NEXT_PUBLIC_API_URL is not set — falling back to the PRODUCTION ' +
        `API (${FALLBACK_API_URL}). Create a .env.local to point somewhere else.`,
    );
  }
  return FALLBACK_API_URL;
}

export const API_URL = resolveApiUrl();

/** How often the QR modal polls for payment confirmation. */
export const PAYMENT_VERIFICATION_INTERVAL = 5000;
