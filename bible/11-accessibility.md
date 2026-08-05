# Accessibility

Target: WCAG 2.1 AA across the public site and admin dashboard. This isn't just compliance — a parent booking on a phone with a cracked screen, glare, or using a screen reader is a real customer, and the brand's bright-but-professional positioning explicitly calls for contrast that works despite the bold palette.

## Checklist — public site

- [ ] Every text/background color pairing passes AA contrast (4.5:1 normal text, 3:1 large text/UI components) — verify each new brand color pairing, don't assume "bright" is automatically fine
- [ ] All images have descriptive alt text (not filenames, not "image1") — applies to product photos, category images, and decorative images (which get empty `alt=""` intentionally, not omitted)
- [ ] Semantic HTML heading structure — one H1 per page, no skipped levels
- [ ] All interactive elements reachable and operable via keyboard alone (tab order, visible focus states — don't remove focus outlines without replacing them with an equally visible alternative)
- [ ] Forms: every input has an associated `<label>` (already done correctly in `contact.tsx` via the `Field` component pattern — keep using it, don't regress to placeholder-only labels)
- [ ] Form errors are announced to screen readers (`aria-describedby`/`aria-invalid`, not just red text)
- [ ] Click-to-call phone links and date pickers are fully operable via keyboard and touch, not just mouse
- [ ] Accordion (FAQ), dialogs, dropdowns (nav menus) all have correct ARIA roles/states — shadcn/Radix primitives handle most of this correctly out of the box; don't override their built-in ARIA behavior with custom markup
- [ ] `prefers-reduced-motion` respected for any animation
- [ ] Sufficient tap target size (44x44px minimum) on mobile, especially nav and CTA buttons

## Checklist — booking flow specifically

- [ ] Calendar/date picker: unavailable dates are announced as unavailable to screen readers, not just visually greyed out
- [ ] Multi-step checkout: current step and progress communicated to assistive tech, not just visually
- [ ] Payment form errors (declined card, validation) are clear, specific, and announced — never a silent failure or a generic "something went wrong"
- [ ] Cart total changes are announced (e.g., `aria-live` region) when items are added/removed

## Checklist — admin dashboard

- Same baseline (keyboard operability, contrast, labels) applies even though this is an internal tool — staff accessibility needs don't disappear because it's not public-facing
- Data tables use real `<table>` semantics with proper headers, not styled `<div>` grids, so screen readers can navigate them

## Testing approach

- Automated: run axe (or equivalent) in CI against key pages — catches a meaningful chunk of issues automatically, not a substitute for manual testing
- Manual: keyboard-only pass through the full booking flow at least once per major release; screen reader spot-check (VoiceOver/NVDA) on homepage, product page, and checkout at minimum
- This was called out as a goal in the original site brief ("accessible color contrast despite the bright palette") but nothing in the current codebase indicates it's actually been verified — treat the existing site as unaudited, not compliant-by-default.
