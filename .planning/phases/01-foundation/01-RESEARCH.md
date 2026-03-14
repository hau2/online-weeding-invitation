# Phase 1: Foundation - Research

**Researched:** 2026-03-14
**Domain:** Monorepo bootstrap, Supabase schema + RLS, Custom NestJS auth (JWT), Next.js auth middleware, Design system baseline
**Confidence:** HIGH (core patterns), MEDIUM (Supabase custom JWT/RLS interaction)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Registration: email + password only (no phone number at signup)
- Login: email + password (standard form login)
- Auth error display: toast notifications (not inline field errors)
- Auth pages layout: centered card on soft background — clean and focused
- Password reset via email link (standard flow)
- Color palette: soft pink/rose — romantic, wedding-themed with rose gold accents, soft pinks, warm whites
- Component library: shadcn/ui (Tailwind-based, copy-paste, full control)
- Animation level: rich animations throughout — page reveals, card animations, micro-interactions
- Typography: Be Vietnam Pro — modern Vietnamese-optimized sans-serif with `subsets: ['vietnamese']`
- Overall feel: beautiful, youthful, wedding-appropriate
- Hosting: Supabase Cloud (managed service, free tier to start)
- Auth provider: Custom NestJS auth (NOT Supabase Auth) — full control over auth logic, NestJS issues and validates JWTs
- Storage: Free tier (1GB) — use Sharp in NestJS for image optimization instead of Supabase Pro image transforms
- Two-client pattern: user JWT client (for user-scoped queries) + service role client (for admin/system operations)
- User roles: single `role` column on users table ('user' | 'admin')
- Invitation model: single event per invitation (one date/time/venue)
- Deletion strategy: soft delete everywhere — all records use `deleted_at` column, nothing hard-deleted
- Slug format: name + random suffix (e.g., minh-thao-x7k2) — readable + unique
- Slug immutability: locked at DB constraint level after first publish
- pnpm monorepo with Turborepo for build orchestration
- apps/web (Next.js 16), apps/api (NestJS 11), packages/types (shared TypeScript)

### Claude's Discretion
- Exact Tailwind color values within the soft pink/rose palette
- Monorepo folder structure details
- NestJS module organization
- JWT token expiration times
- Password complexity rules
- Database column types and indexes
- RLS policy implementation details

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign up with email or phone number + password | Custom NestJS register endpoint with bcrypt hashing; `users` table with `email`, `password_hash`, `role`, `deleted_at` columns; Supabase DB as storage (not Supabase Auth) |
| AUTH-02 | User can log in and session persists across browser refresh | NestJS login endpoint issues JWT; Next.js stores JWT in httpOnly cookie via `@supabase/ssr`-style cookie setter or manual cookie; middleware validates JWT on each request using `jose` (Edge-compatible) |
| AUTH-03 | User can log out from any page | Next.js server action or API route that clears the auth cookie; client-side call from any page's nav |
| AUTH-04 | User can reset password via email link | NestJS password reset flow: generate time-limited token → email via Supabase SMTP or nodemailer → validate token endpoint → update password_hash |
| SYST-01 | Vietnamese-only UI throughout the platform | All UI strings in Vietnamese from day 1; Next.js `lang="vi"` on `<html>`; no i18n library needed (single language) |
| SYST-03 | User can only edit their own invitations | RLS on `invitations` table: `USING (user_id = auth.uid())` for SELECT/UPDATE/DELETE; NestJS ownership check before any mutation (defense-in-depth) |
</phase_requirements>

---

## Summary

This foundation phase bootstraps a greenfield pnpm+Turborepo monorepo containing Next.js 16 (frontend) and NestJS 11 (API), connects to a Supabase Cloud PostgreSQL database with RLS-enabled schema, implements custom NestJS JWT authentication (register/login/logout/password-reset), and establishes the visual design baseline (shadcn/ui, Tailwind v4, Be Vietnam Pro font, soft pink/rose palette with framer-motion animations).

The most technically nuanced decision is using **custom NestJS-issued JWTs** (not Supabase Auth) while still leveraging **Supabase RLS**. NestJS signs JWTs using the project's **Supabase JWT Secret** (`sub` = user UUID, `role` = `"authenticated"`). Supabase's PostgreSQL layer verifies these JWTs and evaluates RLS policies using `auth.uid()` normally — because the signature matches and the claims are correct. This approach gives full auth control in NestJS while retaining RLS as a database-level security backstop.

Next.js middleware runs in the **Edge runtime**, which means JWT verification must use `jose` (not `jsonwebtoken`, which requires Node.js crypto). The middleware reads the JWT from an httpOnly cookie, verifies it with `jose`, and redirects unauthenticated requests. All auth state flows as: NestJS issues JWT → stored in httpOnly cookie by Next.js response → middleware reads cookie on each request.

