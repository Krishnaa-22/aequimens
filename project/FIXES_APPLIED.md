# Aequimens production-data cleanup

## Completed fixes

- Added local calendar date generation (`YYYY-MM-DD`) without UTC date shifting.
- Today's dashboard, missions, snapshot, and contributors now use only today's real check-in.
- Mission completion/edit/replacement updates the matching history summary and achievement progress.
- Added feature thresholds:
  - Trends: 3 real check-in days
  - Weekly report: 5 real check-in days
  - Personal patterns: 7 real check-in days
  - Share card: 5 real check-in days
- Removed sample/zero-occurrence personal patterns from production mode.
- Optional metric charts require enough real values before being shown.
- Share-card calculations use only available real values and meaningful denominators.
- Added separate `clearProgress()` and `clearAll()` storage operations.
- Reset Progress preserves preferences and onboarding; Delete All removes every Aequimens-owned key.
- Added immediate in-app state refresh after storage changes.
- Removed unused Supabase dependency.
- Removed lint warnings by separating reusable hook/context code.

## Verification

Successfully run:

```bash
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
npm run dev -- --host 127.0.0.1
```

Production dependency audit: 0 vulnerabilities.
