# Phase 3: Invitation Editor Core - Research

**Researched:** 2026-03-14
**Domain:** React form editor with debounced auto-save, template-driven live preview, NestJS PATCH/publish endpoints
**Confidence:** HIGH

## Summary

Phase 3 builds the core invitation editing experience: a side-by-side editor with form fields on the left and a phone-mockup live preview on the right. The form uses collapsible accordion sections for organized input, 800ms debounced auto-save via the NestJS API, and three distinct template components (Traditional, Modern, Minimalist) that render identically in both the editor preview and the future public page (Phase 5).

The technical foundation is solid. The project already has react-hook-form, framer-motion, shadcn/ui (base-nova style using @base-ui/react), and the Invitation TypeScript interface with all required fields. The NestJS API has an invitations controller with JWT cookie-based auth. The primary new work is: (1) adding accordion/collapsible/textarea shadcn components, (2) building three template React components, (3) implementing a PATCH endpoint with PartialType DTO, (4) building publish/unpublish endpoints with slug generation, and (5) wiring the debounced auto-save + live preview on the frontend.

**Primary recommendation:** Build template components as pure presentational components accepting `Invitation` data as props. Keep editor state local (React state) for zero-latency preview, debounce saves to the API separately. Use `crypto.randomBytes` for slug generation in NestJS (avoids nanoid ESM-only issue with CommonJS).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Side-by-side layout on desktop: form left, live preview right in phone-shaped mockup frame
- On mobile: stacked layout (form top, preview below)
- Sidebar auto-collapses to icons-only when editor opens
- Template visual identities:
  - Traditional: Ornate gold & red, double happiness motifs, decorative borders
  - Modern: Clean white + rose gold, minimalist layout, modern sans-serif
  - Minimalist: Pure typography on cream/off-white, thin line dividers
- Template selector: thumbnail strip above preview pane, instant switch on click
- Form organization: 3 collapsible accordion sections (couples, ceremony, message)
- Single date + single time field (no dual ceremony)
- Plain textarea for invitation message and thank-you text
- 800ms debounced auto-save, status text in topbar
- Publish button in TopBar, first-publish confirmation dialog with generated URL
- Post-publish celebration dialog with confetti and copy-URL
- Unpublish hidden in more-menu dropdown

### Claude's Discretion
- Exact accordion animation and transition styles
- Phone mockup frame design details
- Template thumbnail appearance in selector strip
- Confetti animation implementation for post-publish celebration
- Exact field validation rules and error display
- TopBar layout for editor context (back button, save status, publish button placement)
- How to handle incomplete required fields when publishing

### Deferred Ideas (OUT OF SCOPE)
- PUBL-02 (Fixed QR code for invitation URL) -- confirmed removed. Users share via link only.
- Dual ceremony times -- future enhancement if users request it.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EDIT-01 | User can enter bride/groom names, wedding date/time, venue address, invitation message, and thank-you text | Accordion form sections with shadcn input/textarea components, react-hook-form for field management |
| EDIT-02 | User sees real-time preview while editing | Local React state drives template component rendering with zero network round-trips |
| EDIT-03 | Editor auto-saves as draft | 800ms debounced PATCH to NestJS endpoint, useRef + setTimeout pattern |
| EDIT-08 | User can select from 3 templates with instant preview | Template selector component, templateId stored in invitation record, instant re-render |
| EDIT-09 | User can preview the complete invitation before publishing | Full-page preview mode rendering the same template component read-only |
| EDIT-10 | User can publish/unpublish invitation | NestJS publish/unpublish endpoints, slug generation on first publish, status management |
| SYST-02 | Slug permanently locked after first publish | DB partial unique index already exists, NestJS endpoint enforces slug immutability |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.0.0 | Form state management | Already in package.json, handles validation + field registration |
| @hookform/resolvers | ^3.0.0 | Zod schema integration for RHF | Already installed, pairs with zod for runtime validation |
| zod | ^3.0.0 | Schema validation | Already installed, used with react-hook-form resolvers |
| framer-motion | ^12.0.0 | Accordion animations, transitions | Already used in Phase 2, project standard for animations |
| @base-ui/react | ^1.3.0 | Headless UI primitives | Project uses base-nova shadcn style, accordion/collapsible use this |
| lucide-react | ^0.577.0 | Icons | Already installed, project standard |
| sonner | ^2.0.0 | Toast notifications | Already installed via sonner.tsx wrapper |