**Primary recommendation:** Wire the Supabase JWT Secret through NestJS's `@nestjs/jwt` module. NestJS signs tokens; the middleware decodes them using `jose`. Supabase RLS evaluates the same tokens via `Authorization` header on any direct Supabase client calls from NestJS (two-client pattern).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pnpm | 9.x | Package manager + workspace orchestration | Fastest, native workspace support; Turborepo's recommended pairing |
| Turborepo | 2.x | Build pipeline + caching across apps | Rust-rewritten, zero-config caching; standard for Next.js+NestJS monorepos |
| Next.js | 16.x (16.1.6) | Frontend framework, App Router, SSR | Project-specified; React 19 required |
| NestJS | 11.x (11.1.16) | REST API, auth module, business logic | Project-specified; improved startup in v11 |
| @supabase/supabase-js | 2.x (2.99.0) | Supabase DB + Storage client | Requires Node 20+ (dropped 18 in v2.79.0) |
| @nestjs/jwt | 10.x | JWT issuance and verification in NestJS | Official NestJS JWT integration |
| bcrypt | 5.x | Password hashing | Industry-standard, salted hashing |
| jose | 5.x | Edge-compatible JWT verification | Required for Next.js middleware (Edge runtime cannot use jsonwebtoken) |
| framer-motion | 12.x (12.36.0) | Page transitions, card animations, micro-interactions | React 19 compatible; project-specified |
| shadcn/ui | latest | UI components (copy-paste, Tailwind-based) | Project-specified; updated for Tailwind v4 + React 19 |
| tailwindcss | 4.x | Utility CSS | Project-specified; v4 changes CSS config approach entirely |
| class-validator + class-transformer | latest | NestJS DTO validation | Official NestJS validation pattern |
| @nestjs/passport + passport-jwt | latest | NestJS JWT guard/strategy | Standard NestJS auth strategy pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @nestjs/config | 3.x | Environment variable management in NestJS | Load `.env` values (JWT secret, Supabase keys) safely |
| @nestjs/mailer + nodemailer | latest | Email sending for password reset | AUTH-04 password reset email flow |
| react-hook-form + zod + @hookform/resolvers | 7.x / 3.x | Frontend form validation | Auth forms (register, login, reset password) |
| @tanstack/react-query | 5.x | Server state (API calls from Next.js to NestJS) | Auth mutations and session management |
| tw-animate-css | latest | Tailwind v4 compatible animation utilities | Replaces `tailwindcss-animate` which is deprecated in shadcn/ui Tailwind v4 setup |
| sonner | latest | Toast notifications for auth errors | shadcn/ui's recommended replacement for deprecated `toast` component |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom NestJS JWT | Supabase Auth | Supabase Auth is simpler but user chose full control; NestJS-issued JWT also works with Supabase RLS if signed with project JWT secret |
| jose (Edge) | jsonwebtoken | `jsonwebtoken` requires Node.js crypto, unavailable in Next.js Edge middleware; `jose` is the only viable option |
| bcrypt | argon2 | argon2 is stronger but bcrypt is more widely documented with NestJS and sufficient for this use case |
| shadcn/ui toast | react-hot-toast | shadcn/ui ecosystem consistency; sonner is now the official shadcn recommendation |
| @nestjs/mailer | Supabase Auth email | Supabase Auth email is tied to Supabase Auth flows; since we use custom auth, NestJS must own email delivery |

**Installation:**

```bash
# Monorepo root
pnpm add -D turbo

# Backend (apps/api)
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt \
  class-validator class-transformer @nestjs/config @nestjs/mailer nodemailer \
  @supabase/supabase-js
pnpm add -D @types/bcrypt @types/passport-jwt @types/nodemailer

# Frontend (apps/web)
pnpm add framer-motion jose react-hook-form zod @hookform/resolvers \
  @tanstack/react-query sonner @supabase/supabase-js tw-animate-css
pnpm add -D tailwindcss @tailwindcss/postcss

# Shared types package (packages/types)
# No runtime deps — TypeScript only
```

---

## Architecture Patterns

### Recommended Project Structure

