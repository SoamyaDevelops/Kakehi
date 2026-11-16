# Kakehi: Project Status

**Current phase:** 1 of 6 (Foundation), built and tested against mocks and the live database; not yet deployed. Hosting: Vercel (free Hobby plan).
**Last updated:** 2026-11-16

## Supabase project
`kakehi`, ref `jgotjavlewvfjztunvat`, region ap-south-1 (Mumbai), free tier.

## Completed (Phase 1)
- Vite + React + TypeScript app, React Router with browser history, nested routes, 404s
- Design system: tokens (light/dark), Button, Field/Password/TextArea, Avatar, Toast, Notice, EmptyState, Skeleton, Spinner, Logo
- Light/dark/system theme, persisted, no flash on load
- Registration (username availability check, validation), login, logout, session persistence
- Intended-destination redirect after login; protected routes
- Profile + password editing in Settings; appearance settings
- Responsive shell: sidebar on desktop, top bar + tab bar on mobile
- DB: classes, profiles, user_roles, admin_audit_logs, network_access_config, RLS, signup trigger
- Network architecture: DB gate `is_trusted_network()`, `network_status()`, status page, owner config RPC (hosting-independent)

## Pending
- Phase 2: avatars/banners, discovery, friends, blocking, presence
- Phase 3: messaging. Phase 4: media + stickers. Phase 5: notifications + Owner dashboard + reports
- Phase 6: full review, deployment
- Account deactivation/deletion workflow (Phase 1 requirement, not built)
- Password reset (see limitations)
- Gated signup Edge Function
- Owner role assignment (needs your account first)
- Settings: privacy and notifications tabs (arrive with their features)

## Network enforcement: **NOT ACTIVE**
Configured for `103.160.174.114/32`. Switched off until tested on college Wi-Fi and mobile data (`docs/NETWORK_ACCESS.md`).

## Tests performed
| Test | How | Result |
|---|---|---|
| Network gate logic (college IP, other IP, spoofed X-Forwarded-For, garbled, missing header) | SQL w/ simulated headers, rolled back | Pass |
| Signup trigger, username normalise/duplicate/invalid, role metadata ignored | SQL on live DB, rolled back | Pass |
| RLS: can't edit others, can't change status/class, can't self-grant owner, can't read network config / audit logs / call owner RPC | SQL as `authenticated`, rolled back | Pass |
| Outside network sees 0 profiles; college network sees them (enforcement on) | SQL, rolled back | Pass |
| UI: blocked screen, register/login validation and errors, redirects, refresh on nested route, back/forward, 404, theme persistence, profile save, mobile layout and no overflow (25 checks) | Headless Chromium with **mocked** Supabase responses | Pass |
| Typecheck + production build | tsc, vite | Pass |

## NOT yet tested
- The app against the live Supabase API from a browser (sandbox can't reach it)
- Whether Supabase forwards the real visitor IP in `cf-connecting-ip`; **must be checked from a deployed app**
- Real college Wi-Fi vs mobile data
- Real device / Safari / Firefox testing; formal accessibility audit (Phase 6)

## Known limitations
- No password reset by email (no real email stored). Planned: owner-assisted reset via Edge Function.
- Off-network users could create accounts by calling Supabase Auth directly (they'd see no data).
- App files are public; only data and the UI are gated (optional Edge Middleware later).
- Shared-IP and IPv6 caveats: see `docs/NETWORK_ACCESS.md`.
- Messages will not be end-to-end encrypted.

## Security notes
- Only the publishable key is in the browser; no service-role key anywhere in the repo.
- Roles can only be granted by SQL/server-side; signup metadata is ignored.
- Privileged tables are closed to the API; only SECURITY DEFINER functions touch them.

## Required external configuration
1. Supabase: Auth, Providers, Email, **turn off "Confirm email"** (you said this is done)
2. College IT answers: static IP? IPv6? (`docs/NETWORK_ACCESS.md`)
3. Vercel project + the two env vars
4. Your email for the Owner account (not needed: Owner is assigned to your username after you register)

## Next steps
1. Deploy to Vercel; run the network test plan
2. Register your account; I promote it to Owner
3. Start Phase 2
