# Phase B Proposal — Intelligence Foundation

Status: Proposed, not implemented

## Goal

Make the existing Hallmark entry point consume canonical registry data while
preserving all public invocation, installation, state-file, output, and
showcase contracts.

## Capability semantics

- **Audit** evaluates an existing artifact at the user's request and remains
  read-only.
- **Review** will evaluate an artifact being produced before completion or
  handoff. It may become an internal context-loadable module only after its
  invocation and fallback contract is approved.
- **Critique** remains an internal workflow step and does not become a public
  module.
- **Slop test** remains the final 58-gate validation mechanism and is not
  treated as audit or review.

Phase B must not register `module.review` until a dedicated decision records
its ownership, routing, output, and compatibility semantics.

## Proposed sequence

1. Add registry loading to the stable `hallmark` router with compatibility
   fallback to the current behavior.
2. Specify Decision Engine precedence, confidence bands, ambiguity policy, and
   trace output against current invocations.
3. Specify Scoring Engine aggregation without assigning invented weights to
   current upstream critique axes.
4. Establish canonical shared-core ownership and compatibility bridges.
5. Extract build, audit, redesign, and study into internal context-loadable
   modules one at a time.
6. Add review only after its separate capability contract is approved.

## Proposed future package layout

```text
skills/hallmark/
├── SKILL.md
├── registry/
├── schemas/
├── core/
│   ├── design-principles/
│   ├── anti-ai-slop/
│   ├── heuristics/
│   ├── evaluation/
│   └── engines/
├── modules/
│   ├── build/
│   ├── audit/
│   ├── redesign/
│   ├── study/
│   └── review/
├── profiles/
│   ├── brands/
│   ├── industries/
│   ├── personas/
│   └── design-systems/
├── domains/
└── references/
```

This tree is proposed. In Phase A, only registry and schema paths exist; the
current references and runtime router remain unchanged.

## Decision Engine proposal

The router will read the registry manifest directly and will not scan
directories. Decisions will record input signals, selected module and domain,
loaded entity IDs, confidence, assumptions, questions where required, and
compatibility fallback.

## Scoring Engine proposal

The engine will make weights, formulas, thresholds, severity, aggregation, and
report structure deterministic. Agent-assessed visual judgments will require
evidence and confidence. Insufficient evidence produces `notScored`, and
confidence never changes the numeric score.

## Deferred work

- New psychology/design-principle content.
- Generic, ZENA, and HANU profiles.
- CRM, ERP, finance, healthcare, and other expanded domains.
- Typed knowledge relations beyond confirmed current entities.
- Showcase registry integration.
- Any graph database, executable decision runtime, or new infrastructure
  dependency.
