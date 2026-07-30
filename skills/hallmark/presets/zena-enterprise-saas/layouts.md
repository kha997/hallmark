# ZENA Enterprise SaaS Layouts

## Layout selection rule

Use the layout that matches the work. Do not force every ZENA module into cards or reuse the CRM pipeline structure for unrelated tasks.

## 1. Application shell

Desktop:

```text
┌───────────────┬────────────────────────────────────────────┐
│ Sidebar       │ Top command bar                            │
│               ├────────────────────────────────────────────┤
│ grouped nav   │ Page header                                │
│               ├────────────────────────────────────────────┤
│               │ Working surface                            │
└───────────────┴────────────────────────────────────────────┘
```

- Sidebar is fixed or sticky.
- Main region owns vertical scrolling unless a contained workspace needs independent scrolling.
- Page actions remain scoped to the page header.

Tablet and mobile:

- Sidebar becomes a focus-managed drawer or compact rail.
- Page header stacks title/description above actions.
- Toolbars wrap by functional group rather than shrinking unreadably.

## 2. CRM pipeline workspace

Recommended composition:

1. page header with pipeline selector and primary action;
2. restrained KPI summary;
3. filter/group/sort toolbar;
4. horizontal CRM pipeline board;
5. contained pagination or result summary when the data model requires it.

Desktop behavior:

- Board fills remaining viewport height.
- Columns have consistent minimum and maximum widths.
- Column lists scroll vertically without moving the page header.
- Dragged opportunity cards use temporary elevation and visible drop targets.

Responsive behavior:

- At 768 px, keep the board as an intentional horizontal workspace with clear edge affordances.
- At 414 px and below, show one primary stage at a time or use snap-scrolling columns.
- Never allow accidental page-level overflow from long project names or VND values.
- Filters move into a drawer; primary search and active-filter count remain visible.

## 3. Table workspace

Recommended for customers, contacts, quotations, contracts and records requiring comparison.

Composition:

1. page header;
2. compact KPI or status strip only when useful;
3. search/filter/view toolbar;
4. table surface;
5. bulk actions when selected;
6. pagination and result count.

Rules:

- Sticky table header.
- Stable identifier columns remain left.
- Use a contained horizontal scroller when column reduction is not safe.
- Avoid turning each row into a decorative card on desktop.

## 4. Record detail workspace

Recommended for customer, opportunity, contract and project detail.

Composition:

- identity header with status and primary actions;
- main information column;
- secondary context rail for ownership, dates, files or money;
- tabs or anchored sections for overview, activity, documents and history.

Responsive behavior:

- Secondary rail moves below primary content.
- Actions collapse into a labelled menu while the most important action remains visible.
- Long Vietnamese legal names wrap without pushing controls off-screen.

## 5. Dashboard

Composition:

- concise page header;
- verified KPI strip;
- one dominant chart or operational visualization;
- supporting exceptions, alerts or workload list;
- optional recent activity.

Rules:

- Do not use a bento grid merely as decoration.
- Every metric must answer a business question.
- Prefer one clear analytical story over many tiny charts.
- Never invent KPI comparisons.

## 6. Form workflow

Use for quotation creation, contract issuance and structured project setup.

- Simple forms use a single column with meaningful sections.
- Multi-step forms expose progress, saved state and validation ownership.
- Summary/confirmation appears before irreversible actions.
- Sticky action bars must respect safe-area and not obscure fields.

## 7. Timeline and activity

- Place the activity composer above the timeline when frequent updates are expected.
- Group by date without excessive containers.
- Event type, actor, time and outcome are scannable.
- Attachments and actions remain associated with the originating event.

## Responsive verification matrix

Verify each emitted application layout at:

- 320 px: no accidental horizontal page overflow; touch controls remain usable.
- 375 px: common phone layout; labels and currency values remain intact.
- 414 px: wide phone layout; drawers and stacked toolbars behave correctly.
- 768 px: tablet layout; navigation and data surfaces transition deliberately.
- 1280 px: laptop density and contained scrolling.
- 1440 px: desktop information density without excessive empty margins.

## Visual acceptance checklist

- The screen reads as enterprise software, not a marketing page.
- The primary task is obvious within five seconds.
- Borders, surfaces and spacing do most of the hierarchy work.
- There is no decorative gradient, glass effect or excessive shadow.
- Status colors are semantic and restrained.
- Long Vietnamese content and large VND values are tested.
- Loading, empty, error, success and permission-restricted states are represented.
- Keyboard focus is visible throughout.
