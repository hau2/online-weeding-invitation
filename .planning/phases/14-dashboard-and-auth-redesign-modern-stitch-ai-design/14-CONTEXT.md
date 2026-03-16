# Phase 14: Dashboard and Auth Redesign - Modern Stitch AI Design - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete the Stitch AI design system across all user-facing pages outside the editor and public invitation. Most dashboard and auth work was already done during Phase 13 CSS refinement. This phase covers: verifying existing work, styling the expired invitation page, styling the payment/upgrade page, and polishing any remaining dashboard screens (empty states, create wizard, invitation detail views).

</domain>

<decisions>
## Implementation Decisions

### Existing Work (Already Done in Phase 13)
- Dashboard layout: greeting, stats cards, invitation grid, sidebar — already Stitch-styled
- Auth pages: login/register with split layout, Stitch colors, social buttons — already done
- Sidebar: collapsible with Stitch styling, user dropdown with logout — already done
- Invitation cards: bigger buttons, 3-column grid, Stitch badges — already done
- These just need verification, not reimplementation

### Expired Page Styling
- Apply Stitch design system to ThankYouPage (the expired invitation view)
- Use same color palette: #ec1349 primary, #181113 text, #89616b secondary, #e6dbde borders
- Plus Jakarta Sans font
- Clean, warm thank-you message with couple names and first photo
- No specific Stitch screen — follow existing design system consistently

### Payment/Upgrade Page
- Apply Stitch design system to the upgrade/payment flow
- Use same color palette and component styles
- Clean card layout for plan comparison and payment instructions
- Admin bank QR display with Stitch-styled card
- No specific Stitch screen — follow existing design system consistently

### Dashboard Details
- Verify empty state matches Stitch
- Verify create invitation flow styling
- Polish any remaining screens not caught in Phase 13

### Claude's Discretion
- Exact layout of expired page sections
- Payment page plan comparison card design
- Empty state illustration/icon choice
- Create wizard step indicators styling

</decisions>

<specifics>
## Specific Ideas

- "Same Stitch system" — no need to fetch additional Stitch reference screens. Just apply the established palette consistently.
- Most work is already done from Phase 13. This phase is mainly verification + polishing the remaining pages.
- The expired page (ThankYouPage) currently uses getTheme() from Phase 9.1 — just needs CSS refinement to match Stitch.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Stitch color palette already established: #ec1349, #181113, #89616b, #e6dbde, #f4f0f1, #f8f6f6
- Plus Jakarta Sans font configured globally
- AppSidebar, InvitationCard, DashboardClient, StatusBadge all Stitch-styled
- Auth forms (login-form, register-form) already Stitch-styled
- getTheme() + ThemeConfig system for template-specific colors

### Established Patterns
- Stitch button: `bg-[#ec1349] hover:bg-red-600 text-white rounded-lg h-10 px-6 font-bold`
- Stitch input: `border-[#e6dbde] focus:border-[#ec1349] rounded-lg h-12`
- Stitch card: `bg-white rounded-xl border-[#e6dbde] shadow-sm`
- Stitch label: `text-xs font-semibold text-[#89616b]`

### Integration Points
- `apps/web/app/w/[slug]/ThankYouPage.tsx` — expired page
- `apps/web/app/(app)/thep-cuoi/[id]/UpgradeButton.tsx` or similar — payment flow
- `apps/web/components/app/EmptyState.tsx` — empty state
- `apps/web/app/(app)/dashboard/` — dashboard page

</code_context>

<deferred>
## Deferred Ideas

- Admin panel redesign — Phase 15
- Landing page — future phase

</deferred>

---

*Phase: 14-dashboard-and-auth-redesign-modern-stitch-ai-design*
*Context gathered: 2026-03-16*
