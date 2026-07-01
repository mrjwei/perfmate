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

## Phase 2 — Performance — **Done**

- Removed the unused `generatePageIndexes` helper instead of wiring it up: the records view is a full-month calendar grid (every day rendered, padded), not a scrollable list, so numbered pagination doesn't fit — it's already naturally "paginated" by month via `MonthPicker`. Records per month are bounded (≤31 + breaks), so there's no unbounded-query concern here.
- Memoized the chart-data derivation in `Aggregates` (`app/ui/records/aggregates.tsx`) with a single `useMemo` keyed on `[records, thread, month]`, so toggling the details/tab UI state no longer recomputes chart datasets; moved `ChartJS.register(...)` to module scope (one-time global registration, not per-render).
- Timezone is now **per-thread** (not per-user or app-wide) — someone can work for companies in different countries, and each thread's business timezone affects what counts as "today" and the time recorded/displayed:
  - Added `threads.timezone` (migration, default `Asia/Tokyo`), a timezone select in the thread create/settings form (`app/ui/Form/thread-form.tsx`, via `Intl.supportedValuesOf('timeZone')`).
  - Added `getTodayInTimezone`/`getCurrentTimeInTimezone`/`extractDatePartsInTimezone` to `app/lib/helpers.ts` for the genuinely "current moment" call sites (Clock, ButtonGroup, Table's "is this today" highlighting, MonthPicker's default month, `returnStatus`); the notifications query (`fetchRecordsToNotify` in `app/lib/api.ts`) now compares "today" per-record via `(now() AT TIME ZONE t.timezone)::date` in SQL.
  - Left pure calendar-date math (`dateToStr`, `extractDateParts`, `dateStrOneMonthOffset`, `generatePaddedRecordsForMonth`) unchanged — those format already-known dates (DB date columns, URL params), not "the current instant," so they aren't timezone-sensitive in the same way.

## Phase 3 — Project structure cleanup — **Done**

- Normalized all `app/ui/*` component directories and files to kebab-case (`BreakUnit` → `break-unit`, `Button` → `button`, `Clock` → `clock`, `Form` → `form`, `Tag` → `tag`, `TimeStamp` → `time-stamp`), matching the convention already used by newer directories (`global-header`, `home`, `records`, `setting`, `sidebar`). All ~25 import sites updated accordingly.
- Moved `app/types/next-auth.d.ts` into `app/lib/next-auth.d.ts` alongside `app/lib/types.ts`, removing the now-empty `app/types/` directory and a stale `types/**/*.ts` entry in `tsconfig.json`'s `include` (pointed at a top-level `types/` dir that never existed).
- Hit the same macOS case-insensitive-filesystem gotcha as Phase 0: `git mv Foo foo` in one step silently corrupts the index on a case-preserving-but-insensitive filesystem, leaving both the old- and new-cased paths tracked even though they're the same file on disk. Fixed by renaming through a temporary intermediate name (`git mv Foo foo-tmp && git mv foo-tmp foo`) and verifying with `git ls-files` afterward.

## Phase 4 — Type safety & tests — **Done**

- Eliminated all `any` usages outside of the 4 raw-SQL row-shape index signatures in `app/lib/api.ts` (required by `@vercel/postgres`'s `QueryResultRow` constraint, documented in place). Added proper row types (`TRecordRow`/`TBreakRow`/`TThreadRow`/`TUserRow`) threaded through `sql<T>`/`sql.query<T>` generics, chart.js `ChartOptions`/`TooltipItem` types in `aggregates.tsx`, and a shared `TRecordFormState`/`TRecordFormFieldError` type for the record create/edit form error shape.
- While removing the `any`s in `actions.ts`, unified `editForm`'s and `creationForm`'s duplicated inline Zod-issue-to-form-error reducers into one `buildRecordFormErrors` helper. This fixed a real bug: `creationForm` was writing break-level errors to a `details` key while `record-create-form.tsx` read from `errors`, so overlapping/invalid break times were silently never highlighted on record *creation* (worked fine on *edit*, which used the correct key). Added regression tests for both paths.
- Fixed a second latent bug surfaced by removing `Button`'s `ref?: any` prop: `Button` was a plain function component, so passing `ref` (used by the header's click-outside-to-close menu logic) was being silently dropped by React — `profileRef.current`/`notificationRef.current` never populated. Wrapped `Button` in `React.forwardRef`.
- `IUser` and `IThread` in `app/lib/types.ts` are now derived from `userBaseSchema`/`threadBaseSchema` (`z.infer`) instead of hand-duplicated, so the two can't drift; `schedule`/`userid`/`archived` stay explicit since they aren't part of the form schema.
- Added test coverage where there was none: `app/lib/__tests__/actions.test.ts` (validation branches of `editForm`, `creationForm`, `signup`, `createThreadForm`, `updateUserInfo` — including the break-error regression above), `app/lib/__tests__/api.test.ts` (row-mapping and error-handling of `fetchThreadById`/`fetchRecordById`/`fetchUserByEmail`, with `@vercel/postgres` mocked), and `auth.config.test.ts` (the static `trustHost`/session/jwt/session-callback config, which needs no NextAuth runtime mocking).

## Phase 5 — Import design system via claude_design MCP — **Not started**

- Use the `claude_design` MCP server (`https://api.anthropic.com/v1/design/mcp`, authenticated via `/design-login`) to import the design system from `https://claude.ai/design/p/9708b814-a56c-4800-8788-abc9e1498666`.
- Requires the user to authenticate the MCP server first — not something Claude can do on the user's behalf.
- Should happen before Phase 6, since the shadcn/Tailwind implementation depends on the imported design tokens.

## Phase 6 — Adopt shadcn/ui + latest Tailwind — **Not started**

- Introduce `shadcn/ui` and upgrade Tailwind CSS (currently 3.4.1) to latest.
- Re-implement existing UI components (`Button`, `FormControl`, `Tag`, `Clock`, etc. under `app/ui/`) using shadcn primitives styled to match the design system imported in Phase 5.
