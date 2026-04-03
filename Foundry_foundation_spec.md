# Reusable SaaS Foundation Architecture Spec

## 1. Purpose

This document defines a domain-agnostic SaaS foundation that can be used to scaffold new products with the same underlying architecture, engineering standards, and platform workflows, while excluding all business logic, domain entities, vertical-specific workflows, ICP assumptions, and product-specific features.

It is intended to be used as an implementation blueprint for a blank repository. The goal is that an engineer or AI coding agent can use this document to create a new SaaS product with the same technical DNA as an existing product family, but for a completely different business purpose.

This spec focuses only on the reusable platform layer:
- monorepo and package structure
- application boundaries
- authentication
- multi-tenant and user-private data patterns
- billing and entitlements
- Studio/internal tooling
- blog/help content system
- localization
- notifications and monitoring
- file storage
- deployment and security

It explicitly does **not** define product-specific domain models or workflows.

---

## 2. Architectural Positioning

This foundation combines the strongest patterns from two existing SaaS architectures:

- the stronger **workspace-based multi-tenant architecture** for B2B/headroom and future extensibility
- the cleaner **content, MDX, localization, and monorepo execution patterns** from the more implementation-oriented spec
- the stronger **Studio admin isolation, service-role discipline, and auditability**
- the stronger **web + Studio + optional mobile separation**
- the cleaner **Supabase + Stripe + Rollbar + Slack** defaults

### Opinionated default

This foundation should default to a **workspace-aware SaaS architecture** even if the first product ships with mostly single-user usage.

Why:
- it is easier to simplify workspace usage in the UI than to retrofit multi-tenancy later
- many SaaS products eventually need team membership, shared billing, internal roles, or organization ownership
- workspace-based billing and entitlements scale better than per-user billing for B2B products

However, this spec also supports a simpler mode:
- if a product is truly single-user, `workspace_id` can be abstracted behind a single personal workspace pattern
- some user-private tables may still be scoped directly by `user_id`

That means the database and access patterns should support both:
- **workspace-scoped shared data**
- **user-private data**

---

## 3. Monorepo and Workspace Architecture

### 3.1 Package manager

Use **pnpm** with native workspaces.

Pin the package manager and Node version in root `package.json`:

```json
{
  "packageManager": "pnpm@10.33.0",
  "engines": {
    "node": ">=24"
  }
}
```

Add root `.npmrc`:

```ini
shamefully-hoist=true
```

This is primarily for Expo / React Native Metro compatibility.

### 3.2 Workspace config

`pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"

onlyBuiltDependencies:
  - sharp
  - unrs-resolver
```

### 3.3 Top-level structure

```text
/
├── apps/
│   ├── web/                     # customer-facing web app + marketing site
│   ├── studio/                  # internal admin/operations app
│   └── mobile/                  # optional Expo app
├── packages/
│   ├── ui/                      # shared React UI primitives for web + studio
│   ├── supabase/                # client factories, generated DB types, auth/session helpers
│   ├── i18n/                    # locale JSON files + translation loader/provider
│   ├── utils/                   # shared pure utils, constants, helpers
│   ├── content/                 # MDX components for blog/help and Studio preview
│   ├── eslint-config/           # optional shared ESLint presets
│   └── tsconfig/                # optional shared TS config package
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   ├── emails/
│   ├── seed.sql
│   └── README.md
├── scripts/
├── docs/
│   └── plans/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── .npmrc
├── .prettierrc
├── .prettierignore
├── .gitignore
└── README.md
```

### 3.4 Package responsibilities

#### `@yourapp/ui`
Shared UI primitives for web and Studio only.

Should contain:
- Button
- Input
- Textarea
- Select
- Combobox
- Modal / Dialog
- DropdownMenu
- Card
- Badge
- Avatar
- Table
- Tabs
- ToastProvider
- EmptyState
- Spinner

