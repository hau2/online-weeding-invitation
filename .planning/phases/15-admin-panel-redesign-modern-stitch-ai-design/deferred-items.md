# Deferred Items - Phase 15

## Pre-existing Test Failures (Out of Scope)

These test failures exist from before Phase 15 and are not caused by admin panel restyling:

1. **InvitationCard.test.tsx** (4 failures) - Tests reference old StatusBadge text rendering and copy-link button structure that changed in Phase 13/14 dashboard redesign. Tests not updated to match new component structure.

2. **CreateWizard.test.tsx** (3 failures) - Tests reference old wizard step UI that was restyled in Phase 14 (Stitch AI design). Tests not updated to match new component structure.

**Recommendation:** Update test selectors and assertions in a future maintenance pass to match the Phase 13/14 component changes.