### New shadcn/ui Components (to add via CLI)
| Component | Install Command | Purpose |
|-----------|----------------|---------|
| accordion | `npx shadcn@latest add accordion` | Collapsible form sections (base-nova style uses @base-ui/react) |
| textarea | `npx shadcn@latest add textarea` | Invitation message and thank-you text fields |
| collapsible | `npx shadcn@latest add collapsible` | May be needed by accordion; install as dependency |

### NestJS Additions (no new packages)
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @nestjs/mapped-types | (bundled) | PartialType for update DTO | Already available via @nestjs/common |
| Node crypto | (built-in) | Slug generation | `crypto.randomBytes` avoids nanoid ESM/CJS issue |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Node crypto for slugs | nanoid v3 (CJS-compatible) | crypto is zero-dependency and already available; nanoid v4+ is ESM-only, incompatible with NestJS CommonJS. nanoid v3 would work but adds a dependency for a simple operation |
| canvas-confetti | framer-motion animations only | canvas-confetti adds ~6KB for realistic confetti; framer-motion can do simpler particle effects. Use canvas-confetti for the premium feel the user wants |
| Custom debounce | use-debounce npm package | Custom useRef+setTimeout is ~10 lines and avoids dependency; use-debounce is overkill for single use case |

**Installation:**
```bash
# Frontend -- add missing shadcn components
cd apps/web
npx shadcn@latest add accordion textarea collapsible

# Frontend -- confetti for publish celebration
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

No new backend packages needed. Slug generation uses Node.js built-in `crypto`.

## Architecture Patterns

### Recommended Project Structure
```
apps/web/
  app/(app)/thep-cuoi/
    [id]/
      page.tsx                 # Server component: fetch invitation, pass to editor
      EditorShell.tsx          # Client component: layout (sidebar collapse, form + preview)
      EditorForm.tsx           # Client component: accordion form with auto-save
      EditorPreview.tsx        # Client component: phone mockup frame + template render
      TemplateSelector.tsx     # Client component: thumbnail strip above preview
      PublishButton.tsx        # Client component: publish/unpublish in topbar
      FullPreviewDialog.tsx    # Client component: full-page preview overlay
      useAutoSave.ts           # Custom hook: 800ms debounced PATCH
  components/templates/
    TemplateTraditional.tsx    # Shared: used in editor preview AND public page (Phase 5)
    TemplateModern.tsx         # Shared: same interface
    TemplateMinimalist.tsx     # Shared: same interface
    TemplateRenderer.tsx       # Shared: maps templateId -> component
    types.ts                   # TemplateProps interface

apps/api/src/invitations/
    dto/
      update-invitation.dto.ts  # PartialType of field-level updates
    invitations.controller.ts   # Add: PATCH /:id, POST /:id/publish, POST /:id/unpublish, GET /:id
    invitations.service.ts      # Add: update, findOne, publish, unpublish methods
```

### Pattern 1: Template Components as Pure Presentation
**What:** Template components accept invitation data as props and render HTML/CSS. No data fetching, no state management.
**When to use:** Always -- templates must be reusable between editor preview and public page.
**Example:**
```typescript
// components/templates/types.ts
import type { Invitation } from '@repo/types'

export interface TemplateProps {
  invitation: Invitation
  className?: string
}

