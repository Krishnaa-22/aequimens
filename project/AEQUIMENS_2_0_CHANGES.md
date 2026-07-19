# Aequimens 2.0 — Living Wellness System

## Added

- Four-step private onboarding with preferred name, age, life stage, priority areas, daily rhythm, and check-in preference.
- A completely redesigned Living Home with:
  - animated balance orb
  - time-aware primary action
  - one clear daily focus
  - quick actions
  - connected mission pathway
  - today-so-far summary
  - personal pattern teaser
  - similar-day memory
  - recent journey trail
- Personal Goals with real-data progress.
- Private Journal with optional mood, context tags, and “what helped” tags.
- Routine Builder with reusable morning, evening, and custom routines.
- Reminder Centre with overload detection and browser permission controls.
- Optional local PIN privacy lock with inactivity auto-lock.
- Best-state profile after sufficient real tracking data.
- Similar-day comparison from genuine stored history.
- Adaptive habit difficulty suggestions after repeated missed days.
- Journal and routine activity in the wellness timeline.
- Editable Profile page.

## Product-quality improvements

- Route-level code splitting with React lazy loading.
- Error boundary to prevent blank white screens.
- Local storage schema versioning and non-destructive migration.
- Versioned backup export and safer Aequimens-only import validation.
- Existing local-first privacy, PWA, offline support, scoring, missions, streaks, and real-data thresholds preserved.

## New local storage keys

- `aequimens.profile`
- `aequimens.goals`
- `aequimens.journal`
- `aequimens.routines`
- `aequimens.routineLogs`
- `aequimens.privacyLock`
- `aequimens.schemaVersion`

## Important limitations

- PWA reminder delivery depends on browser and operating-system support; the reminder centre stores preferences but cannot guarantee background scheduling on every device.
- The local PIN is a casual privacy barrier for shared devices, not full cryptographic device protection.
- Best-state and similar-day insights are personal observations from the user’s own entries, not medical evidence.

## Verification completed

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run preview`
- Root and nested SPA routes returned HTTP 200 in production preview.
