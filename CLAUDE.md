# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Unofficial React Native client for the Dawon AI Power Manager smart plug ("다원 파워매니저 AI"). Monitors real-time power usage, temperature, and estimated electricity fees for a paired smart plug via a separate backend ([Dawon-API](https://github.com/ny0510/Dawon-API)). Korean-language UI. Expo managed workflow, file-based routing via Expo Router.

Stack: React Native 0.79 + Expo 53 + TypeScript 5.8 + Expo Router 5.

## Commands

```bash
bun start          # Start Expo dev server with dev client (npm start also works)
bun run android    # Build and run on Android
bun run ios        # Build and run on iOS
bun run web        # Start web dev server

npx tsc --noEmit           # Type check
npx prettier --write .     # Format
npx prettier --check .     # Check formatting
```

No lint config (no ESLint) and no test infrastructure — verify changes with `tsc --noEmit` and manual testing in the simulator/device.

## Architecture

**Data flow:** screens in `src/app/` compose hooks from `src/hooks/` (`useDeviceData`, `useChartData`, `useStats`), which call the singleton `dawonAPI` client (`src/api/index.ts`) and hold all state. Screens themselves stay presentational — don't add fetch/state logic directly in a screen when a hook already owns that data.

- `src/api/index.ts` — `DawonAPIClient` class (singleton exported as `dawonAPI`), plus `DeviceManager` for the selected-device helpers and `APIStorage` re-export. All HTTP goes through the private `makeRequest<T>` (timeout via `AbortController`, throws `APIError`).
- `src/api/config.ts` — `APIStorage`: AsyncStorage wrapper for base URL + selected device ID. `API_CONFIG` holds storage keys and timeout/retry constants (retries aren't actually implemented in `makeRequest` yet).
- `src/api/types.ts` — response/domain types. `Device.device_profile` mirrors the raw backend shape closely (mostly untyped `string` fields) — don't over-tighten these without checking real API responses.
- `src/hooks/useDeviceData.ts` — selected device + live current-data polling (30s interval), redirects to `/onboarding` or `/onboarding/select-device` when no base URL / device is set.
- `src/hooks/useChartData.ts` — chart series for a `Target` (`hour|day|month|year`), fetches `power` and `fee` metrics in parallel and re-fetches on `chartType`/`selectedDevice` change.
- `src/hooks/useStats.ts` — derived daily/monthly stats (today vs yesterday usage, this/last month usage and fee, estimated monthly fee) built from chart data via `src/utils/date.ts` helpers.

**Onboarding/setup gate:** the app requires a base URL and a selected device before showing the dashboard. `useDeviceData` enforces this by redirecting (`router.replace`) into `src/app/onboarding/` when either is missing — keep that redirect logic in the hook, not scattered across screens.

**Routing** (Expo Router, file path = URL):

- `app/index.tsx` → `/` (dashboard)
- `app/device-detail.tsx` → `/device-detail` (charts/stats detail, reached from the header device name)
- `app/setting.tsx` → `/setting`
- `app/onboarding/index.tsx` → `/onboarding` (server URL entry)
- `app/onboarding/select-device.tsx` → `/onboarding/select-device?serverUrl=...`

## Conventions

- **Imports:** always `@/...` (maps to `src/`), never relative (`../`). External imports first, blank line, then `@/` imports; both groups alphabetized (enforced by the Prettier import-sort plugin).
- **Prettier:** `printWidth: 300` — don't wrap lines just because they're long; single quotes; `arrowParens: 'avoid'` (`x => x`, not `(x) => x`); `bracketSameLine: true` (`<View>` not `<View\n>`); `bracketSpacing: false` (`{foo}` not `{ foo }`); trailing commas everywhere. Run `npx prettier --write .` rather than hand-wrapping.
- **Components:** default-exported function components; props interface named `<Component>Props` (never generic `Props`); `StyleSheet.create({...})` assigned to a single-letter `const s`, declared _after_ the component function.
- **Naming:**

  | Pattern             | Convention         | Example                              |
  | ------------------- | ------------------ | ------------------------------------ |
  | Components          | PascalCase         | `Card`, `PowerCard`                  |
  | Variables/functions | camelCase          | `selectedDevice`                     |
  | Constants           | UPPER_SNAKE_CASE   | `API_CONFIG.BASE_URL_KEY`            |
  | Event handlers      | `handle` prefix    | `handleDeviceSelect`                 |
  | Data loaders        | `load` prefix      | `loadInitialData`                    |
  | Getters/setters     | `get`/`set` prefix | `getSelectedDevice`                  |
  | Type interfaces     | `Props` suffix     | `CardProps`                          |
  | StyleSheet variable | single letter `s`  | `const s = StyleSheet.create({...})` |

- **Errors:** never swallow silently. API layer wraps everything into `APIError` (`instanceof` checks re-throw known errors, wrap `Error`, catch-all for unknown); UI layer catches, `console.error`s, and surfaces a Korean `Alert.alert` message to the user. Storage reads (`APIStorage.get*`) are the one exception — they warn and fall back to `null` rather than throwing, since callers treat "not set yet" as normal.
- **No `any`** — type responses properly (`ChartResponse`, `CurrentDataResponse`, etc.), the one existing exception is `getRoot()`'s return type.
- Styling: `src/styles/global.ts` (`gs`) for shared layout styles (`gs.container`, `gs.scrollView`), `src/styles/theme/colors.ts` for color tokens (`colors.background/card/border/text/primary/secondary/success/danger`) — prefer these over inlining new values.
- Fonts: SUIT family (9 weights, e.g. `SuitBold`, `SuitMedium`), loaded in `app/_layout.tsx`; reference by family name in `fontFamily`, don't add new font loading elsewhere.
- Stay in Expo managed workflow — don't eject or add custom native modules that require it.

**Anti-patterns (don't do these):** relative imports instead of `@/`; a bare `Props` interface name; silently swallowed `catch` blocks; `any` types; a `StyleSheet.create` variable named anything other than `s`.
