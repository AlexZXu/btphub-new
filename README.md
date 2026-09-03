# BTPHub — Next.js

Full rebuild of the original BTPHub (Vue 3 + ASP.NET + SQL Server) as a single
Next.js app: React Server Components for the frontend, Next.js route handlers
as the middleware/API layer, and MongoDB (Mongoose) as the backend store.

## Run it

```bash
npm install
npm run dev
```

That's it — with no `MONGODB_URI` set, the app starts an **embedded MongoDB**
(data persists in `.mongo-data/`) and seeds demo data on first run. For a real
database, copy `.env.example` to `.env.local` and set `MONGODB_URI`
(Atlas or local) — `JWT_SECRET` should also be changed for anything public.

### Demo accounts (password `Neighbor1!`)

| Role | Email |
|---|---|
| Customer (family) | `alex.xu@email.com` |
| Provider (sitter) | `jake.thompson@email.com` |
| Admin | `admin@btphub.com` |

## What's where

- `src/app/` — pages: public site (`/`, `/login`, `/signup`, `/neighborhoods`,
  `/contact`, `/request-neighborhood`, …), customer app (`/home/customer/*`),
  provider app (`/home/provider/*`), admin (`/admin/*`), and the API under
  `src/app/api/*`.
- `src/models/` — Mongoose schemas (User, Neighborhood, State, Customer,
  Provider, Availability, Booking, InfoRequest).
- `src/lib/` — db connection + auto-seed, JWT auth (HTTP-only cookies),
  schedule expansion (the port of the original `vwProviderSchedules` SQL view),
  data queries, formatting.
- `src/middleware.ts` — route protection for `/home/*` and `/admin/*` with
  role-based redirects.

## Mapping from the original

| Original | Here |
|---|---|
| ASP.NET `BTPHub.Api` + SQL Server | Route handlers under `/api/*` + MongoDB |
| JWT in `sessionStorage` + unused refresh flow | JWT access+refresh in HTTP-only cookies, checked in middleware |
| `vwProviderSchedules` DB view (recurrence expansion) | `src/lib/schedule.ts` (`expandRules`) incl. exclusions and biweekly repeats |
| ServiceRequest dual status (customer/provider) | Single booking status: `pending → accepted/denied`, `cancelled` |
| Buckets: upcoming/past = both-confirmed ± today; pending; cancelled | Same semantics (`src/lib/data.ts`) |
| Service types 1 Kid / 2 Kids / 1 Pet / 2 Pets | Same |
| Signup: role → age (sitters, 13+) → email → password → neighborhood | Same, plus the address step and confirm-password check |

## Deliberate fixes over the original

The original shipped with a number of broken or unfinished paths; this rebuild
implements them properly rather than porting the bugs:

- Accept/Deny on pending bookings, recurring-availability creation, exclusions,
  contact + neighborhood-request forms, and admin state/neighborhood editing
  all actually work (several had missing handlers or hardcoded IDs like
  provider `1`).
- Ownership and role checks on every mutating endpoint (the original had none),
  plus availability/double-booking validation when creating a booking.
- Login shows errors; forgot-password no longer tries to log in with a
  hardcoded password; signup posts once on submit (not on every mount).
- The customer calendar route exists (`/home/customer/schedule` was linked but
  unrouted), the greeting shows the real neighborhood (was hardcoded
  "Dunmoor"), and sitter profiles show real ages/rates (was provider 1's).
- Intentionally not ported: the "Request a Service" open-request tab and the
  provider "Open Bookings" tab (both non-functional placeholders upstream),
  and email sending (confirmation/reset links) — endpoints accept and no-op.

Old URLs (`/see-neighborhoods`, `/create/...`) redirect to their new homes.
