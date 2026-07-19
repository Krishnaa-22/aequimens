# Aequimens

**Understand your patterns. Restore your balance.**

Aequimens is a private, local-first wellness companion for tracking mood, energy, stress, sleep, habits, routines, and the everyday context around them. It turns short check-ins into practical daily actions and longer-term personal patterns without requiring an account.

**Live app:** https://aequimens.arkrishnaa24.workers.dev

## Highlights

- Adaptive daily, morning, and evening check-ins
- Personalised daily missions and custom habits
- Goals, routines, challenges, and context markers
- Private journal and local search
- Weekly insights and monthly wellness stories
- Reminder centre with habit and routine reminders
- Password-protected backup and restore
- Optional local PIN privacy lock
- Installable offline Progressive Web App
- No account, advertising, leaderboard, or public feed

## Privacy approach

Aequimens stores wellness information in the browser on the user's device. Search and analysis also run locally. Users can export a standard backup or create a password-protected backup for transfer and safekeeping.

Read the full privacy summary in [PRIVACY.md](PRIVACY.md).

## Technology

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- vite-plugin-pwa
- Cloudflare Workers Static Assets

## Run locally

```bash
cd project
npm install
npm run dev
```

Production checks:

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Deployment

The Cloudflare project uses the following repository settings:

```text
Root directory: project
Build command: npm run build
Deploy command: npx wrangler deploy
```

The static asset configuration is stored in `project/wrangler.jsonc`.

## Important limitation

Aequimens provides general wellness reflection and lifestyle guidance. It does not diagnose, treat, or replace medical or mental-health care. Browser notification delivery may be affected by device power-saving and background restrictions.

© 2026 Krishnaa A R. All rights reserved.
