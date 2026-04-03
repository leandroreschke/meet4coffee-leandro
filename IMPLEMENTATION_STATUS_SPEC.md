# Meet 4 Coffee Implementation Status Spec

## 1. Purpose

This is the living implementation status spec for the current repository state.

It exists to prevent "vibe coding" by making every future change reference:

- what is already implemented
- what is partial or missing
- what acceptance criteria and verification are required for new work

## 2. Snapshot

- Snapshot date: 2026-04-02
- Source of truth used for this snapshot:
  - current filesystem state (including uncommitted work)
  - `apps/web/**`
  - `packages/**`
  - `supabase/migrations/**`
  - `.env.example`
  - `Foundry_foundation_spec.md`

## 3. Current Architecture (Implemented)

### 3.1 Monorepo shape

- `apps/web` exists and is the active product app.
- `packages/core` exists with domain enums, matching, and scheduling logic.
- `packages/i18n` exists with `en`, `es`, and `pt-br` message catalogs plus translator helpers.
- `packages/supabase` exists with browser/server/admin client factories and database types.
- Supabase migrations are present in `supabase/migrations`.

### 3.2 App surfaces

- Marketing:
  - `/`
  - `/blog`
  - `/blog/[slug]`
  - `/help`
  - `/help/[slug]`
- Auth:
  - `/sign-in`
  - `/sign-up`
  - `/magic-link`
  - `/join/[token]`
  - `/auth/callback`
- App shell:
  - `/app`
  - `/welcome`
  - `/setup`
  - `/w/[workspaceSlug]`
  - `/w/[workspaceSlug]/clubs`
  - `/w/[workspaceSlug]/members`
  - `/w/[workspaceSlug]/breaks`
  - `/w/[workspaceSlug]/profile`
  - `/w/[workspaceSlug]/config`

### 3.3 API surfaces

- Stripe:
  - `POST /api/stripe/checkout`
  - `POST /api/stripe/portal`
  - `POST /api/stripe/webhook`
- Integrations:
  - `GET /api/integrations/slack/callback`
  - `GET /api/integrations/google/callback`
  - `POST /api/integrations/google/calendar/sync`
  - `POST /api/slack/actions`
- Async/admin:
  - `POST /api/cron/generate-rounds`
  - `POST /api/cron/reminders`
  - `POST /api/content/revalidate`

## 4. Feature Status

Status legend:

- `Implemented`: present and wired in code paths.
- `Partial`: present but incomplete, weakly guarded, or not fully production-hardened.
- `Missing`: not implemented in repo.

### 4.1 Identity and access

- `Implemented`:
  - Email/password sign in and sign up.
  - Magic link login.
  - Google auth trigger via Supabase OAuth.
  - Session callback exchange route.
  - Route protection in `apps/web/proxy.ts`.
- `Partial`:
  - No explicit anti-abuse controls for auth endpoints in repo.

### 4.2 Workspace lifecycle

- `Implemented`:
  - Workspace creation with slug/timezone/workday validation.
  - Owner membership bootstrap and default free subscription creation.
  - Invite creation and revoke flow.
  - Invite claim flow with seat-limit checks.
  - Ownership transfer action.
  - Workspace delete (danger zone action present).
- `Partial`:
  - No explicit idempotency keys or retries around multi-step workspace setup.

### 4.3 Member profile and participation

- `Implemented`:
  - Member profile save (name, avatar, role/location fields, language, bio, Slack user id).
  - Interest selection and custom interest creation.
  - Availability window creation.
  - Cross-workspace profile import.
  - Member opt-out controls.
- `Partial`:
  - Availability CRUD is insert-only in current UI (no edit/delete action surfaced).

### 4.4 Clubs, matching, and meeting rounds

- `Implemented`:
  - Club create/update/delete.
  - Group create.
  - Join/request/leave club actions.
  - Round generation service with period keys and seat-limit gate.
  - Group generation algorithm (`packages/core/src/matching.ts`).
  - Time-slot scoring helper (`packages/core/src/scheduling.ts`).
  - Meeting participant actions (confirm/cancel/rate/reschedule proposal).
- `Partial`:
  - Generated meetings are inserted without `start_at`/`end_at` assignment despite slot scoring metadata.
  - No approval workflow for `pending_approval` club membership in current UI flows.

### 4.5 Billing and entitlements

- `Implemented`:
  - Stripe Checkout session creation.
  - Stripe Customer Portal session creation.
  - Stripe webhook ingest with event de-duplication (`stripe_events`).
  - Workspace subscription upsert from webhook events.
  - Seat-limit logic used in entitlement checks and invite claim path.