```
/
├── apps/
│   ├── web/                          # Next.js 16 frontend
│   │   ├── app/
│   │   │   ├── (auth)/               # Auth route group — no nav chrome
│   │   │   │   ├── layout.tsx        # Centered card layout, soft pink bg
│   │   │   │   ├── dang-ky/page.tsx  # Register page (AUTH-01)
│   │   │   │   ├── dang-nhap/page.tsx # Login page (AUTH-02)
│   │   │   │   ├── dat-lai-mat-khau/page.tsx  # Request reset (AUTH-04)
│   │   │   │   └── xac-nhan-mat-khau/page.tsx # Confirm reset token
│   │   │   ├── (app)/                # Authenticated area — guarded
│   │   │   │   └── layout.tsx        # Auth guard + dashboard chrome
│   │   │   ├── (admin)/              # Admin area — role guarded
│   │   │   └── api/
│   │   │       └── revalidate/route.ts # ISR revalidation webhook (Phase 5)
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui components (copy-pasted)
│   │   │   └── auth/                 # Auth-specific components
│   │   ├── lib/
│   │   │   ├── api.ts                # Typed fetch client to NestJS API
│   │   │   └── fonts.ts              # next/font configuration
│   │   └── middleware.ts             # Edge JWT verification with jose
│   └── api/                          # NestJS 11 backend
│       └── src/
│           ├── auth/
│           │   ├── auth.module.ts
│           │   ├── auth.controller.ts  # POST /auth/register, /login, /logout, /reset-password
│           │   ├── auth.service.ts     # bcrypt, JWT sign, email
│           │   ├── dto/
│           │   │   ├── register.dto.ts
│           │   │   ├── login.dto.ts
│           │   │   └── reset-password.dto.ts
│           │   └── guards/
│           │       ├── jwt.guard.ts    # Validates Bearer JWT on protected routes
│           │       └── admin.guard.ts  # Checks role === 'admin'
│           ├── common/
│           │   ├── decorators/current-user.decorator.ts
│           │   ├── filters/http-exception.filter.ts
│           │   └── interceptors/transform.interceptor.ts
│           ├── supabase/
│           │   ├── supabase.module.ts
│           │   └── supabase.service.ts  # Two-client factory
│           └── main.ts
├── packages/
│   ├── types/                        # Shared TypeScript interfaces
│   │   ├── package.json              # name: "@repo/types", no runtime deps
│   │   └── src/
│   │       ├── user.ts               # User, UserRole interfaces
│   │       ├── auth.ts               # LoginRequest, RegisterRequest, AuthResponse
│   │       └── index.ts
│   └── config/                       # Shared ESLint + TS configs
│       ├── eslint-base.js
│       └── tsconfig.base.json
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### Pattern 1: NestJS Issues Supabase-Compatible JWTs

**What:** NestJS signs JWTs using the Supabase project's JWT Secret. The payload includes `sub` (user UUID from the `users` table), `role: "authenticated"`, `email`, and standard `iat`/`exp` claims. Supabase PostgreSQL recognizes these tokens as valid and evaluates RLS policies using `auth.uid()` which reads the `sub` claim.

**When to use:** Any time NestJS needs to create a JWT that the Supabase database layer will also understand for RLS enforcement.

**Critical detail:** The Supabase JWT Secret lives in Supabase Dashboard → Settings → Data API → JWT Secret. It must be stored as `SUPABASE_JWT_SECRET` in NestJS `.env`, never in Next.js `NEXT_PUBLIC_*`.

```typescript
// Source: Supabase JWT docs + community NestJS patterns
// apps/api/src/auth/auth.service.ts

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly supabase: SupabaseService,
  ) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    // 1. Fetch user from users table (service role client)
    const { data: user } = await this.supabase.admin
      .from('users')
      .select('id, email, password_hash, role, deleted_at')
      .eq('email', email)
      .single()

    if (!user || user.deleted_at) throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ')

    // 2. Verify password
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ')

    // 3. Sign JWT using Supabase JWT Secret — RLS will accept this
    const payload = {
      sub: user.id,           // Required: auth.uid() reads this
      role: 'authenticated',  // Required: Supabase RLS checks this Postgres role
      email: user.email,
      app_role: user.role,    // Custom claim: 'user' | 'admin'
      aud: 'authenticated',
    }
    const token = this.jwtService.sign(payload, {
      expiresIn: '7d',  // Adjust per Claude's discretion
    })

    return { access_token: token, user: { id: user.id, email: user.email, role: user.role } }
  }
}
```

### Pattern 2: Next.js Middleware with jose (Edge-Compatible)

**What:** Next.js middleware runs in the Edge runtime. `jsonwebtoken` is incompatible (requires Node.js crypto). `jose` uses Web Crypto API and runs cleanly. The middleware reads the JWT from an httpOnly cookie set by the Next.js response after NestJS login, verifies it, and redirects unauthenticated requests.

**When to use:** Protecting `(app)` and `(admin)` route groups in Next.js.

```typescript
// Source: Edge runtime JWT verification community patterns (2025)
// apps/web/middleware.ts
import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)