Should **not** contain:
- product-specific components
- marketing sections
- page-level layouts
- mobile UI components

#### `@yourapp/supabase`
Shared Supabase integration layer.

Should contain:
- browser client factory
- server client factory
- middleware session helper
- admin client factory
- token-based client helpers for API auth
- mobile client setup helpers
- generated `Database` types
- optionally shared entitlement helpers and auth utility helpers

Should **not** contain:
- domain-specific queries
- product logic
- app-specific route handling

#### `@yourapp/i18n`
Custom localization system.

Should contain:
- locale JSON files
- static locale loaders
- translation provider for client components
- translation helper for server components
- fallback behavior
- interpolation support

#### `@yourapp/utils`
Shared pure functions and constants.

Should contain:
- formatting helpers
- slug helpers
- date helpers
- validation helpers
- constant definitions
- maybe shared Zod schemas that are domain-agnostic

#### `@yourapp/content`
Shared MDX rendering layer.

Should contain:
- MDX component map
- Callout
- YouTube/embed blocks
- MDXImage
- code block renderer
- markdown rendering helpers

### 3.5 Root scripts

```json
{
  "scripts": {
    "dev": "pnpm -r dev",
    "dev:web": "pnpm -C apps/web dev",
    "dev:studio": "pnpm -C apps/studio dev",
    "dev:mobile": "pnpm -C apps/mobile dev",
    "build": "pnpm -r build",
    "build:web": "pnpm -C apps/web build",
    "build:studio": "pnpm -C apps/studio build",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "clean": "pnpm -r clean"
  }
}
```

### 3.6 TypeScript baseline

Use a strict root `tsconfig.json` extended by all apps and packages.

Key choices:
- `strict: true`
- `moduleResolution: "Bundler"`
- `noEmit: true`
- `resolveJsonModule: true`
- `incremental: true`

Next.js apps should add:
- Next TS plugin
- local `@/*` alias

Expo should extend `expo/tsconfig.base`.

### 3.7 Formatting and linting

Use Prettier at root with Tailwind plugin.