// components/templates/TemplateTraditional.tsx
'use client'
export function TemplateTraditional({ invitation, className }: TemplateProps) {
  return (
    <div className={cn('bg-gradient-to-b from-red-900 to-red-800 text-gold-300 p-8', className)}>
      <h1 className="font-heading text-3xl text-center">{invitation.brideName}</h1>
      <p className="font-script text-xl text-center">&</p>
      <h1 className="font-heading text-3xl text-center">{invitation.groomName}</h1>
      {/* ... rest of template */}
    </div>
  )
}

// components/templates/TemplateRenderer.tsx
import type { TemplateId } from '@repo/types'
const TEMPLATES: Record<TemplateId, React.ComponentType<TemplateProps>> = {
  traditional: TemplateTraditional,
  modern: TemplateModern,
  minimalist: TemplateMinimalist,
}
export function TemplateRenderer({ invitation, ...props }: TemplateProps) {
  const Component = TEMPLATES[invitation.templateId] ?? TEMPLATES.traditional
  return <Component invitation={invitation} {...props} />
}
```

### Pattern 2: Local State for Preview, Debounced Save for Persistence
**What:** Editor form updates local React state immediately (for instant preview), then debounces API calls for persistence.
**When to use:** Any form with live preview + auto-save requirement.
**Example:**
```typescript
// useAutoSave.ts
import { useRef, useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import type { Invitation } from '@repo/types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave(invitationId: string, delay = 800) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestDataRef = useRef<Partial<Invitation> | null>(null)

  const save = useCallback(
    (data: Partial<Invitation>) => {
      latestDataRef.current = data
      if (timerRef.current) clearTimeout(timerRef.current)

      timerRef.current = setTimeout(async () => {
        setStatus('saving')
        const { error } = await apiFetch(`/invitations/${invitationId}`, {
          method: 'PATCH',
          body: latestDataRef.current,
          credentials: 'include',
        })
        setStatus(error ? 'error' : 'saved')
        if (error) { /* toast error */ }
      }, delay)
    },
    [invitationId, delay],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { save, status }
}
```

### Pattern 3: NestJS PATCH with PartialType DTO
**What:** Use `@nestjs/mapped-types` PartialType to make all update fields optional. Validate only provided fields.
**When to use:** Any PATCH/partial-update endpoint.
**Example:**
```typescript
// dto/update-invitation.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { IsString, IsOptional, IsDateString, Matches } from 'class-validator'

class InvitationFieldsDto {
  @IsString()
  groomName: string

  @IsString()
  brideName: string

  @IsOptional()
  @IsDateString()
  weddingDate: string | null

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be HH:MM format' })
  weddingTime: string | null

  @IsString()
  venueName: string

  @IsString()
  venueAddress: string

  @IsString()
  invitationMessage: string

  @IsString()
  thankYouText: string

  @IsString()
  @IsIn(['traditional', 'modern', 'minimalist'])
  templateId: string
}

export class UpdateInvitationDto extends PartialType(InvitationFieldsDto) {}
```

### Pattern 4: Slug Generation with Node.js crypto
**What:** Generate URL-friendly slugs from couple names + random suffix using Node.js built-in crypto.
**When to use:** First-publish of an invitation.
**Example:**
```typescript
import { randomBytes } from 'crypto'

function generateSlug(brideName: string, groomName: string): string {
  // Normalize Vietnamese characters to ASCII-friendly
  const normalize = (s: string) =>
    s.normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '')  // strip diacritics
     .replace(/[^\w\s-]/g, '')          // remove non-word chars
     .trim()
     .replace(/\s+/g, '-')              // spaces to hyphens
     .toLowerCase()
     .slice(0, 20)                       // limit length

  const suffix = randomBytes(3).toString('base64url').slice(0, 4)  // 4 char random suffix
  return `${normalize(brideName)}-${normalize(groomName)}-${suffix}`
}
// Example: "minh-thao-x7k2"
```

### Anti-Patterns to Avoid
- **Fetching data in preview component:** The preview must render from local state, never make API calls. Any network latency kills the "real-time" feel.
- **Using form.handleSubmit for auto-save:** handleSubmit runs full validation on every save. Use form.getValues() or watch() for auto-save, reserving handleSubmit for explicit user actions like publish.
- **Building template components tightly coupled to the editor:** Templates must accept props and render -- no editor state, no save logic. Phase 5 public page will import them directly.
- **Using nanoid v4+ in NestJS:** The NestJS API uses `module: "commonjs"` in tsconfig. nanoid v4+ is ESM-only. Use Node.js `crypto.randomBytes` or nanoid v3 (which supports CJS) for slug generation.
- **Allowing slug mutation after first publish:** The DB already has a partial unique index on slug WHERE slug IS NOT NULL. The publish endpoint must check if slug already exists before generating a new one.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accordion collapse/expand | Custom div toggle with state | shadcn accordion (base-nova) | Handles ARIA, keyboard nav, animation, multi-section coordination |
| Form validation | Manual if/else checks | zod + react-hook-form + @hookform/resolvers | Already installed, handles async validation, field-level errors |
| Vietnamese diacritics stripping | Custom regex | `String.normalize('NFD').replace(/[\u0300-\u036f]/g, '')` | Standard Unicode normalization handles all Vietnamese characters |
| Debounce implementation | lodash.debounce import | Custom useRef+setTimeout (10 lines) | Avoids adding lodash dependency for one function |
| Confetti animation | Custom canvas particles | canvas-confetti library | Battle-tested, 6KB, handles cleanup/performance automatically |
| Phone mockup frame | SVG device frames | Pure CSS with Tailwind (rounded corners, shadow, notch) | No dependency needed, pure CSS is lighter and more customizable |
| DTO partial validation | TypeScript Partial<T> | @nestjs/mapped-types PartialType | TS Partial is compile-time only; PartialType preserves class-validator decorators at runtime |

**Key insight:** The most complex hand-roll temptation is building a custom debounce + save status system. Keep it simple: useRef for timer, useState for status, useCallback for the save function. No library needed, but the pattern must handle component unmount cleanup.

## Common Pitfalls

### Pitfall 1: SupabaseUserService Token Mismatch
**What goes wrong:** The existing `SupabaseUserService` extracts JWT from the `Authorization` header, but the frontend sends auth via httpOnly `auth-token` cookie. The Supabase client gets an empty/invalid token.
**Why it happens:** Phase 1 designed two auth patterns (Passport Bearer for auth module, cookie-based for common guard) but the user Supabase client only reads from Authorization header.
**How to avoid:** The existing CRUD endpoints work because they explicitly filter by `user_id` from `@CurrentUser()`. Continue this pattern for all Phase 3 endpoints -- always use `.eq('user_id', userId)` in queries. Consider adding a cookie-to-header bridge in a future refactor, but don't block on it now.
**Warning signs:** If a query returns data for wrong users or RLS errors appear in logs.

### Pitfall 2: Stale Closure in Debounce Callback
**What goes wrong:** The debounced save function captures stale form values from the closure when the component re-renders.
**Why it happens:** React closures capture values at render time. If debounce uses a value captured 800ms ago, it saves old data.
**How to avoid:** Store the latest data in a `useRef` that gets updated on every call, and read from the ref inside the setTimeout callback (not from the closure).
**Warning signs:** Saving shows old values; typing fast loses intermediate keystrokes.

### Pitfall 3: ValidationPipe Rejects PATCH Body
**What goes wrong:** The global `ValidationPipe` has `forbidNonWhitelisted: true`, which rejects unknown properties. A PATCH with only some fields might be rejected if the DTO isn't properly configured.
**Why it happens:** PartialType makes fields optional but the whitelist behavior depends on decorators being present on every field in the base class.
**How to avoid:** Ensure every field in the base DTO class has `class-validator` decorators. PartialType will add `@IsOptional()` automatically. Test the PATCH endpoint with partial payloads.
**Warning signs:** 400 Bad Request responses when saving subsets of fields.

### Pitfall 4: Slug Collision on Publish
**What goes wrong:** Two invitations with the same couple names generate identical slugs. The partial unique index throws a constraint violation.
**Why it happens:** The slug includes couple names + short random suffix. Short random suffixes have collision probability.
**How to avoid:** Wrap slug generation in a retry loop (max 3-5 attempts). If a unique constraint violation occurs, regenerate with a new random suffix. The 4-character base64url suffix has 16M+ combinations, so collisions are rare but possible.
**Warning signs:** 500 error on first publish for common names.

### Pitfall 5: Multiple Rapid Publishes
**What goes wrong:** User clicks publish multiple times quickly, generating multiple slugs or overwriting the permanent slug.
**Why it happens:** No idempotency check on the publish endpoint.
**How to avoid:** The publish endpoint must first check if `slug IS NOT NULL`. If already has a slug, just update status to 'published' without generating a new slug. Frontend should also disable the button after first click.
**Warning signs:** Slug changes after already being published.

### Pitfall 6: Template Component Hydration Mismatch
**What goes wrong:** Template components use date formatting or locale-specific rendering that differs between server and client.
**Why it happens:** Server renders with server locale, client hydrates with browser locale. Date formatting especially triggers this.
**How to avoid:** All template components should be 'use client' components (they're interactive preview components anyway). Use consistent date formatting with explicit locale ('vi-VN').
**Warning signs:** React hydration warnings in console, flickering content on page load.

### Pitfall 7: Editor Page Re-fetches Stale Data
**What goes wrong:** The editor page.tsx (server component) fetches invitation data, but auto-save updates aren't reflected when navigating away and back.
**Why it happens:** Next.js caches server component data. The auto-save writes to the API but the server fetch may return stale cached data.
**How to avoid:** Use `cache: 'no-store'` on the server fetch (like the dashboard page already does). The initial server fetch provides data hydration, then the client takes over with local state.
**Warning signs:** Navigating to dashboard and back to editor shows old values.

## Code Examples

### Phone Mockup Frame (Pure CSS + Tailwind)
```typescript
// EditorPreview.tsx
function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[320px] h-[640px]">
      {/* Phone frame */}
      <div className="absolute inset-0 rounded-[2.5rem] border-4 border-gray-800 bg-gray-800 shadow-xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
        {/* Screen content */}
        <div className="h-full pt-8 pb-4 overflow-y-auto bg-white rounded-[2rem]">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### Accordion Form Sections
