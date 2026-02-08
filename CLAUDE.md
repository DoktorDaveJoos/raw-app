# CLAUDE.md

## Project overview

Expo/React Native workout logging app.

- **Expo** v54, **React** 19.1, **React Native** 0.81
- TypeScript, Tailwind CSS (NativeWind), React Query, Expo Router (file-based routing)

## Backend

- Laravel 12 backend at `/Users/david/Workspace/raw`
- API base URL: `https://raw.test/api` (configured via `EXPO_PUBLIC_API_URL`)
- Auth: Laravel Sanctum (Bearer token via Secure Store on mobile, localStorage on web)
- WebSockets: Laravel Reverb at `raw.test:8080`
- Backend tests: `cd /Users/david/Workspace/raw && php artisan test`

## Key directories

- `app/` — Expo Router screens (`(auth)`, `(tabs)`)
- `components/` — Reusable UI components
- `hooks/` — Custom hooks (sessions, weekly stats)
- `lib/api/` — Axios API client and endpoint modules
- `lib/store/` — Auth context, query provider
- `lib/theme/` — Colors, typography, spacing
- `e2e/` — Playwright visual regression tests

## Commands

- `npx expo start` — dev server
- `npx tsc --noEmit` — type check
- `npm run test:visual` — Playwright e2e tests

## Recent changes

- Weekly stats feature (API endpoint, carousel UI, hooks)
- Fixed `avg_rpe` / `avgIntensity` type to be `number | null` (nullable when no RPE data)
- Auth flow switched to mobile API routes
- Fixed timer, event scroll, and optimistic update bugs
