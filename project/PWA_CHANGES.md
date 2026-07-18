# Aequimens PWA changes

## Added

- Installable Progressive Web App support with `vite-plugin-pwa`.
- Web app manifest for the Aequimens name, theme, standalone display, and portrait orientation.
- Olive-and-silver 192px, 512px, maskable, favicon, and Apple touch icons.
- Generated service worker with an application-shell precache and SPA navigation fallback.
- Prompt-based update banner with **Update now** and **Later** actions.
- Global offline status banner that keeps local wellness features clearly separate from empty-data states.
- Browser install handling through `beforeinstallprompt`.
- Conditional **Install Aequimens** action in Settings.
- Mobile/PWA metadata in `index.html`.
- Static-host SPA fallback through `public/_redirects` for compatible hosts such as Netlify and Cloudflare Pages.

## Preserved

- Olive-green and silver interface.
- Local-only wellness storage.
- Adaptive check-in, scoring, missions, history, achievements, and privacy behavior.
- Safe Aequimens-only data deletion.
- Real new-user empty states and minimum-data thresholds.

## Verification completed

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm audit --omit=dev` — 0 production vulnerabilities
- Production preview responded successfully.
- Manifest, service worker, favicon, Apple icon, and all required PWA icons returned successfully.

## Manual checks after deployment

The browser install prompt requires HTTPS (or localhost). After deploying, open Aequimens in Chrome on Android, visit Settings, install the app, then test offline mode after loading the app once online.
