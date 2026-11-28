# SwiftBite release verification

## Isolated browser and load environment

Run browser and load checks against a disposable database and separate local
ports. The browser suite signs in and creates orders and accounts.

1. Follow the [installation guide](../README.md), including dependency install
   and Prisma client generation.
2. Create a separate Compose environment file with a unique
   `FOODORDER_DB_PASSWORD` and `FOODORDER_DB_PORT=55435`. From the root, start it
   with `docker compose -p swiftbite-release-qa --env-file <qa-env-file> up -d --wait`.
3. Create a separate API environment file with the matching database URL
   `postgresql://foodorder:<password>@127.0.0.1:55435/foodorder_integrated?schema=public`,
   a unique `JWT_SECRET` of at least 32 characters, `HOST=127.0.0.1`,
   `PORT=3303`, `CLIENT_ORIGIN=http://127.0.0.1:4192`, and `NODE_ENV=production`.
   From `server/`, run
   `node --env-file=<qa-api-env-file> node_modules/prisma/build/index.js migrate deploy`
   and `npm run build`. Set `FOODORDER_PREVIEW_PASSWORD` to a local fixture
   password and run `node --env-file=<qa-api-env-file> prisma/seed-preview.mjs`.
   For local listing checks, also run `node --env-file=<qa-api-env-file> prisma/seed-lattakia.mjs`.
   Start the API with `node --env-file=<qa-api-env-file> dist/main.js`.
4. Set `VITE_API_URL=http://127.0.0.1:3303/api` for the frontend build. From
   `client/`, run `npm run build`, then
   `npm exec -- vite preview --host 127.0.0.1 --port 4192 --strictPort`.

Use `docker compose -p swiftbite-release-qa --env-file <qa-env-file> stop` for
this database. The Compose project name keeps its lifetime separate from the
normal development database.

## Browser suite

From `client/`, install the browser engines with `npx playwright install chromium firefox webkit`.
On Linux, use `npx playwright install --with-deps chromium firefox webkit` if
the host needs the system libraries. Set these variables for the QA terminal.

```powershell
$env:SWIFTBITE_E2E_ISOLATED = '1'
$env:SWIFTBITE_E2E_BASE_URL = 'http://127.0.0.1:4192'
$env:SWIFTBITE_E2E_API_URL = 'http://127.0.0.1:3303/api'
$env:SWIFTBITE_QA_PASSWORD = '<the password used to seed the QA accounts>'
npm run test:e2e
```

The matrix covers desktop Chromium, Firefox, WebKit, and a narrow Chromium
viewport. The suite checks navigation, search, menu availability, sign-in,
customer access rules, grouped checkout and receipt persistence, owner menu
changes, and platform administration. Run `npx playwright show-report` from
`client/` to view the HTML report. WebKit and the narrow viewport run on the
test host. Physical mobile devices and native Safari require separate runs.

## Load and database checks

From the root, run `node scripts/load-check.mjs 2000 20` for 2,000 read
requests at concurrency 20. The script reports errors and latency
percentiles for the home document, catalog, venue, and menu. It accepts
only loopback URLs.

Run `npm audit --omit=dev` in `client/` and `server/` for a production
dependency check. Run `npm audit` separately to include developer tooling.

## Local results on 28 November 2026

| Check | Result |
| --- | --- |
| Frontend | Type check and production build passed. Lint reported one existing Profile hook warning and zero errors. |
| Browser | 33 of 33 passed with Playwright 1.59.0 across Chromium, Firefox, WebKit, and narrow Chromium against the compiled API and Docker PostgreSQL. |
| API | Compiled successfully. 16 unit tests and one HTTP smoke test passed. |
| PostgreSQL | Four migrations applied to a fresh database. A separate `pg_dump` and `pg_restore` rehearsal recovered the migration history, five approved fixture restaurants, and three fixture accounts. |
| Read load | 2,000 loopback reads at concurrency 20 with zero errors. The 95th-percentile times were 2.9 ms for the home document, 20.5 ms for the catalog, 31.0 ms for restaurant detail, and 40.3 ms for its dishes. |
| Lattakia | Both local databases received six catalog records. Repeating the QA import added zero rows. The storefront search and a menu-less listing were checked in Chromium at 542 px. |
| Security | Source review completed. The production API rejected the JWT example value and disabled Swagger by default. Production-only dependency audits found zero known vulnerabilities in each package. Developer-tool advisories and authentication findings remain open. |
| Production | Cloudflare MCP returned HTTP 403 for the deployment resources. A durable target PostgreSQL instance is still required. |

## Lattakia catalog

The optional import inserts only missing restaurant slugs and preserves
existing restaurant settings on rerun. It creates no account, owner
assignment, menu, or order. The listings are visible with ordering disabled.

| Listing | Public source |
| --- | --- |
| Sensation | [Restaurant contact page](https://sensation-rest.net/contact/) |
| Napoli | [Syrlista listing](https://syrlista.com/listing/مطعم-نابولي/) |
| Lahma wa Fahma | [Arabay listing](https://arabay.online/دليل/اللاذقية/لحمة-و-فحمة/) |
| Lattakia Gate | [Shofey listing](https://shofey.com/directory/مطعم-بوابة-اللاذقية/) |
| Samo’s | [Restaurant posts on Restaurants10](https://www.restaurants10.com/SY/Lattakia/113707620004556/بروستد-وشاورما-دجاجتي---فرع-اللاذقية) |
| Al Sarai | [Syrlista listing](https://syrlista.com/en/listing/al-sarai-restaurant/) |

## Production release requirements

- Confirm the deployable revision, the intended Cloudflare project, and an
  authorized persistent PostgreSQL instance. Keep database and signing
  secrets in the hosting secret manager.
- Publish the production build with its HTTPS API URL. Keep the frontend
  route fallback separate from the API routing rules. Check the exact
  browser origin against `CLIENT_ORIGIN`.
- Take a verified database backup before migrations on an existing system.
  Apply Prisma migrations once, then check API process health and a
  database-backed catalog read. Verify one authorized customer checkout and
  the expected owner and admin permissions.
- Include reviewed catalog rows only when moving local catalog data into the
  production database. Use production account provisioning for staff and
  owners and keep QA accounts and orders in the QA database.
- Resolve the outstanding authentication findings before exposing sign-in
  and registration publicly. Verify rate limiting, session revocation on
  logout and reactivation, and reauthentication and verification for login
  email changes.
- Record the deployed revision, timestamps, migration results, and rollback
  instructions. Rolling back application files alone leaves the database
  schema and writes in place.
