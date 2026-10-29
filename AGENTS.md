# Project guidance

- Read `docs/project-analysis.md` before feature work. It preserves the agreed FoodOrder scope, task ownership, rules and backlog.
- This repository currently contains a structural client scaffold and Express health endpoint only. Feature routes labeled “Not implemented” must not be represented as working ordering behavior.
- Keep browser application code in `client/` and API code in `server/`; there is intentionally no root package/workspace. Do not add fake API/database behavior without an assigned task and agreed contract.
- Client boundaries follow the plan: route composition in pages, reusable UI in components, transport in services, local cart selections in stores. Use typed contracts and the `@/` alias.
- Client checks: from `client/`, run `npm run lint`, `npm run typecheck`, and `npm run build`. Server checks: from `server/`, run `npm run typecheck`, `npm run build`, and `npm test`.
