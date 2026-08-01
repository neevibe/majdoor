# MAJDOOR Mobile

The official MAJDOOR mobile experience — a native iOS + Android app built with Expo / React Native, adapted 1:1 from the MAJDOOR web platform (Bihar workforce operating system).

**One Workforce. Limitless Possibilities.**

## Run it

```bash
npm install
npx expo start
```

- Press `i` for the iOS simulator, `a` for Android, or scan the QR with **Expo Go**.
- `npx expo start --web` gives a quick browser preview (native modules — camera, maps, biometrics — fall back to graceful placeholders on web).

For a production build: `eas build --platform all` (icons, adaptive icons, splash and notification icons are already wired in `app.json`).

## Roles

Sign in as any of the seven personas from the login screen — the app reshapes itself per role:

| Role | Tabs |
|---|---|
| Worker (Sunil Kumar Manjhi) | Home · Jobs · Attendance · Wallet · Profile |
| Supervisor (Rakesh Verma) | Home · Workers · Attendance · Tasks · More |
| Agency / Contractor / Client / Govt / Super Admin | Dashboard · Workers · Projects · Finance · More |

## Feature parity with the web platform

Dashboard KPIs, Bihar 38-district geo analytics, worker registry + profile drill-down (overview/documents/attendance/salary), gang-sheet attendance, GPS + face punch-in, payroll run approval with live IMPS payout animation, salary slips (PDF via expo-print), advance & leave requests with approvals, PPE registry, document wallet, invoices, analytics + AI insights, watchdog alerts, live feed, Sahayak AI assistant (chat + voice + suggestions), notifications center, global search, QR gate pass + scanner verification, site maps & live tracking, emergency SOS, WhatsApp/call deep links, dark/light mode, Hindi-accented bilingual UI.

## Stack

Expo SDK 57 · TypeScript · expo-router · React Query · Zustand (+ AsyncStorage persistence for offline) · Reanimated 4 · react-native-maps · expo-camera / location / local-authentication / notifications / print / speech · react-native-svg + qrcode-svg · Barlow / Barlow Condensed (brand type).

Styling is a typed token system ported from the web design system (`src/theme/tokens.ts`): brand ink `#0B0D12`, Signal Blue `#2F7CF6`, the infinity gradient blue→violet→amber, steel accent ramp, Barlow type scale. (NativeWind was intentionally skipped in favor of typed tokens — same utility, zero babel/metro risk.)

## Data layer

`src/data/` — typed entities, a seeded mock API with simulated latency (mirroring every record on the web platform), React Query hooks, and Zustand stores. Swap `src/data/api.ts` for Supabase queries to go live; screens don't change.

## Live demo

Web preview of the mobile app: **https://majdoor-app.vercel.app** (native features fall back gracefully on web; use Expo Go for the full native experience).

Redeploy with `./scripts/deploy-web.sh`.