```json
{
  "printWidth": 140,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

ESLint can live per-app since Next.js and Expo have different needs.

---

## 4. Core Stack and Technical Standards

### 4.1 Baseline stack

| Layer | Choice |
|---|---|
| Main web app | Next.js App Router |
| Studio | Next.js App Router |
| Mobile | Expo + React Native (optional) |
| Language | TypeScript |
| Styling | Tailwind CSS v4.2 for web + studio |
| Backend platform | Supabase |
| Billing | Stripe |
| Mobile billing | RevenueCat only if needed |
| Validation | Zod |
| Monitoring | Rollbar |
| Internal ops notifications | Slack webhooks |
| Hosting | Vercel for web/studio |

### 4.2 General standards

- TypeScript everywhere
- No `any`
- Validate all mutation inputs with Zod
- Prefer server components by default
- Use server actions for web-native mutations
- Use API routes for mobile, webhooks, cron, external integrations, and JSON endpoints
- No ORM by default
- Use Supabase query builder + SQL migrations
- Keep components small and composable
- Never mix server-only modules into client code

---

## 5. Application Boundaries

## 5.1 Web app (`apps/web`)

The web app is a single Next.js deployment that combines:

### Public marketing surface
- homepage / landing pages
- pricing page
- solutions / use-case pages
- alternatives / competitor pages
- blog
- help center
- privacy / terms / legal pages
- optional download page
- sitemap, RSS, robots

### Auth surface
- sign up
- sign in
- forgot password
- reset password
- OAuth callback
- magic link callback

### Authenticated app surface
- dashboard / product shell
- account settings
- workspace settings
- team management
- billing and subscription UI
- onboarding
- product-specific routes (not defined here)

### API surface
- Stripe webhooks
- RevenueCat webhooks if needed
- Slack/event logging endpoints if needed
- content cache-busting endpoint
- mobile-consumed endpoints
- cron/job endpoints
- external integration receivers

### Route grouping recommendation

```text
app/
├── (marketing)/
├── (auth)/
└── (app)/
```

## 5.2 Studio app (`apps/studio`)

Studio is a separate internal-only Next.js app.

It should include:
- KPI dashboard
- user browsing / inspection
- workspace browsing / inspection
- subscription visibility and intervention tools
- billing support tools
- audit log viewer
- content editor for help center and blog
- admin management
- feature flags / operational settings
- monitoring views for webhooks, jobs, imports, ingestion, failures

Studio should be:
- deployed separately
- independently secured
- non-indexed
- powered by the same Supabase project but with separate app concerns

## 5.3 Mobile app (`apps/mobile`) optional

Use an Expo app only when mobile adds meaningful value.

Good cases:
- push notifications matter
- device capabilities matter
- real-world usage or quick capture matters
- offline mode matters

The mobile app should:
- share utils and types from monorepo
- use its own RN UI layer
- authenticate against same Supabase auth instance
- call shared API routes for privileged operations
- use TanStack Query for data fetching/caching

---

## 6. Authentication Architecture

## 6.1 Provider

Use **Supabase Auth**.

Supported methods:
- Google OAuth
- email/password
- magic link
- Apple Sign In for mobile if required

## 6.2 Session architecture

### Web
Cookie-based sessions.

Use middleware session refresh via shared helper.
The middleware should:
- refresh session
- protect authenticated app routes
- redirect unauthenticated requests to login
- redirect authenticated users away from auth pages
- optionally handle locale header/cookie logic

### Mobile
Token-based session handling using native storage.

Use:
- AsyncStorage or secure storage adapter
- `autoRefreshToken: true`
- deep-link callback handling for OAuth
- auth state listener in context/provider

## 6.3 Shared auth flows

### Email/password sign up
- call `signUp`
- redirect via auth callback
- bootstrap profile and workspace membership on first authenticated load

### Email/password sign in
- call `signInWithPassword`
- redirect to app/dashboard

### Magic link
- call `signInWithOtp`
- return to callback route
- exchange code and bootstrap user if new

### Social OAuth (web)
- redirect to provider
- callback exchanges code for session
- profile bootstrap
- redirect to app

### Social OAuth (mobile)
Recommended pattern:
- start OAuth in in-app browser pointing to web callback flow
- web callback finishes auth and deep-links back into the mobile app
- mobile app stores session and calls a completion endpoint if bootstrap work is required

## 6.4 User bootstrap pattern

On first authenticated access, create baseline records such as:
- `profiles`
- personal workspace or default workspace membership
- baseline subscription row
- baseline notification preferences
- storage usage row if needed

This should happen in a trusted server-side path:
- auth callback handler
- or a first-load bootstrap function called by trusted server code

## 6.5 Roles

Base roles:
- regular user
- workspace owner/admin/member (via `workspace_members`)
- super admin (via `profiles.is_super_admin`)

Do not build a fully general RBAC system unless the product requires it.

---

## 7. Studio Authentication and Internal Access Model

Studio must be separately gated from the public app.

### Recommended pattern

- same Supabase Auth instance
- Google OAuth only for Studio
- no public sign-up
- optional Google Workspace domain allowlist
- hard server-side `is_super_admin` check

### Access layers

#### Middleware
- require authenticated user for all Studio routes except login/callback
- do not perform heavy admin checks in middleware

#### Admin layout check
In the dashboard layout:
- load authenticated user
- verify `profiles.is_super_admin`
- render access denied state if false

#### API route/server action protection
Every privileged Studio action must call something like `requireSuperAdmin()`.

### Privileged data access pattern

1. verify user is super admin
2. use service-role admin client
3. perform operation
4. write audit log

### Audit logs

Use a dedicated `audit_logs` table with:
- admin id
- action
- target type
- target id
- metadata JSONB
- optional note
- timestamp

Studio actions must be auditable.

### Crawler protection

Studio should:
- return robots disallow all
- set `noindex, nofollow`
- not expose public documentation or content there

---

## 8. Supabase Architecture

## 8.1 Services used

Use Supabase for:
- Postgres
- Auth
- Storage
- optional Edge Functions
- optional Realtime

## 8.2 Single project per environment

All apps should connect to the same Supabase project for a given environment.

Per environment:
- local
- preview/staging if used
- production

## 8.3 Shared client factories

The reusable Supabase package should provide:
- `createBrowserClient()`
- `createServerClient()`
- `createAdminClient()`
- `createTokenClient(token)`
- `createMobileClient()`
- `updateSession(request)` helper for middleware

### Admin client rules

`createAdminClient()`:
- uses service role key
- is server-only
- bypasses RLS
- only used in trusted paths:
  - webhooks
  - cron
  - Studio privileged actions
  - profile bootstrap
  - entitlement checks if necessary
  - content management/loading where service access is needed

## 8.4 Local development

Use local Supabase via Docker by default.

Workflow:
1. `npx supabase start`
2. `npx supabase db reset`
3. `npx supabase migration new <name>`
4. regenerate types from local schema

## 8.5 Migrations

Rules:
- all schema changes go through SQL migrations
- keep migrations small and focused
- use numbered filenames like `00001_initial.sql`
- prefer idempotent constructs where possible
- regenerate TS types after schema changes

## 8.6 Platform tables

Recommended reusable foundation tables:
- `profiles`
- `workspaces`
- `workspace_members`
- `workspace_subscriptions`
- `stripe_events`
- `entitlements`
- `usage_counters`
- `user_storage_usage`
- `user_files`
- `audit_logs`
- `notification_preferences`
- `content_items`
- `content_authors`

Everything else is product/domain-specific and layered on top.

---

## 9. Database and RLS Conventions

## 9.1 Table conventions

### IDs
Use UUID primary keys with `gen_random_uuid()`.

### Timestamps
Use:
- `created_at timestamptz default now() not null`
- `updated_at timestamptz default now() not null` when the table is mutable

### Soft deletes
Default to hard deletes unless recoverability matters.
When soft delete is needed, use `archived_at timestamptz` instead of boolean flags.

### Ownership / tenancy
Use:
- `workspace_id` for shared tenant-scoped tables
- `user_id` for user-private tables

### Indexes
Create indexes on:
- `workspace_id`
- `user_id`
- common sort/filter combos
- foreign keys used frequently in joins
- GIN indexes for arrays or JSON search where justified

## 9.2 Updated-at trigger

Use a shared reusable trigger function.

## 9.3 RLS helper functions

Use `SECURITY DEFINER` helpers such as:
- `is_workspace_member(ws_id)`
- `get_workspace_role(ws_id)`
- `is_super_admin()`

This avoids policy recursion and centralizes access logic.

## 9.4 RLS patterns

### Workspace-scoped tables
Policies should check workspace membership and sometimes role.

### User-private tables
Policies should check `auth.uid() = user_id`.

### Child tables
Policies should resolve access through parent ownership or parent workspace membership.

### Reference/global read tables
Readable by authenticated users, writable only by service role.

### Internal/admin tables
Enable RLS but do not create end-user policies. Access only through service role.

### Public content tables
Allow anonymous read of published items only.

## 9.5 Naming conventions

Pick one convention and stick with it.
Recommended:
- migration files: `00001_initial_schema.sql`
- policies: terse `table_operation_scope` names or consistently descriptive quoted names

---

## 10. Billing and Subscription Architecture

## 10.1 Core choice

Use **Stripe** as the source of truth for web billing.

Use workspace-level subscriptions by default.

### Why workspace-level is the better default
- better for B2B SaaS
- cleaner for team billing
- easier to support owner/admin billing permissions
- more extensible than per-user plans

Single-user products can model each user as a personal workspace.

## 10.2 Core billing components

Use:
- Stripe Checkout
- Stripe Billing Portal
- webhook processing
- Stripe customer creation/sync
- local subscription cache table
- entitlements layer

## 10.3 Subscription state table

Use something like `workspace_subscriptions` with:
- workspace id
- tier
- status
- stripe customer id
- stripe subscription id
- current period end
- cancel at period end
- timestamps

## 10.4 Webhook processing rules

Webhook route should:
1. read raw body
2. verify signature
3. dedupe by event id in `stripe_events`
4. use admin client for writes
5. update local subscription state
6. notify Slack for important lifecycle events
7. log failures to Rollbar
8. revalidate app paths where needed

Recommended events:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

## 10.5 Entitlements model

Effective access should be determined by:
- active paid subscription OR
- active entitlement grant

That allows:
- gifts
- support extensions
- promo access
- manual overrides

## 10.6 Tier limits

Keep architectural support for usage limits without defining product-specific numbers in the spec.

Use typed limit definitions and helper functions that return:
- allowed
- current
- max
- reason/kind

## 10.7 Notifications

Billing events that should trigger Slack notifications:
- new subscription
- renewal
- cancellation
- payment failure
- maybe trial ending soon

## 10.8 Mobile payments

Only add RevenueCat if the mobile app sells subscriptions directly.
Do not introduce mobile billing complexity unless needed.

---

## 11. Internal Event Logging and Notifications

Create a lightweight internal event logging system with three channels:

1. console logging
2. Slack webhook notifications
3. Rollbar for errors

These are separate concerns.

### Slack-worthy events
- user signup
- team invite accepted
- subscription upgraded
- subscription renewed
- subscription canceled
- payment failed
- important job/import/webhook failures
- high-signal operational events

### Not Slack-worthy by default
- ordinary logins
- noisy low-value events

### Event logging structure

Use a typed event union and a function like:
- `logEvent(payload)`
- `logEventAsync(payload)`

Recommended payload shape:
- event name
- user id
- workspace id
- optional email
- metadata object

### Reliability expectations

For inbound webhooks:
- signature verification
- idempotency
- retries
- observability
- return correct status codes

---

## 12. Error Logging and Monitoring

Use **Rollbar** for frontend and backend error capture.

## 12.1 Setup

Use separate tokens for:
- browser/client
- server

### Client capture
- provider in root layout
- error boundary
- `app/error.tsx`
- `app/global-error.tsx`
- lazy client reporter for manual catches

### Server capture
Use a server logger that:
- logs to console
- sends to Rollbar
- normalizes non-Error values
- ignores framework redirects/not-found internals

### Coverage
- server actions
- route handlers
- webhook failures
- cron failures
- rendering failures
- explicit client errors

### Data hygiene
- do not log secrets
- do not log passwords or tokens
- avoid full request payload dumps
- prefer IDs over personal info in monitoring payloads

### Rollbar vs Slack
- broken systems/errors -> Rollbar
- business/ops events -> Slack
- major operational failures -> both

---

## 13. Content Architecture for Help Center and Blog

Use a **hybrid metadata + storage body** content system.

This is one of the stronger shared patterns and should be preserved.

## 13.1 Storage model

### Database metadata
Use `content_items` for:
- section (`blog` or `help`)
- slug
- title
- description
- excerpt
- draft/published state
- author key
- category
- tags
- dates
- SEO fields
- image paths
- body path
- reading time
- content hash
- archived_at

Use `content_authors` for author metadata.

### Supabase Storage
Use:
- private `content` bucket for markdown/MDX bodies
- public `content-public` bucket for images/assets

## 13.2 Authoring model

Studio should manage this system.

Workflow:
1. create content item in Studio
2. upload MDX body to storage
3. upload images to public content bucket
4. save metadata as draft
5. preview with same MDX renderer used by web app
6. publish by flipping state / date
7. call cache-bust endpoint to revalidate content routes

## 13.3 Rendering

The web app should:
- load metadata from DB
- load body from storage
- render via MDX with shared components from `@yourapp/content`
- generate metadata for SEO
- expose RSS and sitemap entries

## 13.4 Why this is the preferred pattern

It is stronger than pure repo-file content because:
- non-engineers can manage content in Studio
- content does not require git workflows
- still preserves MDX flexibility and component-rich content

---

## 14. Localization Architecture

Use a **custom JSON-file-based i18n system**.
Do not use i18next or similar frameworks.

## 14.1 File structure

Recommended structure:

```text
packages/i18n/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── app.json
│   │   └── marketing.json
│   ├── es/
│   ├── fr/
│   └── pt/
└── src/
    ├── locale-data.ts
    ├── server.ts
    ├── client.tsx
    └── index.ts
