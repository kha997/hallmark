# ZENA Enterprise SaaS Design DNA

## Goal

Add a portable, project-scoped enterprise SaaS design preset to Hallmark for ZENA business applications, beginning with CRM pipeline screens.

## Architecture

The preset is documentation-first and token-driven. It lives under `skills/hallmark/presets/zena-enterprise-saas/` so it is included in the published skill package, while `SKILL.md` gains a narrow routing rule that activates the preset only when explicitly named or when a ZENA project contains the canonical design files.

## Deliverables

- `design.md`: design intent, hierarchy, layout, density, interaction, accessibility and anti-pattern rules.
- `tokens.css`: canonical color, typography, spacing, radius, shadow, sizing and motion tokens.
- `components.md`: behavior and anatomy for app shell, controls, cards, tables, Kanban, filters, forms and states.
- `layouts.md`: responsive compositions for app shell, dashboard, pipeline, table workspace and record detail.
- `SKILL.md` routing rule: explicit, non-default ZENA preset activation without affecting Hallmark catalog diversification.
- Validation test: assert the preset files exist, contain required sections and use named tokens instead of ad-hoc visual values.

## Constraints

- Preserve existing Hallmark themes and default behavior.
- Do not pixel-clone Base.vn or any other product.
- Do not invent business metrics or ZENA production data.
- All visual values consumed by generated UI must flow through named tokens.
- Interactive components must cover default, hover, focus-visible, active, disabled, loading, error and success.
- Responsive acceptance widths: 320, 375, 414 and 768 px, plus desktop application widths.
- No production file deletion.

## Verification

Run:

```bash
npm test
npm run validate
```

The new structural test must pass alongside the existing suite, and registry/docs validation must remain green.