export const config = {
  matcher: ['/dashboard/:path*', '/thep-cuoi/:path*', '/admin/:path*'],
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/dang-nhap', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Admin route guard
    if (req.nextUrl.pathname.startsWith('/admin') && payload['app_role'] !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/dang-nhap', req.url))
  }
}
```

**Note:** `SUPABASE_JWT_SECRET` must NOT be prefixed with `NEXT_PUBLIC_`. It's read only by server-side middleware, never exposed to the browser.

### Pattern 3: Two-Client Supabase Service in NestJS

**What:** NestJS maintains two Supabase clients — an admin (service role) client as a singleton for system operations, and a per-request user client initialized with the incoming JWT for user-scoped operations. The per-request client has `Scope.REQUEST` injection so it is never shared across concurrent requests.

**When to use:** All NestJS operations that touch the Supabase database. Use admin client only for admin operations, cross-user queries, or system tasks.

```typescript
// Source: Supabase + NestJS two-client pattern (community confirmed, PITFALLS.md)
// apps/api/src/supabase/supabase.service.ts
import { Injectable, Scope, Inject } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Request } from 'express'

// Singleton: service role admin client
@Injectable()
export class SupabaseAdminService {
  readonly client: SupabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Per-request: user-scoped client (respects RLS)
@Injectable({ scope: Scope.REQUEST })
export class SupabaseUserService {
  readonly client: SupabaseClient

  constructor(@Inject(REQUEST) private readonly request: Request) {
    const token = request.headers.authorization?.replace('Bearer ', '') ?? ''
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    )
  }
}
```

### Pattern 4: Turborepo + pnpm Workspace Bootstrap

**What:** Root `pnpm-workspace.yaml` declares `apps/*` and `packages/*` as workspaces. `turbo.json` defines the build pipeline with `dependsOn: ["^build"]` so shared packages build before consuming apps.

**When to use:** Initial monorepo setup — must be done before any app code.

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

```json
// packages/types/package.json
{
  "name": "@repo/types",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": { "build": "tsc --noEmit" }
}
```

### Pattern 5: Database Schema with RLS + Soft Delete

**What:** All tables have `deleted_at TIMESTAMPTZ DEFAULT NULL` for soft delete. Users table holds auth credentials since we use custom NestJS auth (not Supabase Auth). RLS on `users` table uses `auth.uid()` which maps to the `sub` claim of NestJS-issued JWTs (signed with Supabase JWT Secret).

**Critical RLS + soft delete interaction:** UPDATE policies require a corresponding SELECT policy. To soft-delete (`UPDATE SET deleted_at = NOW()`), the row must pass the SELECT policy. Filter `deleted_at IS NULL` in SELECT policies to exclude soft-deleted rows from normal access.

```sql
-- Source: Supabase RLS official docs + soft delete patterns
-- Migration: 001_foundation_schema.sql

-- Users table (custom auth — not auth.users)
CREATE TABLE public.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- User can read their own record (excludes soft-deleted)
CREATE POLICY "user_select_own" ON public.users
  FOR SELECT USING (
    (SELECT auth.uid()) = id AND deleted_at IS NULL
  );

-- User can update their own record
-- WITH CHECK needed separately because UPDATE needs both SELECT + UPDATE policy
CREATE POLICY "user_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Indexes (RLS policy columns must be indexed)
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_deleted_at ON public.users(deleted_at) WHERE deleted_at IS NOT NULL;

-- Password reset tokens table
CREATE TABLE public.password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS policy — NestJS uses service role for token operations
```

### Pattern 6: shadcn/ui + Tailwind v4 Setup

**What:** Tailwind v4 changes configuration from `tailwind.config.js` to CSS-first `@import "tailwindcss"` with `@theme inline`. shadcn/ui is updated for v4: components use `data-slot` attributes, `tailwindcss-animate` is replaced by `tw-animate-css`, toast is replaced by `sonner`, and the `new-york` style is the current default.

**When to use:** Initial Next.js app setup — do this before adding any components.

```css
/* apps/web/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  /* Be Vietnam Pro font variables */
  --font-body: var(--font-be-vietnam-pro);

  /* Soft pink/rose palette — Claude's discretion on exact values */
  --color-rose-50: oklch(97.5% 0.015 355);
  --color-rose-100: oklch(94.5% 0.028 355);
  --color-rose-200: oklch(89% 0.05 355);
  --color-rose-400: oklch(75% 0.12 355);
  --color-rose-500: oklch(65% 0.16 355);
  --color-rose-600: oklch(55% 0.18 355);

  /* Rose gold accent */
  --color-gold-400: oklch(78% 0.08 45);
}
```

```typescript
// apps/web/lib/fonts.ts
// Source: STACK.md, next/font official docs
import { Be_Vietnam_Pro, Playfair_Display, Dancing_Script } from 'next/font/google'

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
})

export const playfairDisplay = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '700'],
  variable: '--font-heading',
  display: 'swap',
})

