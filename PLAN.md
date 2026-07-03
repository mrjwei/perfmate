# perfmate review & refactor plan

Phases 0-6 below are a completed technical refactor. Phases 7+ are a **commercial productisation roadmap** (subscription/SaaS conversion) — not yet started.

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
- **Bug found post-phase**: records showed the wrong calendar date when the app ran locally vs. on Vercel (production, which runs in UTC) — because `pg`'s DATE-type parser builds a JS `Date` at *local system midnight*, which then got reformatted through an explicit fixed-timezone `Intl` formatter elsewhere; the two-timezone round trip drifts the date by a day whenever the machine's local system timezone doesn't match. Fixed at the root: added `app/lib/db.ts`, which registers a raw-string type parser for Postgres OID 1082 (DATE) so date-only columns are never parsed into a timezone-bearing `Date` at all; `api.ts`/`actions.ts` now import `sql` from there instead of `@vercel/postgres` directly. Found and fixed the same bug class in `generatePaddedRecordsForMonth` (rewritten to build calendar-day strings via arithmetic instead of `new Date(year, month-1, day)` + reformat) and in `isSaturday`/`isSunday`/`getWeekdayName` (now read UTC date parts instead of local ones). Added regression tests run under `TZ=UTC`, `TZ=Australia/Sydney`, and `TZ=America/Los_Angeles` to lock in timezone-independence.

## Phase 5 — Import design system via claude_design MCP — **Done**

