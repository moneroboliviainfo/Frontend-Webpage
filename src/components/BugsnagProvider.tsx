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