```typescript
// EditorForm.tsx -- using shadcn accordion (base-nova style)
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

function EditorForm({ values, onChange }: EditorFormProps) {
  return (
    <Accordion type="multiple" defaultValue={['couple', 'ceremony', 'message']}>
      <AccordionItem value="couple">
        <AccordionTrigger>Cap doi (1/3)</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4 p-4">
            <div className="grid gap-2">
              <Label>Ten co dau</Label>
              <Input
                value={values.brideName}
                onChange={(e) => onChange({ brideName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Ten chu re</Label>
              <Input
                value={values.groomName}
                onChange={(e) => onChange({ groomName: e.target.value })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      {/* ... more sections */}
    </Accordion>
  )
}
```

### NestJS PATCH Endpoint
```typescript
// invitations.controller.ts additions
@Patch(':id')
update(
  @CurrentUser() user: JwtPayload,
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: UpdateInvitationDto,
) {
  return this.invitationsService.update(user.sub, id, dto)
}

@Post(':id/publish')
@HttpCode(HttpStatus.OK)
publish(
  @CurrentUser() user: JwtPayload,
  @Param('id', ParseUUIDPipe) id: string,
) {
  return this.invitationsService.publish(user.sub, id)
}

@Post(':id/unpublish')
@HttpCode(HttpStatus.OK)
unpublish(
  @CurrentUser() user: JwtPayload,
  @Param('id', ParseUUIDPipe) id: string,
) {
  return this.invitationsService.unpublish(user.sub, id)
}
```

