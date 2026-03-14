# Phase 1: Foundation - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the runnable monorepo (pnpm + Turborepo), configure Supabase Cloud with RLS-enabled PostgreSQL schema, build custom NestJS auth module (register/login/logout/reset), wire Next.js auth pages in Vietnamese, and establish the visual design baseline (Be Vietnam Pro font, shadcn/ui, Tailwind v4, soft pink/rose palette).

</domain>

<decisions>
## Implementation Decisions

### Auth Flow UX
- Registration: email + password only (no phone number at signup)
- Login: email + password (standard form login)
- Auth error display: toast notifications (not inline field errors)
- Auth pages layout: centered card on soft background — clean and focused
- Password reset via email link (standard flow)

### Visual Design System
- Color palette: soft pink/rose — romantic, wedding-themed with rose gold accents, soft pinks, warm whites
- Component library: shadcn/ui (Tailwind-based, copy-paste, full control)
- Animation level: rich animations throughout — page reveals, card animations, micro-interactions
- Typography: Be Vietnam Pro — modern Vietnamese-optimized sans-serif with `subsets: ['vietnamese']`
- Overall feel: beautiful, youthful, wedding-appropriate

### Supabase Setup
- Hosting: Supabase Cloud (managed service, free tier to start)
- Auth provider: Custom NestJS auth (NOT Supabase Auth) — full control over auth logic, NestJS issues and validates JWTs
- Storage: Free tier (1GB) — use Sharp in NestJS for image optimization instead of Supabase Pro image transforms
- Two-client pattern: user JWT client (for user-scoped queries) + service role client (for admin/system operations)

### Database Schema
- User roles: single `role` column on users table ('user' | 'admin')
- Invitation model: single event per invitation (one date/time/venue) — no multi-event support
- Deletion strategy: soft delete everywhere — all records use `deleted_at` column, nothing hard-deleted
- Slug format: name + random suffix (e.g., minh-thao-x7k2) — readable + unique
- Slug immutability: locked at DB constraint level after first publish

### Claude's Discretion
- Exact Tailwind color values within the soft pink/rose palette
- Monorepo folder structure details
- NestJS module organization
- JWT token expiration times
- Password complexity rules
- Database column types and indexes
- RLS policy implementation details

</decisions>

<specifics>
## Specific Ideas

- Auth pages should feel welcoming — soft pink background with centered white card
- Rich animations: use framer-motion for page transitions and component reveals
- Vietnamese copy throughout — all labels, errors, placeholders in tiếng Việt
- The design should feel premium even on the free tier — wedding couples care about aesthetics

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing source code — greenfield project

### Established Patterns
- None yet — this phase establishes the foundational patterns

### Integration Points
- Supabase Cloud project needs to be created
- pnpm monorepo with Turborepo for build orchestration
- apps/web (Next.js 16), apps/api (NestJS 11), packages/types (shared TypeScript)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-14*
