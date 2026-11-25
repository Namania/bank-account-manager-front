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

Both values are public: they reach the browser. This file is for development; the Docker image takes its settings when the container starts (see Deployment).

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

Every push to `main` that passes lint, tests, build and `npm audit` publishes a Docker image and tags the commit:

- image `<DOCKERHUB_USERNAME>/bank-account-manager-front`, tagged `1.0.<run number>` and `latest`;
- git tag `v1.0.<run number>` on the commit that was built.

The workflow needs two repository secrets: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (a Docker Hub access token with write access).

### The image

nginx serving the built files as a non-root user, on port 8080. Nothing about an environment is baked in: the settings are read when the container starts.

| Variable | Purpose |
|---|---|
| `API_URL` | Required. Address of the API as the browser sees it, for example `https://api.example.org`. The container refuses to start without it. |
| `LOCAL_KEY` | Prefix of the `localStorage` keys. `bank_account_manager` by default. |

The image sets the security headers itself: a `Content-Security-Policy` that only allows this application and the API's origin, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` and `Permissions-Policy`. `'unsafe-inline'` is allowed for styles only, because the UI components write inline styles. HTTPS and `Strict-Transport-Security` belong to the reverse proxy in front of it.

`GET /healthz` answers `ok` for health checks.

```sh
docker build -t bank-account-manager-front .
docker run --rm -p 8080:8080 -e API_URL=http://localhost:5555 bank-account-manager-front
```

### Dokploy

Use `compose.prod.yml` as a Compose application and set, in its environment:

| Variable | Example |
|---|---|
| `DOCKER_IMAGE` | `myuser/bank-account-manager-front` |
| `API_URL` | `https://api.example.org` |
| `IMAGE_TAG` | optional, `1.0.42`; `latest` by default |

Then add the domain on the service `front`, port `8080`, with HTTPS.

On the API side, `FRONT_ORIGIN` must be the exact origin of this application (`https://app.example.org`). If the application and the API are on different sites, the API also needs `AUTH_COOKIE_SAMESITE=None`.

The application can be added to a phone's home screen: icons and `manifest.webmanifest` are in `public/`.

## License

GPL-3.0, see `LICENSE`.
