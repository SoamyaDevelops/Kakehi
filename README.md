# Kakehi

A private, class-only social and messaging web app. React + Vite + TypeScript on the front end,
Supabase (Postgres, Auth, Realtime, Storage) for the backend, Vercel (free Hobby plan) for hosting.

Status: **Phase 1 of 6**. See `PROJECT_STATUS.md`.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + publishable key
npm run dev
```

Only the **publishable** key belongs in the front end. Never use a `service_role` key in any `VITE_` variable.

## Scripts

`npm run dev` · `npm run build` · `npm run preview`

## Structure

```
src/
  components/ui/   Reusable design-system parts (Button, Field, Avatar, Feedback, Logo)
  context/         Theme, Toast, Network, Auth providers
  hooks/           Reusable hooks
  layouts/         AuthLayout, AppLayout (responsive shell)
  lib/             Supabase client, validation
  pages/           Route pages (+ settings/)
  routes/          NetworkGate and auth guards
  services/        All Supabase calls (auth, profiles, network)
  styles/          tokens.css (colours/type/spacing), base.css, components.css
  types/           Database types
vercel.json        SPA fallback + security headers
supabase/migrations/  Version-controlled SQL
docs/NETWORK_ACCESS.md  How network restriction works, test plan
```

## Deploy (Vercel)

1. Push this folder to a GitHub repository.
2. On vercel.com, **Add New, Project**, import the repo. Vercel detects Vite; `vercel.json` sets the rest.
3. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Deploy, then follow `docs/NETWORK_ACCESS.md` before turning network enforcement on.

## Sign-in model

Students sign in with a **username**. Supabase Auth requires an email, so an internal address
(`username@kakehi.users.example.com`) is derived from it. No email is ever sent. Consequence: there is no
self-service "forgot password" by email yet (see Known limitations in `PROJECT_STATUS.md`).

## Privacy honesty

Messages are stored on the server and are **not end-to-end encrypted**.