```

## 14.2 Rules

- English is source locale
- use namespaced JSON
- support dot-path keys
- support interpolation with `{{param}}`
- missing keys fall back to English
- missing English keys should surface obviously in dev

## 14.3 Route strategy

Use a mixed strategy:
- path-based localization for public marketing pages where SEO matters
- preference-based localization for authenticated app routes where SEO does not matter

Keep blog/help on canonical paths unless you explicitly decide to localize that content too.

## 14.4 Translation management

Do not add a third-party i18n runtime.
Optionally let Studio assist editing JSON-backed translations later if needed.

---

## 15. Frontend Architecture Conventions

## 15.1 Next.js App Router

Use:
- root layout for global providers and fonts
- route-group layouts for marketing/auth/app
- loading/error/not-found special files where needed

## 15.2 Server vs client components

Default to server components.
Use client components only where interactivity or browser APIs require them.

## 15.3 Data fetching

Recommended patterns:
- server components fetch directly using server Supabase client
- server actions handle mutations for the web app
- API routes handle webhooks, mobile requests, JSON endpoints, cron
- mobile uses TanStack Query against API endpoints and selective direct Supabase access where safe

## 15.4 Forms

Use server actions for standard web app forms.
Validate with Zod in the server action.

Use API routes when:
- the endpoint is consumed by mobile
- the endpoint is external-facing
- the endpoint is a webhook receiver
- the endpoint is JSON-oriented rather than form-native

## 15.5 Design tokens and theming

Use CSS custom properties and Tailwind v4.2 `@theme` mappings.

Keep tokens in `globals.css` and map them into Tailwind classes.

## 15.6 Accessibility

Baseline requirements:
- semantic HTML
- keyboard accessibility
- visible focus states
- aria labels where needed
- forms with labels
- alt text for images
- WCAG AA contrast
- modal focus management

## 15.7 Responsive design

- mobile-first
- all critical routes work on small screens
- tables degrade gracefully
- nav collapses for mobile

---

## 16. Shared Package Boundaries

### Share
- UI primitives
- Supabase factories and types
- localization system
- pure utilities
- content rendering components

### Do not share aggressively
- product business logic
- page layouts
- marketing sections
- Studio-specific screens
- mobile UI
- app-specific server action logic

The goal is reuse without creating a giant cross-app abstraction swamp.

---

## 17. Environment Variables and Secrets Management

## 17.1 Prefix rules

- `NEXT_PUBLIC_*` for browser-safe web/studio values
- `EXPO_PUBLIC_*` for browser-safe/native-safe mobile values
- unprefixed for server-only secrets

## 17.2 Expected variable categories

### Shared/public-ish
- Supabase URL
- Supabase anon key
- app base URL
- Rollbar client token
- Stripe publishable key
- price IDs if used client-side

### Server-only
- Supabase service role key
- Stripe secret key
- Stripe webhook secret
- Rollbar server token
- Slack webhook URL
- cron secret
- optional domain allowlist values

## 17.3 Validation

Validate env vars at startup/build time.
Use simple helper or Zod.

## 17.4 CI/CD

- Vercel env vars per project and environment
- EAS secrets for mobile
- never commit real env files

---

## 18. Background Jobs and Async Processing

Default baseline:
- Vercel Cron for scheduled jobs
- route-handler webhook processing for inbound events
- no dedicated queue initially

## 18.1 Good cron use cases
- cleanup temp uploads
- expire entitlements
- digest emails
- sync checks
- monthly usage resets if not lazy

## 18.2 General async approach

For longer tasks:
- accept request
- create job row if needed
- process async/retriably
- surface status in Studio if it matters operationally

## 18.3 When to add a queue

Add a real queue only when you actually need:
- retries with backoff
- durable longer-running tasks
- high-throughput fan-out
- work that exceeds serverless execution comfort

---

## 19. File and Storage Patterns

Use Supabase Storage.

Recommended buckets:
- `avatars` private
- `attachments` private
- `content` private
- `content-public` public
- `temp-uploads` private

## 19.1 Path conventions

- user: `{user_id}/{filename}`
- workspace-shared: `{workspace_id}/{user_id}/{filename}`
- content: `{section}/{slug}/{filename}`
- temp: `{user_id}/temp/{filename}`

## 19.2 URL rules

- public bucket -> public URL
- private bucket -> signed URL from server

## 19.3 Metadata tracking

Track uploaded files in a table like `user_files`.
Track quota in `user_storage_usage`.

## 19.4 Cleanup

- cron cleanup for temp uploads
- delete or orphan-check associated files when entities are removed
- enforce file size limits per category

---

## 20. SEO and Marketing Site Architecture

This is another area where the stronger patterns from both specs combine well.

## 20.1 Public route set

Recommended routes:
- localized homepage
- localized pricing
- localized solutions
- localized alternatives
- blog index/post/tag/author
- help index/article/tag
- legal pages
- optional download page
- sitemap
- RSS
- robots

## 20.2 Metadata

Every public page should have:
- title
- description
- OG metadata
- Twitter card metadata where relevant

Root layout should set `metadataBase`.

## 20.3 Content SEO

For blog posts use:
- dynamic metadata
- JSON-LD Article schema
- dynamic or static OG images if worthwhile

For product/landing pages use:
- appropriate structured data when relevant

## 20.4 Performance rules

- static generation where possible
- server components by default
- use `next/image`
- self-host fonts
- minimize client JS on marketing pages

---

## 21. Testing and Quality Standards

## 21.1 Minimum quality gates

- strict typecheck
- lint
- format check
- unit tests
- integration tests for critical infra
- E2E tests for key user journeys

## 21.2 Recommended tools

- Vitest for unit/integration
- Playwright for E2E
- local Supabase for integration testing of auth/RLS/billing flows where possible

## 21.3 Critical coverage

Must test:
1. signup/login/logout flows
2. protected route behavior
3. Stripe checkout + webhook sync
4. entitlement calculation
5. RLS isolation between users/workspaces
6. Studio access denial for non-admins
7. content rendering and publishing flow

## 21.4 CI pipeline

Recommended order:
- install
- typecheck
- lint
- format check
- unit tests
- integration tests
- build
- E2E tests

---

## 22. Deployment and Environments

## 22.1 Environments

Recommended tiers:
- local
- preview
- optional staging
- production

## 22.2 Vercel structure

Separate Vercel projects for:
- web
- Studio

Each has:
- own env vars
- own deployment lifecycle
- own domain

## 22.3 Supabase environments

Use separate hosted Supabase projects for production and at least one non-production environment if possible.

Local development should still rely on local Supabase by default.

## 22.4 Mobile

Use EAS for build/release.
Mobile release cadence is independent from web/studio deploys.

## 22.5 Deployment checklist

Before production release:
- migrations applied
- env vars configured
- Stripe webhooks pointed correctly
- Rollbar configured
- Slack webhook configured
- domains/DNS working
- SSL active

---

## 23. Security Baseline

This is a core part of the reusable foundation.

## 23.1 Route protection

- authenticated app routes protected in middleware and/or layout
- API routes verify session or bearer token
- Studio protected separately with super-admin enforcement

## 23.2 RLS-first posture

- RLS enabled on every table
- default deny
- explicit policies only
- service-role bypass only in trusted server paths

## 23.3 Webhook security

- verify signatures on all inbound webhooks
- do not process unsigned payloads
- use correct retry semantics

## 23.4 Token handling

- web uses HTTP-only cookie sessions
- mobile uses secure/native storage
- never log JWTs
- never expose service role key

## 23.5 Logging hygiene

- avoid PII in logs
- scrub sensitive fields in Rollbar
- prefer IDs over emails/names in technical logs
- keep audit trails for privileged actions

## 23.6 Abuse prevention

- Zod validation at all boundaries
- rate limit expensive endpoints
- enforce billing/usage limits server-side
- file size limits

## 23.7 Backward compatibility

Especially for mobile-facing APIs, annotate compatibility shims clearly with searchable comments and remove them deliberately later.

---

## 24. Suggested Implementation Order

### Phase 1: foundation
1. bootstrap pnpm workspace
2. create shared package skeletons
3. configure root TS/Prettier/lint approach
4. set up local Supabase
5. create initial migrations for profiles/workspaces/members/subscriptions
6. generate DB types

### Phase 2: web shell and auth
7. scaffold web app
8. add Supabase client factories
9. add middleware session handling
10. build auth routes and callback
11. add user/workspace bootstrap
12. build authenticated shell and settings pages

### Phase 3: billing and entitlements
13. Stripe checkout + portal endpoints
14. Stripe webhook processing
15. entitlement helpers and usage checks
16. billing UI

### Phase 4: observability
17. Rollbar setup
18. Slack event logging
19. audit log plumbing

### Phase 5: Studio
20. scaffold Studio app
21. implement super-admin checks
22. dashboard + user/workspace views
23. billing/admin tools
24. audit views
25. admin management

### Phase 6: content system
26. content tables + storage buckets
27. shared MDX package
28. Studio content editor
29. blog/help rendering in web app
30. cache bust + revalidation flow

### Phase 7: localization + marketing
31. i18n package and locale routing
32. homepage/pricing/legal pages
33. solutions/alternatives pages
34. sitemap/rss/robots/structured data

### Phase 8: mobile optional
35. scaffold Expo app
36. auth + deep linking
37. query layer and core screens
38. notifications
39. RevenueCat only if needed

### Phase 9: hardening
40. RLS tests
41. auth/billing E2E tests
42. cron/jobs where needed
43. deployment config
44. security review

---

## 25. Non-goals / Exclusions

This document does **not** define:
- business logic
- vertical/domain schemas
- product-specific workflows
- ICP or GTM strategy
- pricing values or packaging strategy
- feature definitions tied to a product idea
- analytics/BI architecture beyond lightweight internal ops logging
- bespoke role systems beyond the foundational patterns

---

## 26. Final Recommendation Summary

If building a new SaaS product on this foundation, the strongest default choices are:

- **pnpm monorepo with apps + packages**
- **Next.js web + separate Next.js Studio**
- **optional Expo mobile app**
- **Supabase as the backend platform**
- **workspace-based multi-tenant architecture by default**
- **user-private tables where appropriate**
- **Stripe for billing, workspace-level subscriptions**
- **RLS-first database design**
- **service-role access only in tightly controlled server paths**
- **Studio-managed MDX content system backed by DB metadata + storage bodies**
- **custom JSON-file i18n without i18next**
- **Rollbar + Slack for observability/ops**
- **Vercel + local Supabase dev workflow**

This gives the best balance of:
- simplicity
- production readiness
- extensibility
- low architectural regret
- consistency across multiple future SaaS products