export const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-script',
  display: 'swap',
})
```

### Pattern 7: Auth Pages — Centered Card with framer-motion

**What:** Auth route group `(auth)/layout.tsx` renders a full-screen soft pink/rose background with a centered white card. framer-motion `AnimatePresence` + `motion.div` adds a subtle fade + slide-up on page enter.

**When to use:** All auth pages (register, login, password reset).

```typescript
// apps/web/app/(auth)/layout.tsx
'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Using jsonwebtoken in Next.js middleware:** Throws `Error: The edge runtime does not support Node.js 'crypto' module`. Use `jose` instead.
- **Storing SUPABASE_SERVICE_ROLE_KEY in NEXT_PUBLIC_*:** Exposes admin bypass to the browser. Service role lives only in NestJS environment.
- **Calling Supabase DB directly from Next.js client components:** Bypasses NestJS business logic, plan limits, ownership checks. All DB access via NestJS REST API.
- **Using Supabase Auth alongside custom NestJS auth:** Two auth systems create confusion over JWT issuance. One issuer only — NestJS.
- **Single Supabase client (service role) for all NestJS operations:** Bypasses RLS entirely. Use the two-client pattern from day one.
- **RLS without matching SELECT + UPDATE policies:** UPDATE silently fails without a SELECT policy on the same table. Always pair them.
- **Using `auth.jwt() -> 'user_metadata'` in RLS policies:** Users can modify their own metadata, making this unsafe. Use `auth.uid()` (reads the immutable `sub` claim) exclusively.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT issuance + verification in NestJS | Custom JWT logic | `@nestjs/jwt` + `jsonwebtoken` (server-side) | Handles signing, expiry, key rotation; `@nestjs/jwt` integrates with DI |
| Edge-runtime JWT verification | Custom Web Crypto API calls | `jose` (`jwtVerify`) | jose is purpose-built for this; handles algorithm specifics correctly |
| Password hashing | Custom crypto | `bcrypt` | Timing-safe, salted; rolling your own is a security anti-pattern |
| Build pipeline caching | Custom scripts | Turborepo | Remote caching, dependency-aware task scheduling; saving hours on CI |
| Font optimization | CDN `<link>` tags | `next/font/google` | Self-hosts at build time; eliminates 150-300ms CDN latency on Vietnamese mobile networks |
| CSS animation utilities | Custom keyframe classes | `tw-animate-css` | Tailwind v4 compatible; replaces the deprecated `tailwindcss-animate` |
| Toast notifications | Custom toast component | `sonner` (via shadcn) | Accessibility, stacking, dismissal edge cases are complex; sonner is the shadcn/ui canonical choice |
| Form validation | Manual state + error tracking | `react-hook-form` + `zod` | Uncontrolled inputs (no re-renders), resolver pattern; shares Zod schemas as types |
| NestJS DTO validation | Manual validation | `class-validator` + `class-transformer` | Official NestJS integration; `ValidationPipe` handles it automatically |

**Key insight:** Auth is the highest-risk area for hand-rolled solutions. Every piece of the auth stack has subtle timing attacks, encoding bugs, or key management complexity. Use the ecosystem's vetted tools for every auth primitive.

---

## Common Pitfalls

### Pitfall 1: jsonwebtoken in Next.js Middleware (Edge Runtime)

**What goes wrong:** Installing `jsonwebtoken` and using it in `middleware.ts` throws `Error: The edge runtime does not support Node.js 'crypto' module`. The build may succeed but the middleware crashes at runtime.

**Why it happens:** Next.js middleware runs in the Edge runtime (browser-compatible Web APIs only). `jsonwebtoken` relies on Node.js's built-in `crypto` module.

**How to avoid:** Use `jose` for all JWT operations in `middleware.ts`. `jose` uses the Web Crypto API and is explicitly Edge-compatible.

**Warning signs:** Any `import ... from 'jsonwebtoken'` in `middleware.ts`. The error only surfaces at runtime, not build time.

---

### Pitfall 2: Supabase JWT Secret Key Rotation — New Projects Use New Key Format

**What goes wrong:** Newer Supabase projects (created in 2025+) use the updated signing key system. The legacy `JWT_SECRET` string may behave differently from what older tutorials show, particularly if asymmetric keys are configured.

**Why it happens:** Supabase updated their JWT signing system in 2025 to support asymmetric keys (RSA/ECDSA). New projects may default to this. Tutorials pre-dating this show a simple HMAC secret.

**How to avoid:** In Supabase Dashboard → Settings → Data API, confirm whether your project uses a **legacy JWT Secret** (HMAC HS256 string) or asymmetric keys. For the custom NestJS auth approach, the **HMAC secret** (`HS256`) is required because NestJS signs with `@nestjs/jwt` (which uses HS256 by default). If the project is configured for asymmetric keys, you would need to import a private key into NestJS — this is significantly more complex. **Recommendation:** Use HS256 with the JWT Secret string for this project. Verify in the dashboard that the project uses the legacy secret or configure it explicitly.

**Warning signs:** JWT verification failures in Supabase even with correct `sub` and `role` claims. Check the Supabase dashboard JWT settings page.

**Confidence:** MEDIUM — Supabase's 2025 key changes are documented but the exact behavior for new free-tier projects is not definitively confirmed.

---

