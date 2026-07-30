# ZENA Enterprise SaaS Components

## Shared contract

All components consume values from `tokens.css`. Do not inline colors, font families, shadows or radii in production components. Reuse host-project primitives when they already satisfy this contract.

Every interactive component must expose and visually distinguish these states: default, hover, focus-visible, active, disabled, loading, error and success.

## Application shell

### Sidebar

- Desktop width uses `--zena-sidebar-width`.
- Brand area, grouped navigation and account/settings region have distinct rhythm.
- Active navigation uses primary-soft surface, primary text/icon and a clear non-color cue.
- Collapsed mode preserves tooltips and accessible names.
- Small screens use a focus-managed drawer rather than squeezing labels.

### Top bar

- Height uses `--zena-topbar-height`.
- Search or command access is central; alerts and account controls stay compact.
- Do not duplicate page-level primary actions in the top bar.

### Page header

- Contains title, optional description, view selector and scoped actions.
- Primary action is visually strongest; secondary actions use neutral buttons.
- Collapse into two rows before controls become cramped.

## Buttons

- Heights use the control tokens.
- Primary: one per local action group.
- Secondary: neutral surface and border.
- Ghost: navigation and low-emphasis actions only.
- Danger: destructive actions, normally after confirmation.
- Loading preserves button width and communicates progress textually.
- Focus-visible uses `--zena-color-focus` and must not rely on browser-default removal.

## Inputs, select and search

- Labels sit above controls; helper and error text sit below.
- Search inputs may include a leading icon and keyboard hint.
- Read-only and disabled are visually different.
- Error styling includes message and icon/text cue, not red border alone.
- Success is reserved for meaningful validation or save confirmation.

## Status badges

- Compact, semantic and text-bearing.
- Use soft semantic backgrounds with readable foregrounds.
- Avoid saturated full-card treatments.
- Status wording must be operational: `Cần xử lý`, `Đã gửi`, `Quá hạn`, `Đã ký`.

## KPI summary

- Use a restrained row or responsive grid near the workspace header.
- Each item contains label, value and optional verified comparison.
- Never invent comparison metrics.
- Prefer borders and spacing over individually elevated cards.

## CRM pipeline column

Anatomy:

1. narrow semantic stage indicator;
2. stage name;
3. opportunity count;
4. total stage value;
5. column actions;
6. card list;
7. explicit add-opportunity action.

Behavior:

- Column body may scroll independently on large screens.
- Drop targets become visible only during drag.
- Empty columns remain actionable.
- Horizontal movement is intentional and contained on narrow screens.

## Opportunity card

Required content:

- opportunity or project name;
- customer or organization;
- monetary value using tabular numerals;
- owner avatar/name;
- next action, age or due date;
- optional semantic warning/status.

Behavior:

- default: quiet white surface and hairline border;
- hover: subtle surface shift and affordance;
- focus-visible: strong focus ring;
- active/dragged: temporary elevation and clear origin placeholder;
- disabled: non-draggable and muted with explanation when relevant;
- loading: stable skeleton dimensions;
- error: inline recovery action;
- success: brief confirmation without permanent green flooding.

## Data table

- Sticky header when the containing workspace scrolls.
- Row height defaults to `--zena-table-row`.
- Identifiers left; numbers right; dates consistently aligned.
- Sorting state appears in icon and accessible label.
- Selected rows reveal a scoped bulk-action bar.
- Pagination communicates range, total and page size.
- On narrow screens, prioritize columns or use a contained table scroller.

## Filter bar

- Search, filters, grouping, sorting and view controls belong together.
- Active filters are visible and individually removable.
- A single `Xóa bộ lọc` action appears only when useful.
- Filter dialogs preserve keyboard focus and announce applied changes.

## Forms and record detail

- Group fields by business meaning.
- Use one primary save action per form region.
- Sticky save bars are allowed for long records but must not cover content.
- Record detail uses a stable identity header plus tabs or sections.
- Timeline entries distinguish note, call, email, meeting, file and status change.

## Dialog, drawer and dropdown

- Use dialog for decisions; drawer for supporting workflows; dropdown for short actions.
- Manage initial focus, Escape, focus return and backdrop behavior.
- Destructive confirmation names the affected record.
- Avoid stacking multiple overlays.

## Empty, loading and error states

- Empty: explain why the surface is empty and provide the next valid action.
- Loading: preserve final geometry and avoid page jumps.
- Error: state what failed, what remains safe and how to retry.
- Permission-restricted: explain missing access without exposing protected data.
