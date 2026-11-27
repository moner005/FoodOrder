# Project guidance

- Read `docs/project-analysis.md` and `docs/api-contract.md` before feature work. The earlier Express scaffold and original backlog are historical.
- The React client talks to the NestJS API under `/api`. PostgreSQL is authoritative for users, restaurant memberships, menus, orders, and checkout receipts. The root Compose file runs the isolated local PostgreSQL service.
- Keep browser application code in `client/` and API code in `server/`. The old Express backup remains inactive. Keep browser-only demo personas and mock catalog writes out of the integrated application.
- Client boundaries follow the plan: route composition in pages, reusable UI in components, transport in services, local cart selections in stores. Use typed contracts and the `@/` alias.
- Client checks from `client/` are `npm run lint`, `npm run typecheck`, and `npm run build`. Server checks from `server/` are `npm run build` and `npm test`, after generating the Prisma client.