### Pitfall 3: RLS Blocks NestJS Service Role Operations — But Not the Way You Think

**What goes wrong:** Developer enables RLS on the `users` table and writes user-scoped SELECT policies. The NestJS **admin (service role) client** is supposed to bypass RLS, but a developer accidentally uses the **user-scoped client** for admin operations — and the service role key is never actually used. Admin operations silently return empty results instead of all rows.

**Why it happens:** Both clients use the same `createClient` API. It's easy to inject the wrong service. The service role client bypasses RLS entirely; the user client with a user JWT only sees that user's rows.

**How to avoid:** Be explicit about which client is used in each NestJS service method. Admin operations (e.g., fetching user by email during login verification) must use the admin client. User-scoped operations must use the per-request user client. Add a code comment labeling each database call with which client it uses and why.

---

### Pitfall 4: Supabase Free Tier — 2 Projects Limit

**What goes wrong:** Supabase Cloud free tier allows only **2 active projects**. If you create a test project during development and a production project, you may hit the limit. Paused projects still count.

**Why it happens:** The free tier limit is per organization, not per project type. A paused project still occupies a slot.

**How to avoid:** Use a single Supabase project with separate PostgreSQL schemas (`dev` vs `prod`) via schema suffixes, OR use separate environment variable files (`.env.local` for dev pointing to the same project with different table prefixes). For a greenfield v1, one project is sufficient — just use environment variables to differentiate.

---

### Pitfall 5: Next.js App Router Hydration Mismatch with framer-motion

**What goes wrong:** framer-motion components that read browser APIs (window size, scroll position) during initial render cause server/client HTML mismatch errors. The auth card animation may flash or break in production.

**Why it happens:** Next.js App Router renders layouts server-side by default. Animation state is client-only.

**How to avoid:** All components using framer-motion must be `'use client'`. The `(auth)/layout.tsx` is a Client Component — explicitly mark it. Never initialize animation state from browser APIs in the render function; use `useEffect` for any client-only initialization.

---

### Pitfall 6: shadcn/ui + Tailwind v4 — tailwindcss-animate Is Deprecated

**What goes wrong:** Running `npx shadcn@latest init` in a fresh Next.js project with Tailwind v4 may still reference `tailwindcss-animate` in some legacy component templates. These animations silently break because `tailwindcss-animate` does not support Tailwind v4's `@theme inline` CSS-first config.

**Why it happens:** shadcn/ui migration to Tailwind v4 is ongoing; some component templates are being updated incrementally.

**How to avoid:** Install `tw-animate-css` instead of `tailwindcss-animate`. Import it in `globals.css` as `@import "tw-animate-css"`. If any shadcn component references `animate-*` classes from `tailwindcss-animate`, replace them with `tw-animate-css` equivalents.

---

## Code Examples

Verified patterns from official sources:

### NestJS Auth Module — Register Endpoint

```typescript
// Source: NestJS official docs + bcrypt standard patterns
// apps/api/src/auth/auth.controller.ts
import { Body, Controller, Post, Res } from '@nestjs/common'
import { Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password)
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password)
  }

  @Post('logout')
  logout() {
    // Token invalidation handled client-side (delete cookie)
    // For server-side revocation, maintain a token denylist in Supabase
    return { message: 'Đăng xuất thành công' }
  }
}
```

### NestJS Register DTO with class-validator

```typescript
// Source: NestJS official docs — Validation
// apps/api/src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator'

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string

  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu không được quá 72 ký tự' })  // bcrypt max
  password: string
}
```

### NestJS JWT Guard

```typescript
// Source: NestJS official docs — Authentication with Passport
// apps/api/src/auth/guards/jwt.guard.ts
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

```typescript
// apps/api/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('SUPABASE_JWT_SECRET'),
    })
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.app_role,  // 'user' | 'admin'
    }
  }
}
```

### Supabase RLS Policies for Foundation Tables

```sql
-- Source: Supabase RLS official docs
-- SYST-03: User can only access their own data

-- Invitations table RLS (to be created in Phase 3, defined here for architecture clarity)
-- CREATE POLICY "owner_all" ON invitations
--   FOR ALL
--   TO authenticated
--   USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL)
--   WITH CHECK ((SELECT auth.uid()) = user_id);

-- For UPDATE to work, a SELECT policy is REQUIRED (Supabase docs confirmed)
-- The above FOR ALL policy covers all operations including SELECT — satisfies the requirement
```

### Shared Types Package

```typescript
// Source: ARCHITECTURE.md pattern
// packages/types/src/user.ts
export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  createdAt: string
  deletedAt: string | null
}