### Save Status Indicator
```typescript
// SaveStatus.tsx -- subtle topbar indicator
const STATUS_MAP: Record<SaveStatus, { text: string; className: string }> = {
  idle: { text: '', className: '' },
  saving: { text: 'Dang luu...', className: 'text-gray-400' },
  saved: { text: 'Da luu', className: 'text-green-500' },
  error: { text: 'Loi luu', className: 'text-red-500' },
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  const { text, className } = STATUS_MAP[status]
  if (!text) return null
  return <span className={cn('text-xs transition-opacity', className)}>{text}</span>
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Save button with explicit form submission | Debounced auto-save with status indicator | Mainstream 2023+ | No save button = less friction, but needs careful error handling |
| Radix UI accordion primitives | shadcn/ui base-nova (uses @base-ui/react) | shadcn v4, 2025 | Project already uses base-nova; accordion follows same primitive layer |
| nanoid for ID generation | nanoid v5 (ESM-only) | nanoid v4, 2023 | CJS projects must use v3 or Node crypto; this project uses CJS |
| Rich text editors (Quill, TinyMCE) | Plain textarea + template formatting | Design decision | Simpler, more predictable; template controls presentation |

**Deprecated/outdated:**
- shortid: Deprecated, replaced by nanoid. Do not use.
- @nestjs/mapped-types separate package: Now bundled with @nestjs/common in NestJS 11+.

## Open Questions

1. **Sidebar collapse persistence**
   - What we know: SidebarProvider uses cookie (`sidebar_state`) to persist collapse state. Editor needs sidebar collapsed by default.
   - What's unclear: Whether to set cookie on editor mount or use a URL-based flag to override the default.
   - Recommendation: On editor page mount, programmatically call `setOpen(false)` via the `useSidebar()` hook. Let user manually re-expand. No cookie override needed.

2. **Editor page route structure**
   - What we know: Dashboard links to `/thep-cuoi/{id}`. The (app) layout includes sidebar + topbar.
   - What's unclear: Whether the editor should use the same (app) layout or a custom layout without the topbar header.
   - Recommendation: Use the (app) layout but override the topbar content for editor context (back button, save status, publish button). The existing TopBar is a client component that can be conditionally rendered based on route.

3. **canvas-confetti bundle size impact**
   - What we know: canvas-confetti is ~6KB gzipped. The project targets <1MB total (Phase 9 criterion).
   - What's unclear: Whether 6KB is acceptable given the overall budget.
   - Recommendation: Accept it. 6KB is negligible. The celebration moment is a key UX differentiator per user decisions. Can dynamically import it to avoid loading on initial page load.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x (API: node env, Web: jsdom env) |
| Config file (API) | `apps/api/vitest.config.ts` |
| Config file (Web) | `apps/web/vitest.config.ts` |
| Quick run command (API) | `cd apps/api && npx vitest run --reporter=verbose` |
| Quick run command (Web) | `cd apps/web && npx vitest run --reporter=verbose` |
| Full suite command | `cd apps/api && npx vitest run && cd ../../apps/web && npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-01 | Form fields render and accept input | unit (web) | `cd apps/web && npx vitest run __tests__/components/EditorForm.test.tsx -x` | No -- Wave 0 |
| EDIT-02 | Preview updates when form values change | unit (web) | `cd apps/web && npx vitest run __tests__/components/EditorPreview.test.tsx -x` | No -- Wave 0 |
| EDIT-03 | Auto-save calls PATCH after debounce | unit (web) | `cd apps/web && npx vitest run __tests__/hooks/useAutoSave.test.ts -x` | No -- Wave 0 |
| EDIT-03 | PATCH endpoint updates invitation fields | unit (api) | `cd apps/api && npx vitest run src/invitations/__tests__/invitations.service.spec.ts -x` | Partial -- needs update/publish methods |
| EDIT-08 | Template selector switches templateId | unit (web) | `cd apps/web && npx vitest run __tests__/components/TemplateSelector.test.tsx -x` | No -- Wave 0 |
| EDIT-08 | Template components render correct visual identity | unit (web) | `cd apps/web && npx vitest run __tests__/components/templates.test.tsx -x` | No -- Wave 0 |
| EDIT-09 | Full preview dialog renders complete invitation | unit (web) | `cd apps/web && npx vitest run __tests__/components/FullPreviewDialog.test.tsx -x` | No -- Wave 0 |
| EDIT-10 | Publish endpoint generates slug and updates status | unit (api) | `cd apps/api && npx vitest run src/invitations/__tests__/invitations.service.spec.ts -x` | Partial -- needs publish tests |
| EDIT-10 | Unpublish endpoint reverts status without changing slug | unit (api) | `cd apps/api && npx vitest run src/invitations/__tests__/invitations.service.spec.ts -x` | Partial -- needs unpublish tests |
| SYST-02 | Slug cannot change after first publish | unit (api) | `cd apps/api && npx vitest run src/invitations/__tests__/invitations.service.spec.ts -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** Quick run for changed app (`cd apps/api && npx vitest run` or `cd apps/web && npx vitest run`)
- **Per wave merge:** Full suite across both apps
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/web/__tests__/components/EditorForm.test.tsx` -- covers EDIT-01
- [ ] `apps/web/__tests__/components/EditorPreview.test.tsx` -- covers EDIT-02
- [ ] `apps/web/__tests__/hooks/useAutoSave.test.ts` -- covers EDIT-03 (frontend debounce)
- [ ] `apps/web/__tests__/components/TemplateSelector.test.tsx` -- covers EDIT-08
- [ ] `apps/web/__tests__/components/templates.test.tsx` -- covers EDIT-08 (render)
- [ ] `apps/web/__tests__/components/FullPreviewDialog.test.tsx` -- covers EDIT-09
- [ ] `apps/api/src/invitations/__tests__/invitations.service.spec.ts` -- needs: update, publish, unpublish, slug immutability tests (extends existing file)

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `packages/types/src/invitation.ts`, `apps/api/src/invitations/`, `apps/web/components/` -- all existing code patterns
- Codebase inspection: `supabase/migrations/001_foundation_schema.sql` -- DB schema with slug partial unique index
- Codebase inspection: `apps/api/tsconfig.json` -- confirms CommonJS module system (affects nanoid choice)
- Codebase inspection: `apps/web/components.json` -- confirms base-nova shadcn style
- Codebase inspection: `apps/api/src/main.ts` -- ValidationPipe config (whitelist, forbidNonWhitelisted)