- Imported the "Design System" project (`9708b814-a56c-4800-8788-abc9e1498666`) from the `claude_design` MCP server into `design-system/` at the repo root.
- It's a neutral, from-scratch "Base" design system explicitly built around **the Tailwind CSS + shadcn/ui token contract** (`design-system/readme.md` — same semantic CSS variable names shadcn ships: `--background`, `--primary`, `--muted`, `--ring`, etc., oklch neutral greyscale, Geist/Geist Mono, Lucide icons, `.dark` scope for dark mode), which lines up directly with Phase 6.
- Initially imported all 81 source files 1:1 with the source project; pruned back to the 24 that are actually load-bearing for Phase 6 after the user asked why the rest were there. Kept: `tokens/*.css` (colors, typography, spacing, radius, elevation, fonts — the actual theme source), `base.css`/`styles.css` (entry point), `readme.md` (design rules — voice, spacing philosophy, etc.), and the reference `.jsx` implementations under `components/{forms,display,feedback,navigation}/` (styling logic — hover states, focus rings — to port into real shadcn components). Deleted: `.d.ts`/`.prompt.md` (redundant once real TS components exist), `guidelines/*.card.html` (design-tool preview demos, not app-consumable), `ui_kits/console/*` (a demo composition, inspiration only), `assets/*.svg` (placeholder "Base" logo, not perfmate's branding), `SKILL.md` (Claude Code skill metadata, not relevant in an app repo).
- `design-system/` is inert reference material at this point — not imported by any app code, doesn't affect the Next.js build. Phase 6 is where its tokens and component patterns actually get adopted into `app/`.

## Phase 6 — Adopt shadcn/ui + latest Tailwind — **Done**

- Upgraded Tailwind 3.4.1 → v4.3.2 via the official `@tailwindcss/upgrade` codemod (CSS-first config, `@import "tailwindcss"`, `@tailwindcss/postcss`; `tailwind.config.ts` retired in favor of `@theme` in `app/main.css`).
- Ran `shadcn@latest init` (`components.json`, `radix-ui`, `class-variance-authority`, `tailwind-merge`, `lucide-react`); added `components/ui/{button,input,label,checkbox,select,textarea,tabs,badge,card,skeleton}.tsx` via the CLI.
- Replaced shadcn's default "neutral" color/font tokens in `app/main.css` with the exact values from `design-system/tokens/colors.css`/`fonts.css` (kept in lockstep, not just visually similar) — including `--success`/`--warning`/`--info`, which shadcn's stock palette doesn't have. Geist/Geist Mono loaded via CDN `@import` (matching `design-system/tokens/fonts.css`) since this Next.js RC's `next/font/google` doesn't bundle Geist yet.
- Re-implemented every `app/ui/` component touched by the redesign: `Button` now wraps `components/ui/button`; `FormControl` renders shadcn's `Label`; forms use shadcn `Input`/`Textarea`; `Tag` and the 4 work-status action buttons (start/end working, start/end break) map to `--success`/`--warning`/`--destructive` tokens instead of one-off Tailwind colors; `aggregates.tsx`'s hand-rolled tab buttons became real `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`; the loading skeletons use shadcn's `Skeleton`; every `bg-white`/`text-slate-*`/`text-gray-*` swept to `bg-card`/`text-foreground`/`text-muted-foreground`/etc. across the sidebar, header, thread switcher, clock, records table, and all page-level chrome.
- Native `<select>`/checkbox/radio inputs were **restyled but not swapped** to Radix-based shadcn equivalents — those aren't native form elements and would need hidden-input mirroring to keep working with the existing server-action `formData.getAll()`/native-radio-group submission logic; not worth the correctness risk for this pass. `Input`/`Textarea`/`Label`/`Button` are native-element wrappers, so those were safe to swap directly.
- Verified with a full signup → create-thread → home → records (incl. expanding the new Tabs chart view) → thread-settings browser flow via Playwright screenshots, not just typecheck/build.
- **Found and fixed (pre-existing, unrelated to this phase):** `app/api/auth/[...nextauth]/route.ts` had never existed in this repo, so client-side `useSession()`/`SessionProvider` calls 404'd against `/api/auth/session` and threw a `ClientFetchError` in the browser console. Fixed by exporting `handlers` from `auth.ts` (NextAuth v5's `NextAuth()` call already returns it, it just wasn't destructured) and adding the route file re-exporting `GET`/`POST`. Verified `/api/auth/session` now returns `200`/`null` instead of `404`, and confirmed zero auth-related console errors across a full signup → dashboard browser flow.

---

# Commercial productisation roadmap (v2 — Japan-first, tax-focused)

Supersedes the v1 draft of this roadmap (auth → billing → generic export → marketing → CI → admin → deferred teams). Sharpened after user feedback on four points: Japanese language is required (not optional), Japan is the beachhead market (not simultaneous global), the core paid differentiator is 確定申告-ready tax export (not generic CSV/invoicing), and "thread" is being renamed to "workspace" (Notion-style) as the occasion to also fix a disorganized header/sidebar.

**Note on scope vs. language**: "Japan-first" is a decision about where to spend effort — tax logic, payment methods, marketing priority — not about which UI languages ship. English is not dropped: Phase 8 builds `en`+`ja` i18n scaffolding together from the outset, since once the locale-routing/middleware layer exists, adding a language is just translating strings, not new architecture. Dropping English now would mean redoing that routing/middleware work later for no savings, and would lose English-speaking users already in Japan (expats, foreign contractors working for JP clients) in the meantime.

## Commercial viability verdict

Generic time tracking has no moat — Toggl/Clockify/Harvest own that space. The real wedge is Japan-specific: per-workspace tax-inclusive/exclusive wage math (`threads.hourly_wage`/`currency`/`tax_rate`/`tax_included`, soon `workspaces.*`) plus a 確定申告-aligned annual export is a narrow pain point existing tools don't address — non-JP trackers ignore Japanese tax entirely, and JP-native tools (freee, MFクラウド) are broad accounting suites, not lightweight multi-employer wage trackers with tax export as a focused bolt-on. Position as *"a freelancer wage tracker for Japan that hands your accountant (or e-Tax) a clean 確定申告-ready summary,"* priced modestly (~¥500–1000/mo), targeting solo freelancers/individual contractors in Japan first. Multi-currency cross-workspace reporting and a second country's tax rules are explicitly backlogged — they dilute the wedge and don't serve the beachhead.

## Revised build order

1. **Phase 7 — Workspace rename** (full-stack) — first, before anything else is built on "thread" naming.
2. **Phase 8 — i18n foundation** (English + Japanese) — right after, since both touch routing.
3. **Phase 9 — Auth hardening** (prerequisite for billing).
4. **Phase 10 — Billing infra (Stripe)**.
5. **Phase 11 — Tax/export features** (the sharpened core differentiator).
6. **Phase 12 — Marketing/landing page** (bilingual, JP-first).
7. **Phase 13 — CI/deployment hardening**.
8. **Phase 14 — Admin tooling** (once there are real subscribers).
9. **Phase 15 — Multi-tenancy/teams** — still explicitly deferred.
10. **Backlog** — multi-currency cross-workspace reporting, second-country tax support, OAuth login, `Intl.NumberFormat` currency formatting.

## Phase 7 — Rename "thread" → "workspace" (full-stack) — **Done**

- Renamed every "thread" occurrence across the ~39 files identified (routes, DB, types/schema/data layer, components, tests/mocks) via an ordered substring-replacement pass (`threadId`→`workspaceId`, `thread_id`→`workspace_id`, `thread_schedules`→`workspace_schedules`, then whole-word `Thread(s)`/`thread(s)`), verified with a post-pass grep for any remaining case-insensitive "thread" hits outside the historical migrations (none found).
- **Routes**: `app/app/[threadId]/` → `app/app/[workspaceId]/`, `app/app/threads/` → `app/app/workspaces/` (via `git mv`, no case-collision issue this time since the casing actually changes).
- **DB**: `migrations/1719800004000_rename-threads-to-workspaces.js` — plain `renameTable`/`renameColumn`/`renameConstraint` calls (identifier rename only, no data movement), plus a raw-SQL `ALTER INDEX` for `threads_userid_index` (node-pg-migrate has no `renameIndex` helper). Queried `information_schema`/`pg_constraint`/`pg_indexes` against the live prod DB first per [[db_schema_reality]] to confirm the exact constraint/index names being renamed matched what the migration assumed — they did.
- **Types/schema/data layer**: `IThread`→`IWorkspace`, `TThreadRow`→`TWorkspaceRow`, `threadBaseSchema`/`threadCreationSchema`/`threadUpdateSchema`→`workspace*`, `fetchThreadsByUserId`/`fetchThreadById`/`mapThreadRow`→`workspace*` in `app/lib/api.ts`, `createThreadForm`/`updateThread`/`archiveThread`→`workspace*` in `app/lib/actions.ts`.
- **Components**: `app/ui/form/thread-form.tsx` → `workspace-form.tsx`; `app/ui/global-header/thread-switcher.tsx` → `app/ui/sidebar/workspace-switcher.tsx` (moved, not just renamed — see restructure below).
- **Header/sidebar restructure**: header (`global-header.tsx`) now only handles identity/account concerns (logo, notification bell, profile menu) — the workspace switcher was removed from it entirely. The switcher moved into the sidebar (`sidebar.tsx`) as a Notion-style picker at the top, above Home/Records; its dropdown's "Manage workspaces" link is the only entry point to `/app/workspaces` now, replacing the old standalone "Workspaces" nav item (removed from `sidebar.tsx`'s `links` array along with the now-unused `RectangleStackIcon` imports). Restyled the switcher's button for the sidebar's dark background (`text-white`/`hover:bg-white/10` instead of the header's `text-foreground`).
- **Migration risk**: this app's dev environment points directly at the production Postgres (no separate dev/staging DB), so applying the rename migration was a live-prod schema change with no code deployed yet to match it — confirmed with the user before running `npm run migrate:up` against prod, on the basis that this branch would be merged and deployed promptly afterward to minimize the breakage window for the currently-live app.
- **Verified**: `tsc --noEmit`, full Vitest suite (only pre-existing unrelated `clock.test.tsx` failure, confirmed present on `main` too), `next build`, and a full signup → create-workspace → home → sidebar-switcher-dropdown → `/app/workspaces` → records browser walkthrough (Playwright against the actual dev server hitting prod DB), then deleted the test account/workspace/records created during verification.

## Phase 8 — i18n foundation (English default + Japanese) — **Not started**

No i18n exists today (confirmed — no `next-intl`/`next-i18next`, no translation files, all strings hardcoded English JSX; dates hardcoded to `Intl.DateTimeFormat("en-US", ...)` in `app/lib/helpers.ts`).

- Adopt **next-intl** (best App Router support, works with Server Components/Server Actions this app relies on).
- Restructure routing under `app/[locale]/...` (locales: `en`, `ja`; default `en`, but detect `Accept-Language`/saved preference to default JP visitors to `ja`). Sequence after Phase 7 so the routing rename isn't done twice.
- `middleware.ts` gains next-intl's locale-detection middleware composed with the existing NextAuth `auth` middleware.
- Message files: `messages/en.json`, `messages/ja.json`, starting with auth, nav, workspace-form, records-table strings.
- Fix `app/lib/helpers.ts`'s hardcoded `Intl.DateTimeFormat("en-US", ...)` to take a locale parameter, threaded from the request locale.
- Currency display (`mapCurrencyToMark`, a manual symbol lookup) stays as-is for now — full `Intl.NumberFormat` currency formatting is backlog, not blocking for a JPY-primary JP launch.

## Phase 9 — Auth hardening (prerequisite) — **Not started**

Same as v1: password reset (`password_reset_tokens` migration, `requestPasswordReset`/`resetPassword` actions, `/forgot-password`/`/reset-password/[token]` pages), email verification (`users.email_verified_at`, gate billing on it), transactional email via Resend (`app/lib/email.ts`, template language driven by the user's locale from Phase 8). OAuth (Google) moved to backlog — not essential for a JP-first launch, revisit if signup friction becomes a real issue.

## Phase 10 — Billing & subscription infrastructure (Stripe) — **Not started**

Same mechanics as v1 (`users.stripe_customer_id`/`plan`/`plan_status`/`current_period_end`, `app/lib/stripe.ts`, `app/api/webhooks/stripe/route.ts` handling `checkout.session.completed`/`customer.subscription.updated`/`customer.subscription.deleted`/`invoice.payment_failed`, `createCheckoutSession`/`createPortalSession` actions, `app/lib/plan.ts`'s `assertPlanAllows` gating helper applied to workspace-count limits and Phase 11's tax-export actions), plus JP-specific notes: enable JPY as primary Checkout currency; consider enabling Konbini (convenience-store payment) alongside cards as a fast-follow since it's a common JP payment preference — cards-only is fine for v1.

## Phase 11 — Tax/export features (sharpened core differentiator) — **Not started**

Replaces v1's generic "CSV/invoice export" phase — same technical shape, sharpened toward the actual JP pain point.

- **Schema**: add `workspaces.tax_country text not null default 'JP'` (per-workspace, consistent with the existing per-workspace currency/tax_rate/tax_included model) — the seam for later countries, not built out now.
- **Country-scoped tax module**: `app/lib/tax/index.ts` defines a small interface (`getAnnualSummary(workspaceId, year)`, `getExportFormats()`) implemented per-country; `app/lib/tax/jp.ts` is the only implementation. Keeps "Japan-first but not Japan-only forever" without spending effort on a second country now.
- **JP tax logic** (`app/lib/tax/jp.ts`): categorize annual income per workspace aligned to 確定申告's 収支内訳書/青色申告決算書-style breakdown (gross income, per-workspace totals, monthly breakdown). **Research needed at implementation time** to confirm exact column/category conventions expected by e-Tax's CSV import and freee/MFクラウド確定申告's import formats — verify against current tool docs, don't assume from this plan.
- **Outputs**: CSV formatted for accountant handoff or e-Tax/freee/MFクラウド import (`app/lib/export.ts`, served via `app/app/[workspaceId]/export/route.ts` route handler — needs custom `Content-Disposition`); a bilingual (EN/JA) annual PDF summary per workspace via `app/lib/invoice.ts` (e.g. `@react-pdf/renderer`).
- **Tier gating**: this is the Pro-tier headline feature — free tier keeps existing CRUD/records/aggregates only, Pro (~¥500–1000/mo) unlocks tax export plus unlimited workspaces. Gate via `assertPlanAllows` from Phase 10.
- **Explicitly out of scope**: multi-currency cross-workspace reporting (backlog), second-country tax modules (backlog), actual e-Tax filing/submission (stay a feeder into existing filing tools, not a filer).

## Phase 12 — Marketing surface & conversion (bilingual) — **Not started**

Same structural fix as v1 (remove `/` → `/app` redirect in `next.config.mjs`, add `app/[locale]/(marketing)/page.tsx` + `pricing/page.tsx`, fix `middleware.ts` matcher to exclude public routes), now built directly under Phase 8's locale routing rather than English-only-then-retranslated. Landing copy leads with the 確定申告/tax-export wedge, not generic time tracking, defaulting to Japanese for JP-detected visitors.

## Phase 13 — Deployment/CI hardening — **Not started**

Same as v1: `.github/workflows/ci.yml` (lint/test/build on push/PR), Stripe/Resend secrets into Vercel env dashboard, webhook handler unit test, `stripe listen` documented for local dev.

## Phase 14 — Admin/ops tooling (lightweight) — **Not started**

Same as v1: `users.role` column, `app/app/admin/page.tsx` gated to admins, deep-linking to the Stripe dashboard rather than rebuilding billing UI, `mailto:` support link.

## Phase 15 — Multi-tenancy / team seats — **Not started, deferred**

Same rationale as v1: would require `organizations`/`memberships` tables, moving `workspaces.userid` → `workspaces.org_id`, re-auditing every access check, and moving billing from per-user to per-org. Explicitly deferred past initial launch — revisit only if solo-freelancer users actually ask to share workspaces with a bookkeeper/partner.

## Backlog (not scheduled)

- Multi-currency summary reporting across workspaces (demoted — doesn't serve the JP beachhead).
- Second-country tax modules under `app/lib/tax/` (architecture supports it per Phase 11, no implementation planned).
- OAuth (Google) login.
- `Intl.NumberFormat` currency-style formatting (currently manual symbol lookup via `mapCurrencyToMark`).

### Verification (for phases 7-14)

- Run existing Vitest suite (`npm test`) after each phase; Phase 7 (rename) and Phase 8 (i18n restructure) are highest-risk for silent breakage — run the full suite plus a manual browser walkthrough after each, not just at the end.
- After Phase 7: verify old `/app/[threadId]/*` URLs are gone, `/app/[workspaceId]/*` works, the migration applies cleanly against a prod-schema snapshot, and the sidebar workspace switcher replaces both the old header switcher and the standalone "Workspaces" nav item with no functionality loss.
- After Phase 8: verify `/en/...` and `/ja/...` both render, default locale detection works for a JP `Accept-Language` header, dates display correctly in both locales.
- After Phase 11: manually verify a generated tax export against current e-Tax/freee/MFクラウド import documentation before marketing it as "import-ready."
- Stripe: use `stripe listen`/`stripe trigger` in test mode (JPY test transactions) to exercise checkout/webhook flow before going live.
- Confirm bilingual marketing pages (`/[locale]` and `/[locale]/pricing`) are reachable without auth after the `middleware.ts` matcher update.