// packages/types/src/auth.ts
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: Pick<User, 'id' | 'email' | 'role'>
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` for Tailwind | CSS-first `@import "tailwindcss"` + `@theme inline` | Tailwind v4 (2025) | No more JS config file; all config in CSS |
| `tailwindcss-animate` | `tw-animate-css` | shadcn/ui Tailwind v4 migration (2025) | Different import pattern; same animation API |
| `toast` component in shadcn/ui | `sonner` | shadcn/ui updated (2025) | `toast` deprecated; `Toaster` from sonner |
| `forwardRef` on shadcn components | Removed (React 19 ref as prop) | shadcn/ui + React 19 (2025) | `forwardRef` wrappers removed; simpler component API |
| `tailwind.config.js` `theme.extend.colors` | `@theme inline { --color-* }` | Tailwind v4 | OKLCH color space preferred |
| `jsonwebtoken` in middleware | `jose` in middleware | Next.js Edge runtime adoption | jsonwebtoken incompatible with Edge; jose is the standard |
| Supabase Auth for everything | Custom NestJS auth + Supabase JWT Secret | Architecture decision (this project) | More control; same RLS capability |

**Deprecated/outdated:**
- `tailwindcss-animate`: deprecated in shadcn/ui Tailwind v4 context; use `tw-animate-css`
- `react-beautiful-dnd`: deprecated by Atlassian 2022; use `@dnd-kit/sortable` (not relevant until Phase 4)
- `@supabase/auth-helpers-nextjs`: deprecated; use `@supabase/ssr` (not needed here since we use custom auth, but be aware)
- shadcn/ui `default` style: deprecated; new projects use `new-york` style

---

## Open Questions

1. **Supabase JWT Secret key type for new 2026 projects**
   - What we know: Supabase updated JWT signing in 2025 to support asymmetric keys; NestJS `@nestjs/jwt` defaults to HS256 (HMAC symmetric)
   - What's unclear: Whether a brand-new Supabase project created in 2026 defaults to asymmetric or legacy HMAC secret
   - Recommendation: On project creation, immediately go to Supabase Dashboard → Settings → Data API → JWT Settings and confirm the key type is `HS256` (legacy secret). If it shows asymmetric keys, either configure it to use the legacy secret or configure NestJS to use RS256 with a private key. Document the choice before writing any auth code.
   - Confidence: LOW — needs verification on actual Supabase dashboard at project creation time

2. **Password Reset Email — NestJS SMTP vs Supabase Email**
   - What we know: Supabase has a built-in email system but it's tied to Supabase Auth flows we're not using. The free tier allows 2 emails/hour on Supabase SMTP.
   - What's unclear: Whether Supabase's transactional email service can be used without Supabase Auth for custom flows.
   - Recommendation: Use a dedicated SMTP provider from the start. Resend.com has a generous free tier (3,000 emails/month) and a clean Node.js SDK. Configure via `@nestjs/mailer` + Resend SMTP. Avoid Supabase's SMTP for custom auth — it's designed for their own auth flows.
   - Confidence: MEDIUM

3. **Token logout/revocation strategy**
   - What we know: JWTs are stateless — logout requires either short expiry or a denylist.
   - What's unclear: Whether a token denylist is needed in v1 or if clearing the cookie is sufficient.
   - Recommendation: For v1, cookie deletion on logout is sufficient (short 7-day access token, user gets re-prompted at expiry). Add a `revoked_tokens` table or Redis-based denylist in a future phase if session revocation becomes a security requirement. Document the trade-off clearly.
   - Confidence: HIGH on recommendation, MEDIUM on when to upgrade

---

## Validation Architecture

`nyquist_validation` is enabled in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (for NestJS unit tests) + Playwright (e2e) |
| Config file | `apps/api/vitest.config.ts` — Wave 0 gap |
| Quick run command | `pnpm --filter api test` |
| Full suite command | `pnpm turbo test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | POST /auth/register creates user with hashed password | unit | `pnpm --filter api test -- auth.service` | ❌ Wave 0 |
| AUTH-01 | Register with duplicate email returns 409 | unit | `pnpm --filter api test -- auth.service` | ❌ Wave 0 |
| AUTH-02 | POST /auth/login returns JWT for valid credentials | unit | `pnpm --filter api test -- auth.service` | ❌ Wave 0 |
| AUTH-02 | JWT cookie persists — validated by middleware | integration | `pnpm --filter web test:e2e -- auth` | ❌ Wave 0 |
| AUTH-03 | Logout clears cookie; subsequent requests redirect | integration | `pnpm --filter web test:e2e -- auth` | ❌ Wave 0 |
| AUTH-04 | POST /auth/request-reset sends reset token (mock email) | unit | `pnpm --filter api test -- auth.service` | ❌ Wave 0 |
| AUTH-04 | POST /auth/reset-password validates token + updates hash | unit | `pnpm --filter api test -- auth.service` | ❌ Wave 0 |
| SYST-01 | HTML lang="vi" present on all pages | smoke | Manual inspection | ❌ Wave 0 |
| SYST-03 | Authenticated User B cannot read User A's invitation | integration | `pnpm --filter api test -- rls.e2e` (real Supabase test DB) | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm --filter api test -- auth.service`
- **Per wave merge:** `pnpm turbo test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/api/vitest.config.ts` — Vitest configuration for NestJS
- [ ] `apps/api/test/auth/auth.service.spec.ts` — Unit tests for register, login, reset password
- [ ] `apps/api/test/rls.e2e.spec.ts` — RLS integration test using a test-scoped Supabase project
- [ ] `apps/api/test/setup.ts` — Test database seeding + teardown helpers
- [ ] Playwright config: `apps/web/playwright.config.ts` — E2E test setup for auth flows
- [ ] Framework install: `pnpm --filter api add -D vitest @nestjs/testing` — if not already installed

