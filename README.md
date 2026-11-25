# Bank Account Manager — Front-end

Web interface to track personal accounts: balances, transactions, categories, budgets, recurring transactions and statistics. A single-page application built with React and Vite. It talks to the REST API that lives in its own repository, `bank-account-manager-back`.

## Requirements

- Node.js 20.19 or later (24 recommended), or Docker
- A running API (see the back-end repository)

## Configuration

Copy `.env.example` to `.env`:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Address of the API **as the browser sees it**, for example `http://localhost:5555`. |
| `VITE_LOCAL_KEY` | Prefix of the keys kept in `localStorage` (theme and language). |

Both values end up in the built files: they are public.

The API must list the exact origin of this application in its `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`. In development that is `http://localhost:8080`.

## Development

```sh
npm ci
npm run dev        # http://localhost:8080
```

or, with Docker:

```sh
docker compose up  # http://localhost:8080
```

The dev server listens on this machine only. To reach it from another device, run `npm run dev -- --host`.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |

## Tests

`npm test` runs the unit tests: formatting helpers and the API client (CSRF header, refresh on 401, maintenance).

`tests/api.smoke.test.js` drives the real API modules against a real API. It is skipped unless `SMOKE_API_URL` is set, and it **writes data**: only point it at a disposable API that has the bank account and two users.

```sh
SMOKE_API_URL=http://127.0.0.1:5599 SMOKE_USER=alice SMOKE_OTHER_USER=bob SMOKE_PASSWORD=... npm test
```

The API rate-limits password changes (5 per minute) and account sharing (10 per minute), so several runs within the same minute fail on those two tests.

## How it talks to the API

- **Session.** The API keeps the tokens in `HttpOnly` cookies. This code never sees a token: every request is sent with credentials, and whether a session exists is learnt from `GET /users/me/`.
- **CSRF.** Every write carries the `X-CSRFToken` header. The token is kept in memory and asked again from `GET /csrf/` after a page reload.
- **Expiry.** On a 401 the client calls `POST /token/refresh/` once, then replays the request. If the refresh is refused, the user is sent back to the login page.
- **Maintenance.** `GET /health/` is read at start-up. Any 503 that carries `maintenance: true` switches to the maintenance screen, which polls `/health/` every 30 seconds and reloads when it is over.
- **Money.** Amounts are exchanged in euros as 2-decimal strings (`"10.50"`), never as cents.

All of this lives in `src/api/client.js`; the other files in `src/api/` are one function per call.

## Layout

| Path | Content |
|---|---|
| `src/pages` | One file per screen |
| `src/components` | Dialogs, lists, charts, layout |
| `src/components/ui` | Generated shadcn/ui components |
| `src/api` | API client and calls |
| `src/auth` | Authentication context |
| `src/lib` | Formatting and filter helpers |
| `public/lang` | Translations (`fr.json`, `en.json`) |

## Deployment

`npm run build` produces static files. Serve them over HTTPS, with every unknown path falling back to `index.html`.

Security headers are set by whatever serves the files. A starting point, with the API origin filled in:

```
Content-Security-Policy: default-src 'self'; connect-src 'self' https://<api-host>; style-src 'self' 'unsafe-inline'; img-src 'self' data:; manifest-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

`'unsafe-inline'` is needed for styles only: the UI components write inline styles.

If the application and the API are on different sites, the API needs `AUTH_COOKIE_SAMESITE=None`.

The application can be added to a phone's home screen: icons and `manifest.webmanifest` are in `public/`.

## License

GPL-3.0, see `LICENSE`.