### Secondary (MEDIUM confidence)
- [shadcn/ui accordion docs](https://ui.shadcn.com/docs/components/radix/accordion) -- accordion component API and installation
- [shadcn/ui textarea docs](https://ui.shadcn.com/docs/components/radix/textarea) -- textarea component
- [NestJS PartialType docs](https://docs.nestjs.com/techniques/validation) -- mapped-types for PATCH DTOs
- [nanoid GitHub](https://github.com/ai/nanoid) -- ESM-only since v4, CJS requires v3 or alternatives
- [canvas-confetti npm](https://www.npmjs.com/package/canvas-confetti) -- confetti animation library
- [Tailwind device mockups (Flowbite)](https://flowbite.com/docs/components/device-mockups/) -- CSS-only phone frame pattern

### Tertiary (LOW confidence)
- [React debounce patterns](https://www.developerway.com/posts/debouncing-in-react) -- useRef+setTimeout is widely recommended but exact patterns vary
- [react-hook-form auto-save discussion](https://github.com/orgs/react-hook-form/discussions/3078) -- community pattern, not official

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed or are standard shadcn additions
- Architecture: HIGH -- patterns follow existing codebase conventions directly
- Pitfalls: HIGH -- identified from actual codebase inspection (token mismatch, CJS/ESM, ValidationPipe config)
- Template design: MEDIUM -- visual identity locked by user, but CSS implementation details are discretionary
- Confetti implementation: MEDIUM -- canvas-confetti is well-established but integration with dialog lifecycle needs care

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable domain, no fast-moving dependencies)