---

## Sources

### Primary (HIGH confidence)
- [Supabase RLS Official Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — SELECT/UPDATE/DELETE policy patterns, WITH CHECK clause, UPDATE requires SELECT
- [Supabase JWT Claims Reference](https://supabase.com/docs/guides/auth/jwt-fields) — Required JWT claims, `sub` as auth.uid(), `role` values
- [shadcn/ui Tailwind v4 Migration Guide](https://ui.shadcn.com/docs/tailwind-v4) — Exact breaking changes, `@theme inline`, tw-animate-css, sonner
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) — Confirmed Tailwind v4 + React 19 support
- [Turborepo Configuration Reference](https://turborepo.dev/docs/reference/configuration) — `dependsOn`, `outputs`, `persistent` task fields
- [Next.js Official Font Docs](https://nextjs.org/docs/app/getting-started/fonts) — Self-hosting, Vietnamese subset
- [Supabase JWT Signing Keys](https://supabase.com/docs/guides/auth/signing-keys) — Key rotation, HS256 vs asymmetric
- [Supabase Third-Party Auth Overview](https://supabase.com/docs/guides/auth/third-party/overview) — Custom JWT requirements for RLS
- STACK.md (project research) — Verified library versions, compatibility matrix
- ARCHITECTURE.md (project research) — Two-client pattern, monorepo structure, data flows
- PITFALLS.md (project research) — Service role usage, RLS pitfalls, two-client pattern

### Secondary (MEDIUM confidence)
- [Authentication in Next.js Middleware — Edge Runtime](https://medium.com/@shuhan.chan08/authentication-in-next-js-middleware-edge-runtime-limitations-solutions-7692a44f47ab) — jose vs jsonwebtoken in Edge runtime
- [Implementing JWT Middleware in Next.js (Leapcell, DEV Community)](https://dev.to/leapcell/implementing-jwt-middleware-in-nextjs-a-complete-guide-to-auth-1b2d) — jose `jwtVerify` pattern in middleware
- [NestJS JWT + Refresh Tokens (Medium, Feb 2026)](https://medium.com/@jradzik4/authentication-in-nestjs-jwt-and-refresh-tokens-c44b7e715709) — JWT issuance patterns in NestJS 11
- [Using Supabase RLS with a Custom Auth Provider (Medium)](https://medium.com/@gracew/using-supabase-rls-with-a-custom-auth-provider-b31564172d5d) — Custom JWT + Supabase RLS flow
- [Supabase Soft Delete Discussion](https://github.com/orgs/supabase/discussions/2799) — Soft delete + RLS interaction (UPDATE requires SELECT)
- [Turborepo + NestJS + Next.js Setup (Medium)](https://medium.com/@chengchao60827/how-to-setup-a-monorepo-project-using-nextjs-nestjs-turborepo-and-pnpm-e0d3ade0360d) — Monorepo structure
- [NestJS Encryption and Hashing Official Docs](https://docs.nestjs.com/security/encryption-and-hashing) — bcrypt usage in NestJS

### Tertiary (LOW confidence — needs validation)
- WebSearch results on Supabase 2025 key format changes — behavior of new free-tier projects confirmed vaguely; verify in actual Supabase dashboard
- Community claims about Supabase free tier project limits (2 projects) — check current Supabase pricing page on project creation

---

## Metadata

**Confidence breakdown:**
- Monorepo setup (pnpm + Turborepo): HIGH — well-documented, stable tooling
- NestJS auth module (JWT, bcrypt, passport): HIGH — official NestJS docs + stable ecosystem
- Supabase RLS patterns: HIGH — official docs verified
- Custom JWT → Supabase RLS interaction (auth.uid() from NestJS-signed JWT): MEDIUM — confirmed conceptually, key format details need dashboard verification
- Tailwind v4 + shadcn/ui setup: HIGH — official shadcn docs verified
- Next.js middleware with jose: HIGH — Edge runtime limitation confirmed in multiple 2025 sources
- Supabase JWT signing key format for new 2026 projects: LOW — dashboard verification required

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable stack; Supabase key format question needs resolution at project creation)
