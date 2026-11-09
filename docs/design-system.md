# MASS SMS Design System

## Product direction

A calm, precise business messaging workspace for Mongolian SMEs. The interface prioritizes message composition, recipient validation, transparent pricing, and safe sending. It should feel like a mature financial/operations SaaS product rather than a promotional landing page.

## Visual principles

- Light neutral canvas with white work surfaces.
- Blue is reserved for primary actions, active navigation, and financial emphasis.
- Green communicates consent/safety or healthy system state; amber means setup or attention required.
- Avoid gradients, decorative illustrations, excessive shadows, and oversized rounded cards.
- Prioritize dense, scannable operational information and clear price disclosure.

## Foundations

### Color tokens

| Token | Value | Purpose |
|---|---|---|
| ink | #17243B | Main text |
| muted | #718097 | Secondary text |
| subtle | #9AA6B8 | Helper text |
| brand | #2563EB | Primary action and active state |
| brand-dark | #1D4ED8 | Hover state |
| brand-soft | #EFF5FF | Active and highlighted surfaces |
| border | #E7ECF3 | Dividers and component borders |
| surface | #FFFFFF | Panels |
| canvas | #F7F9FC | App background |
| success | #16845B | Valid/consent state |
| warning | #A66A13 | Pending setup and attention |

### Typography

- Primary family: DM Sans.
- Display and key figures: Manrope.
- Page title: 23–28px, 800 weight.
- Panel title: 13–15px, 800 weight.
- Body: 11–14px.
- Metadata: 8–10px.
- Use tabular alignment for financial figures where applicable.

### Spacing and shape

- Base spacing: 4px increments.
- Common gaps: 8, 12, 16, 20, 24, 32px.
- Small controls: 8px radius.
- Inputs and compact panels: 9–12px radius.
- Large work panels: 13–16px radius.
- Borders are preferred over strong shadows.

## Components

- Sidebar navigation with one clear active state.
- Workspace switcher and account profile.
- Metric cards with one primary value and a short explanatory label.
- Form fields with visible labels, helper text, validation, and keyboard focus.
- Recipient counters distinguish valid, invalid, and duplicate numbers with text and icons, not color alone.
- Pricing panel shows unit price, recipient count, parts per message, total parts, and total estimate.
- Consent notice is persistent and visually separate from validation errors.
- Primary action is disabled until the form is valid and backend readiness is established.
- Loading, error, empty, and success states must be designed before a feature is considered complete.

## Responsive behavior

- Desktop: persistent 252px sidebar, dashboard content with composer and pricing/status rail.
- Tablet: collapse sidebar and retain compact header.
- Mobile: one-column composer, stacked utility panels, full-width primary action.
- Verify at 320, 480, 700, 920, 1180, and 1440px.

## Accessibility

- Semantic landmarks and heading hierarchy.
- Every form field has a programmatic label.
- Keyboard-visible focus ring.
- Buttons and links must have clear accessible names.
- Status is expressed with text and icon as well as color.
- Honor prefers-reduced-motion.
- Keep normal text contrast at WCAG AA (4.5:1).

## Product trust rules

- Never show SMS or payment provider brands, API endpoints, API keys, or raw provider errors in customer-facing UI.
- Customer pricing must come from one shared server-owned pricing policy; the client-side estimate is display-only.
- Never claim a payment, delivery, database, or provider integration is healthy unless verified by backend health checks.
- The current dashboard composer is a preview until authentication, balance reservation, consent enforcement, payment verification, and provider dispatch are implemented end-to-end.
