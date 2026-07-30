# ZENA Enterprise SaaS Design DNA

## Purpose

A calm, precise and information-dense design system for ZENA business applications: CRM, customers, quotations, contracts, projects, design delivery, construction, warranty, finance and reporting.

This preset is an explicit project preset. It must never become Hallmark's silent default for unrelated briefs.

## Design character

- Modern enterprise SaaS
- Minimal, data-driven workspace
- Professional and trustworthy
- Quiet rather than decorative
- Optimized for repeated daily use
- Comfortable with long Vietnamese labels and large monetary values

## Core principles

1. Data first, decoration second.
2. Establish hierarchy with spacing, typography, borders and surface contrast before shadows.
3. Use one restrained primary accent per screen; reserve semantic colors for meaning.
4. Prefer working surfaces such as tables, Kanban boards and timelines over card grids.
5. Keep important actions visible without letting them dominate the page.
6. Avoid nested cards when grouping, whitespace or dividers are sufficient.
7. Never invent metrics, customers, testimonials or project results.
8. Never pixel-clone Base.vn, HubSpot, Linear, Attio or any other product. Extract principles, not pixels.

## Application shell

- Fixed or sticky left navigation at desktop widths.
- Compact top command bar with search, notifications and account controls.
- Main content uses the available viewport rather than a marketing-site max-width.
- Desktop content padding: 24–32 px.
- Page title, supporting description and primary actions share a clear page-header region.
- Sticky table, Kanban or toolbar regions are allowed when they reduce repeated scrolling.
- The shell must degrade cleanly into a drawer or compact navigation on smaller widths.

## Density and rhythm

- Default UI text: 13–15 px.
- Metadata: 11–13 px.
- Typical controls: 36–42 px tall.
- Typical table rows: 44–52 px tall.
- Page sections use deliberate 16, 24 or 32 px spacing steps.
- Do not make all content spacious merely to appear premium; preserve operational density.

## Typography

- Use a neutral sans-serif UI family through `--zena-font-sans`.
- Use tabular numerals for money, quantities, dates and KPI values.
- Page title: 24–30 px, strong but not oversized.
- Section title: 16–18 px.
- No italic headings.
- Do not use marketing-style display typography inside authenticated application screens.

## Color behavior

- Primary blue represents ZENA actions and selected navigation.
- Green indicates success or completed commitments.
- Amber indicates attention, aging or warning.
- Red indicates destructive actions, blocking errors or overdue risk.
- Purple may distinguish consultation or design activity.
- Semantic colors belong mainly in chips, icons, narrow stage indicators and feedback—not saturated card backgrounds.
- Every state must remain understandable without relying on color alone.

## Surfaces

- App background is a soft neutral gray.
- Primary working surfaces are white.
- Prefer 1 px borders and subtle surface shifts.
- Use shadows sparingly and softly, mainly for temporary elevation such as menus, dialogs and dragged cards.
- Moderate radii only; avoid playful bubble geometry and pill-shaped everything.

## Data presentation

### Tables

- Tables are first-class workspaces.
- Keep stable identifying columns on the left.
- Align numbers and dates consistently.
- Use sticky headers when useful.
- Reveal bulk actions only after selection.
- Use subtle hover and unmistakable selected states.
- Empty states explain the next useful action.

### CRM pipeline

- Use horizontal stage columns with clear stage identity, opportunity count and total value.
- Stage color is a narrow indicator, never a full saturated column.
- Opportunity cards contain name, customer, value, owner and next-action or aging information.
- Support drag, keyboard focus, selected, loading, error and success feedback.
- Preserve enough contrast between the application background, columns and cards without stacking heavy shadows.

### Forms

- Put labels above controls.
- Group long forms by business meaning, not by wrapping every field in a card.
- Separate destructive actions from routine save actions.
- Show required, optional, read-only, disabled, validation and save states explicitly.

## Interaction

Every interactive component must implement:

- default
- hover
- focus-visible
- active
- disabled
- loading
- error
- success

Motion guidance:

- Micro-interactions: 120–180 ms.
- Panels and overlays: 180–240 ms.
- No bounce, elastic overshoot or decorative looping motion in operational screens.
- Respect `prefers-reduced-motion`.

## Responsive acceptance

Verify at 320 px, 375 px, 414 px and 768 px, plus the desktop widths used by the application.

- No page-level horizontal overflow.
- Kanban may use an intentional, labelled horizontal workspace when necessary.
- Tables must use responsive prioritization, a contained scroll region or an alternate compact representation.
- Clickable labels should not wrap into ambiguous two-line controls.
- Long Vietnamese text and large VND values must not break cards or headers.

## Accessibility

- Visible `:focus-visible` treatment is mandatory.
- Interactive targets should be at least 36 px in dense desktop UI and 44 px where touch is primary.
- Icons require accessible names when meaning is not supplied by adjacent text.
- Status must be conveyed by text or icon as well as color.
- Dialogs, dropdowns and drawers must manage focus correctly.

## Prohibited patterns

- Giant gradients
- Glassmorphism
- Neon glow
- Excessive shadows
- Decorative blobs
- Oversized authenticated-page heroes
- Random accent colors
- Pill-shaped every element
- Fake browser or device chrome
- Invented business metrics
- Pixel cloning external products
- Replacing working business behavior merely to achieve a visual redesign

## Hallmark handoff

When this preset is active:

1. Read this file, `tokens.css`, `components.md` and `layouts.md before proposing changes.
2. Inspect the host project's framework, tokens and shared components.
3. Map existing values onto ZENA tokens before creating new primitives.
4. Preserve routes, authorization, business logic, data flow and component ownership.
5. State exact files to create or modify before implementation; deletion requires explicit approval.
6. Implement one vertical slice before broad rollout.
7. Run Hallmark's critique, responsive and slop-test gates before completion.
