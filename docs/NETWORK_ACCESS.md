# Network access: how it works and how to turn it on

A website cannot read a visitor's Wi-Fi name, password, router or MAC address. Kakehi instead checks the
**public IP address** the request arrives from. Everyone on the college Wi-Fi shares one public IP
(`103.160.174.114`), so the server can tell "from the college" apart from "from elsewhere".

## How it is enforced

Enforcement lives in the **database**, so it does not depend on where the app is hosted (Vercel, Netlify, anything).

1. **Data gate (Postgres).** `is_trusted_network()` is part of every RLS policy. Someone calling the Supabase API
   directly from outside the network gets nothing.
2. **UI gate (React).** On load the app asks the server `network_status()`. Off-network visitors see the
   "not available" screen instead of the login form. The answer comes from the server, not from anything the browser sends.

The app files themselves are public static files: an off-network visitor can download the JavaScript, but sees only the
blocked screen and can read no data. (A hosting-level gate that also withholds the files can be added later with Vercel
Edge Middleware if you want it.)

Editing frontend code or local variables cannot bypass the data gate: it reads request headers inside the database.

## Current state: CONFIGURED, NOT ACTIVE

- DB: `network_access_config` holds `103.160.174.114/32`, `enforcement_enabled = false`.
- Tested: gate logic with simulated headers (SQL), IP matching (unit), RLS with enforcement on (SQL).
- **Not yet tested:** that Supabase passes the real visitor IP in the `cf-connecting-ip` header. This must be
  checked from the deployed app (steps below) before switching enforcement on.

## What to confirm with college IT

1. Is `103.160.174.114` **static**, and the only public IP students use? (Hostel Wi-Fi or other buildings may differ.)
2. Do student phones get **IPv6** on the Wi-Fi? If so we must add the college IPv6 prefix.
3. Will IT notify you before the IP changes?

## Test plan (do in this order)

1. Deploy to Vercel (enforcement is off by default).
2. On the **college Wi-Fi**, open `/network-status`. It should say *Not active yet* and *Allowed*.
3. Turn on DB enforcement (SQL editor, as the project owner):
   `update network_access_config set enforcement_enabled = true where id = 1;`
4. On college Wi-Fi: reload, you should still get in. **If you are blocked, the header isn't what we assumed. Turn it off again:**
   `update network_access_config set enforcement_enabled = false where id = 1;` and tell me.
5. On **mobile data** (Wi-Fi off): `/network-status` and `/login` must show the "not available" screen.
6. Record the date in `PROJECT_STATUS.md` and set `verified_at`.

## If the IP changes

Everyone is locked out until updated. Fix: update `trusted_cidrs` in the DB (SQL editor, or the Owner dashboard once built)
(no redeploy needed). Keep a way into the Supabase dashboard so you can turn enforcement off.

## Known limits

- Anyone sharing that public IP passes (other classes, staff, guests on the same network).
- A student who leaves campus is blocked on their next request, even if signed in.
- Account creation uses Supabase Auth, which isn't covered by RLS: an off-network visitor could still create an
  account by calling the Auth API directly. They'd see no data. Planned fix: route signup through a gated Edge Function.
- If student phones use IPv6 on the Wi-Fi, an IPv4-only rule won't match them; the IPv6 prefix must be added.
