# Hallmark Repository Audit

Date: 2026-07-23  
Audited baseline: `aeb42fb354ff4efa36ab475773a082315a3af2ce`

## Audit boundary

This audit describes the upstream repository before platform restructuring.
Confirmed behavior is separated from proposed architecture. No files were
deleted, moved, or reclassified as legacy during the audit.

## Repository map

The audited repository contains 283 tracked files: 106 under `skills/`, 149
under `site/`, 21 under `docs/`, and seven root project files.

### Root project files

- `README.md` describes Hallmark, its four current invocations, examples, and
  installation.
- `ROADMAP.md` records upstream ideas including brand-first flow, theme-aware
  motion, variants, analytics charts, multi-page coherence, and live preview.
- `package.json` defines version 1.1.0, publishes `skills`, identifies
  `skills/hallmark/SKILL.md` as the skill entry, and provides only a static
  showcase server command.
- `vercel.json` deploys `site/` as a static application.
- `LICENSE` is MIT.
- `.gitignore` excludes runtime state, agent configuration, dependencies, and
  scratch showcase artifacts.

### Current skill

`skills/hallmark/SKILL.md` is a 558-line router and workflow document. It owns
the current public build, audit, redesign, and study behavior; preflight
inspection; component/page scope selection; genre and theme routing;
macrostructure selection; project memory; output rules; pre-emit critique; and
the final slop-test handoff.

`skills/hallmark/references/` contains 105 Markdown files and approximately
9,033 lines. Major groups are:

- anti-patterns and the 58-gate slop test;
- typography, color, layout, responsive, motion, microinteraction, and state
  rules;
- 21 macrostructure files and their index;
- 50 component archetype files and their index;
- genre, theme, imagery, asset, copy, export, and design-system guidance;
- audit, redesign, and study workflow references;
- handoff and output contracts.

### Showcase and validation layer

`site/` is a static presentation and manual-validation surface:

- `site/index.html`, `site/js/main.js`, and `site/css/` implement the live theme
  showcase;
- `site/examples/` contains public worked examples;
- `site/_tests/` contains 71 tracked manual fixtures, screenshots, and verb
  examples.

The showcase currently duplicates theme names, genre mappings, counts, copy
fixtures, and design tokens. It is maintained but is not the canonical source
for future platform intelligence.

### Documentation

- `docs/recipes.md` contains worked build prompts.
- `docs/study-examples.md` contains worked study reports.
- `docs/talk-slides.md` is presentation material.
- `docs/screenshots/` contains README and showcase assets.

## Confirmed compatibility surfaces

The following current contracts must be preserved:

- installable entry at `skills/hallmark/SKILL.md`;
- skill name `hallmark`;
- `package.json` publishing `skills`;
- public invocations build, audit, redesign, and study;
- existing relative reference paths;
- `.hallmark/preflight.json` and `.hallmark/log.json`;
- `design.md` or `DESIGN.md`, `tokens.css`, and existing output stamps;
- the static `site/` deployment contract.

## Confirmed quality gaps

- No automated test or validation command exists.
- Existing `site/_tests/` assets are manual fixtures, not an executable suite.
- README/showcase material still contains 57-gate claims while the current
  canonical slop test contains 58 gates.
- Recipe count and theme-count prose has drifted.
- Tracked Markdown contains broken or incorrectly resolved relative links.
- Only four of the 20 current themes have dedicated files under
  `references/themes/`; other theme knowledge is distributed.
- The showcase duplicates knowledge currently embedded in the skill.
- `SKILL.md` combines routing, knowledge, workflow, and compatibility policy,
  increasing context cost and future merge risk.

## Disposition

### Keep unchanged in Phase A

- `skills/hallmark/SKILL.md`;
- all existing `skills/hallmark/references/`;
- `site/` and its deployment configuration;
- installation, invocation, state-file, and output contracts.

### Modify in Phase A

- architecture and workflow documentation;
- documentation statements with confirmed drift;
- `package.json` scripts for dependency-free validation;
- additive registry, schemas, validators, and tests.

### Proposed after Phase A

- registry-driven runtime routing;
- internal module extraction;
- shared-core extraction;
- Decision and Scoring Engine implementation;
- profiles, expanded domains, typed knowledge relations, and review workflow;
- showcase consumption of canonical registry data.

No current component is deprecated by this audit.
