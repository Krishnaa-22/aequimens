/**
 * When enabled, the app seeds sample/mock wellness history so the UI can be
 * explored without real check-ins. This is strictly a development aid and is
 * OFF by default — real users always start with zero data.
 *
 * To turn it on locally, set VITE_ENABLE_DEMO_DATA=true in a .env file. It is
 * additionally gated behind `import.meta.env.DEV` so it can never be active
 * in a production build.
 */
export const DEMO_MODE_ENABLED: boolean =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_DATA === 'true';

/** Minimum real check-in days required for each data-driven feature. */
export const MIN_DAYS_FOR_TRENDS = 3;
export const MIN_DAYS_FOR_WEEKLY_REPORT = 5;
export const MIN_DAYS_FOR_PATTERNS = 7;
export const MIN_DAYS_FOR_SHARE_CARD = 5;
