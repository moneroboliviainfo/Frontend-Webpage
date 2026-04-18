'use client';

import React from 'react';
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import BugsnagPerformance from '@bugsnag/browser-performance';

const BUGSNAG_API_KEY =
  process.env.NEXT_PUBLIC_BUGSNAG_API_KEY || '1d8838fdaa2058492582b7ac8733c0ca';

let bugsnagStarted = false;

function initBugsnag() {
  if (bugsnagStarted || typeof window === 'undefined') return;

  try {
    Bugsnag.start({
      apiKey: BUGSNAG_API_KEY,
      plugins: [new BugsnagPluginReact()],
      onError: (event: any) => {
        try {
          const err = event?.errors?.[0];
          const message = err?.errorMessage ?? '';
          const klass = err?.errorClass ?? '';

          if (
            klass === 'ChunkLoadError' ||
            /Loading chunk/.test(message) ||
            /ChunkLoadError/.test(message)
          ) {
            // Likely a stale/cached asset or missing chunk on the host.
            // Attempt a full reload to recover and don't send this to Bugsnag.
            if (typeof window !== 'undefined') {
              try {
                window.location.reload();
              } catch (e) {
                // ignore
              }
            }
            // `event.ignore()` is available at runtime from Bugsnag but
            // the TS type may not include it — cast to `any` to call.
            (event as any).ignore && (event as any).ignore();
          }
        } catch (e) {
          // swallow any errors in the filter
        }
      },
    });

    // Performance is optional; start if available
    try {
      BugsnagPerformance.start({ apiKey: BUGSNAG_API_KEY });
    } catch (e) {
      // ignore if performance plugin fails to start
      // eslint-disable-next-line no-console
      console.warn('Bugsnag performance not started', e);
    }

    bugsnagStarted = true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to start Bugsnag', e);
  }
}

export default function BugsnagProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  initBugsnag();

  const plugin = Bugsnag.getPlugin && Bugsnag.getPlugin('react');
  const ErrorBoundary = plugin?.createErrorBoundary
    ? plugin.createErrorBoundary(React)
    : null;

  if (ErrorBoundary) {
    // @ts-ignore - plugin returns a React component factory
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  return <>{children}</>;
}
