# Phase A Architecture Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish versioned architecture, registry, schema, and validation contracts without changing Hallmark runtime behavior.

**Architecture:** Keep one installable `skills/hallmark/` package. Add canonical registry data and schemas beside unchanged upstream references, then validate repository-critical invariants with dependency-free Node.js tooling.

**Tech Stack:** Markdown, JSON Schema Draft 2020-12 documents, JSON registries, Node.js built-ins, `node:test`, npm scripts.

## Global Constraints

- Do not modify `skills/hallmark/SKILL.md`.
- Do not modify or move `skills/hallmark/references/`.
- Do not modify `site/`.
- Do not change runtime routing or installation behavior.
- Keep the final branch green.
- Open one PR containing Phase A only.

---

### Task 1: Record the approved architecture

**Files:**
- Create: `docs/architecture/phase-a-specification.md`
- Create: `docs/architecture/repository-audit.md`
- Create: `docs/architecture/current-capability-map.md`
- Create: `docs/decisions/0001-registry-driven-single-package.md`
- Create: `docs/superpowers/plans/2026-07-23-phase-a-architecture-foundation.md`

**Interfaces:**
- Consumes: approved Phase A requirements
- Produces: authoritative scope, semantics, prohibitions, and acceptance criteria

- [ ] Verify the documents distinguish audit, review, critique, and slop test.
- [ ] Verify current capabilities are separated from future module locations.
- [ ] Run `git diff --check`.
- [ ] Commit with `docs: record phase a architecture foundation`.

### Task 2: Define vocabulary and schemas

**Files:**
- Create: `docs/architecture/metadata-vocabulary.md`
- Create: `skills/hallmark/schemas/*.schema.json`

**Interfaces:**
- Consumes: stable logical identifier and version semantics from Task 1
- Produces: nine versioned schema contracts

- [ ] Define identifier, lifecycle, ownership, dependency, applicability, and output vocabulary.
- [ ] Write schema documents for registry, module, principle, domain, profile, relation, decision trace, review report, and scoring rubric.
- [ ] Explicitly document partial Phase A validation coverage.
- [ ] Parse every schema with `JSON.parse`.
- [ ] Commit with `feat: define hallmark registry schemas`.

### Task 3: Register current repository truth

**Files:**
- Create: `skills/hallmark/registry/registry.json`
- Create: `skills/hallmark/registry/modules.json`
- Create: `skills/hallmark/registry/principles.json`
- Create: `skills/hallmark/registry/domains.json`
- Create: `skills/hallmark/registry/profiles.json`
- Create: `skills/hallmark/registry/relations.json`
- Create: `skills/hallmark/registry/scoring.json`

**Interfaces:**
- Consumes: schemas from Task 2
- Produces: registry manifest with `schemaVersion`, `registryVersion`, and explicit `publicInvocations`

- [ ] Register only build, audit, redesign, and study as public modules.
- [ ] Register only confirmed current knowledge and evaluation sources.
- [ ] Keep profiles empty and exclude proposed review.
- [ ] Parse all registry JSON.
- [ ] Commit with `feat: register current hallmark capabilities`.

### Task 4: Add registry validation using TDD

**Files:**
- Create: `tests/registry/*.test.mjs`
- Create: `tests/fixtures/invalid-registry/**`
- Create: `scripts/validation/validate-registry.mjs`
- Create: `scripts/validation/lib/*.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: registry files from Task 3
- Produces: reusable validators and `npm run validate:registry`

- [ ] Write failing tests for invalid IDs and semantic versions.
- [ ] Run tests and confirm expected failures.
- [ ] Implement identifier and version validation; rerun to green.
- [ ] Repeat red/green for unknown dependencies, cycles, unknown relations, missing paths, invocation coverage, and duplicate ownership.
- [ ] Run registry tests and validation.
- [ ] Commit with `test: validate hallmark registry integrity`.

### Task 5: Add documentation validation using TDD

**Files:**
- Create: `tests/docs/links.test.mjs`
- Create: `tests/docs/consistency.test.mjs`
- Create: `scripts/validation/validate-docs.mjs`
- Create: `scripts/validation/lib/markdown-links.mjs`
- Create: `scripts/validation/lib/repository.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: tracked Markdown and current canonical sources
- Produces: `npm run validate:docs`

- [ ] Write failing tests that expose current link and count drift.
- [ ] Run tests and confirm failures point to known drift.
- [ ] Implement minimal link and count validators.
- [ ] Correct baseline documentation in Task 6, then rerun to green.
- [ ] Commit with `test: detect hallmark documentation drift`.

### Task 6: Restore baseline and document operations

**Files:**
- Modify: `README.md`
- Modify: `docs/recipes.md`
- Modify: `docs/study-examples.md`
- Create: `docs/workflows/upstream-synchronization.md`
- Create: `docs/architecture/phase-b-proposal.md`

**Interfaces:**
- Consumes: diagnostics from Task 5
- Produces: green documentation baseline and approved Phase B boundary

- [ ] Correct 57/58 gate statements, recipe count, theme count, and broken links.
- [ ] Define fast-forward and PR-based upstream synchronization.
- [ ] Record proposed registry-driven router, internal modules, engines, profiles, domains, knowledge relations, and review semantics.
- [ ] Run all acceptance commands.
- [ ] Verify protected compatibility diffs are empty.
- [ ] Commit with `docs: establish validated phase a baseline`.
- [ ] Push the branch and open one PR.