- `Partial`:
  - Tier mapping from Stripe webhook currently relies on `lookup_key`/price id fallback and may need explicit normalization.
  - No dedicated billing test coverage in repo.

### 4.6 External integrations

- `Implemented`:
  - Slack OAuth connect callback and token storage.
  - Slack signature verification for interactive actions endpoint.
  - Slack test message action and reminder sender.
  - Google OAuth connect callback and token storage.
  - Google test event creation action.
  - Combined "test all integrations" action in config.
- `Partial`:
  - `POST /api/integrations/google/calendar/sync` has no explicit auth/authorization checks.
  - Token refresh lifecycle and failure recovery are not fully modeled.

### 4.7 Content and marketing

- `Implemented`:
  - Blog/help list and detail pages.
  - Published-only content queries with tags and filtering.
  - Markdown body rendering.
  - Revalidation endpoint with secret.
  - Content tables, storage buckets, and related RLS policies.
- `Partial`:
  - No Studio/editor app for content authoring in repo.
  - Content body download path is admin-client dependent.

### 4.8 Localization

- `Implemented`:
  - Message catalogs for `en`, `es`, `pt-br`.
  - Locale normalization and translator utilities.
  - Locale-prefixed path support (`/en`, `/es`, `/br`).
  - Locale cookie synchronization in proxy.
  - Locale check constraints in DB migration.

### 4.9 UI system

- `Implemented`:
  - Branded UI tokens, custom palette, and motion in `globals.css`.
  - Reusable UI primitives/components under `apps/web/components`.
- `Partial`:
  - No separate shared `@meet4coffee/ui` package yet.

## 5. Data Platform Status

### 5.1 Schema

- `Implemented`:
  - Foundational multi-tenant schema: workspaces, members, profiles, clubs, meetings, subscriptions, integrations, audit logs, content.
  - Helpful indices across membership/club/meeting/content surfaces.
  - Integrity triggers for workspace owner and audit actor membership.

### 5.2 Security model

- `Implemented`:
  - RLS enabled across domain tables.
  - Policy patterns for self/member/owner/service-role access.
  - Storage policies for public content assets and service-role writes.
- `Partial`:
  - Some server endpoints rely on service-role clients and should continue to be reviewed endpoint-by-endpoint for least privilege.

## 6. Gaps vs Foundation Roadmap

Mapped to `Foundry_foundation_spec.md` implementation phases:

- Phase 1 (foundation): `Implemented` for web/core/supabase/i18n baseline.
- Phase 2 (web shell + auth): `Implemented`.
- Phase 3 (billing + entitlements): `Partial` (core flow implemented, hardening gaps remain).
- Phase 4 (observability): `Missing` (no Rollbar/Sentry-style integration found).
- Phase 5 (Studio): `Missing` (`apps/studio` absent).
- Phase 6 (content system): `Partial` (delivery implemented, authoring studio missing).
- Phase 7 (localization + marketing): `Implemented`.
- Phase 8 (mobile): `Missing` (`apps/mobile` absent).
- Phase 9 (hardening/testing): `Partial`.

## 7. Quality Gates (Current)

- `Implemented` scripts:
  - root `pnpm lint`
  - root `pnpm typecheck`
- `Missing`:
  - test suite scripts and coverage baseline
  - CI workflow definition in repo

## 8. Spec-Driven Rules for Future Tasks

Every future task must include the following before coding:

1. **Spec delta**
   - What section(s) of this file will change.
   - New acceptance criteria in plain language.
2. **Scope lock**
   - Files/modules expected to change.
   - Explicitly list out-of-scope items.
3. **Verification plan**
   - Minimum: relevant lint/typecheck/tests.
   - UI-impacting change: browser/manual flow verification.
4. **Status update**
   - After implementation, update this file in the same task with:
     - what became `Implemented`
     - what remains `Partial`/`Missing`
     - residual risks

## 9. Task Log Template (Append Per Delivered Task)

```md
## Task YYYY-MM-DD: <short task title>

- Request:
- Spec delta:
- Acceptance criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
- Files changed:
  - path/a
  - path/b
- Verification:
  - Command/result
  - Manual flow/result
- Outcome:
  - Implemented:
  - Partial:
  - Missing:
- Follow-ups:
```

## 10. Non-Negotiable Anti-Vibe Coding Policy

- No implementation without explicit acceptance criteria.
- No "looks done" closure without verification evidence.
- No silent scope drift: any new scope must be added to spec delta first.
- This file is part of done criteria for all substantive tasks.
