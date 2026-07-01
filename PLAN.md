# perfmate review & refactor plan

Freelancer time/wage tracking app, Next.js 15 App Router + raw-SQL Vercel Postgres + NextAuth. This plan covers reviewing the architecture, performance, and structure, refactoring for clarity/type safety, and extending the data model to support multiple time-logging "threads" instead of a single implicit employer.

## Phase 0 — Fix live bugs, reconstruct real schema — **Done**

- Fixed stale `@/app/ui/form/` casing imports (11 files) — was silently masked by macOS's case-insensitive filesystem but would break the production build on Vercel's case-sensitive Linux.
- Fixed an async-function-in-JSX-`.map()` bug in `app/ui/records/table.tsx` that returned Promises directly into JSX instead of rendering rows.
- Reconstructed the real production DB schema (the `users` table and `records.userid` column existed only in production, never tracked in code) into a versioned `node-pg-migrate` migration.
- Added indexes on `records(userid, date)` and `breaks(recordid)` backing the app's actual query patterns.

## Phase 1 — Multi-thread data model — **Done**

- Added `threads` table (generic term for job/org/role, per-thread `hourly_wage`, `currency`, `tax_included`, `tax_rate`) and `thread_schedules` (recurring weekdays).
- `records.thread_id` replaces the old implicit one-employer-per-user assumption; `unique_date_userid` constraint dropped and replaced with `unique_date_threadid`.
- Routes moved to `/app/[threadId]/...`; added thread switcher in the header and thread management pages at `/app/threads`.
- Signup step 2 now creates the user's first thread instead of setting a single global wage.
- Wage math (`calculateWage` in `app/lib/helpers.ts`) derives both tax-inclusive and tax-exclusive totals from `taxincluded` + `taxrate`.
- `users.hourlywages/currency/taxincluded` columns dropped (data backfilled into each user's default thread first).
- N+1 query pattern in `fetchPaginatedRecords`/`fetchRecordsToNotify` fixed opportunistically while rewriting `app/lib/api.ts` for threads (single batched breaks query instead of one query per record).

## Phase 2 — Performance — **Not started**

- Add real pagination to `/app/[threadId]/records` (helper for this exists but is unused).
- Memoize chart-data derivation in `Aggregates` (`app/ui/records/aggregates.tsx`) with `useMemo`.
- Make timezone user-configurable instead of hardcoded `"Asia/Tokyo"` in `app/lib/helpers.ts`.

## Phase 3 — Project structure cleanup — **Not started**

- Normalize component directory casing (mixed `Form/`, `BreakUnit/`, `records/`, `setting/`).
- Consolidate `app/lib/types.ts` and `app/types/next-auth.d.ts` into one location; co-locate component-specific types.

## Phase 4 — Type safety & tests — **Not started**

- Eliminate remaining `any` usages (chart.js option objects, error handlers).
- Derive TypeScript types from Zod schemas where possible instead of maintaining both by hand.
- Add test coverage for server actions, API fetch functions, and the auth flow (currently zero coverage).

## Phase 5 — Import design system via claude_design MCP — **Not started**

- Use the `claude_design` MCP server (`https://api.anthropic.com/v1/design/mcp`, authenticated via `/design-login`) to import the design system from `https://claude.ai/design/p/9708b814-a56c-4800-8788-abc9e1498666`.
- Requires the user to authenticate the MCP server first — not something Claude can do on the user's behalf.
- Should happen before Phase 6, since the shadcn/Tailwind implementation depends on the imported design tokens.

## Phase 6 — Adopt shadcn/ui + latest Tailwind — **Not started**

- Introduce `shadcn/ui` and upgrade Tailwind CSS (currently 3.4.1) to latest.
- Re-implement existing UI components (`Button`, `FormControl`, `Tag`, `Clock`, etc. under `app/ui/`) using shadcn primitives styled to match the design system imported in Phase 5.
