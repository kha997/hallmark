# Phase A — Architecture Foundation Specification

Status: Approved  
Date: 2026-07-23

## Objective

Establish the architecture contracts for evolving Hallmark into a Design
Intelligence platform without changing its runtime behavior or disrupting its
upstream-compatible installation surface.

Phase A records the current repository truth, introduces versioned registries
and schemas, and adds dependency-free validation. It does not perform the
platform restructuring.

## Approved architecture

Hallmark remains exactly one installable package at `skills/hallmark/`.
Build, audit, redesign, study, and future review workflows are internal,
context-loadable modules rather than separately installable skills.

All distributable intelligence will remain inside `skills/hallmark/`.
The registry is the canonical source for discovery, routing metadata, entity
IDs, versions, paths, dependencies, applicability, capabilities, outputs,
relations, and scoring rubrics. Markdown owns professional design knowledge,
workflow guidance, rules, examples, and reasoning.

The runtime router will become registry-driven in Phase B. Phase A creates the
contract only; `SKILL.md` continues to provide the current runtime behavior.

Knowledge Graph v1 will be a set of typed, versioned declarative relations. It
will not require a graph database, RDF runtime, or infrastructure dependency.

## Capability semantics

- **Audit** evaluates an existing artifact requested by the user. It is
  read-only and returns evidence-backed findings and recommendations.
- **Review** is a proposed Phase B capability for evaluating an artifact being
  produced before completion or handoff. It is not a current public capability
  and is not registered in Phase A.
- **Critique** is an internal reasoning step used inside a workflow. It is not
  independently invoked and does not own a public module.
- **Slop test** is the final 58-gate validation mechanism. It evaluates
  gate-level conformance after an artifact is produced; it is not a synonym for
  audit, review, or critique.

The current six-axis pre-emit critique and the 58-gate slop test are registered
as confirmed evaluation mechanisms, not public invocation modules.

## Registry authority

The root registry manifest uses:

```json
{
  "schemaVersion": "1.0.0",
  "registryVersion": "1.0.0"
}
```

- `schemaVersion` changes when a registry data structure changes.
- `registryVersion` changes when registry content or a routing contract changes.
- Entity `version` changes when that registered entity's content changes.

Logical IDs are lowercase dot-separated namespaces with kebab-case within each
segment. IDs are independent of paths, remain stable when files move, and are
never reused after deprecation.

The current public invocation contract is declared explicitly:

```json
{
  "publicInvocations": ["build", "audit", "redesign", "study"]
}
```

Runtime capability ownership must not be inferred by parsing prose in
`SKILL.md`.

## Decision Engine v1 contract

Decision Engine v1 is specification-driven, not a new executable runtime. Its
schema covers input context, selected route, registry-driven decisions,
precedence, confidence, assumptions, ambiguity handling, decision trace, and
compatibility fallback.

Ambiguity policy:

- High confidence: proceed automatically.
- Medium confidence: choose the safest reasonable route and record the
  assumption.
- Low confidence with material consequences: ask one concise question.
- Low confidence with low consequences: choose a reversible default and record
  the assumption.

## Scoring Engine v1 contract

Deterministic scoring elements are category weights, formulas, thresholds,
severity levels, aggregation rules, report structure, and machine-checkable
rules. Professional visual judgments may remain agent-assessed.

Every scored category contains score, weight, evidence, confidence, applicable
rules, and affected locations. Score and confidence remain separate.

```text
overall = Σ(category score × category weight)
```

A category without sufficient evidence is `notScored`. Confidence never
multiplies or otherwise modifies the score.

## Phase A deliverables

1. Official repository audit.
2. Current capability map.
3. Architecture Decision Record for the approved architecture.
4. Metadata vocabulary and identifier conventions.
5. Initial schemas for registry, module, principle, domain, profile, relation,
   decision trace, review report, and scoring rubric.
6. Minimal registry data describing only confirmed current capabilities.
7. Registry integrity validation.
8. Documentation drift and internal-link validation.
9. Upstream synchronization workflow.
10. Updated Phase B proposal.

## Prohibitions

Phase A must not:

- modify runtime behavior;
- change `skills/hallmark/SKILL.md`;
- move, extract, deduplicate, or restructure existing references;
- introduce separately installable specialist packages;
- add proposed profiles such as Generic, ZENA, or HANU;
- add new production design-principle content;
- connect the showcase to registry data;
- redesign or otherwise modify the showcase;
- alter the installation contract;
- introduce a graph database or runtime dependency.

## Validation coverage

Schemas target JSON Schema Draft 2020-12 as portable documentation. Phase A
does not claim complete Draft 2020-12 validation.

The dependency-free validator checks repository-critical invariants:

- required top-level registry fields;
- supported schema and registry version shapes;
- entity field presence and primitive types used by this repository;
- identifier syntax and uniqueness;
- semantic version syntax;
- referenced paths;
- dependency resolution and cycles;
- relation endpoint resolution;
- public invocation ownership;
- canonical ownership uniqueness;
- registry-to-file and public-module coverage;
- Markdown internal links and declared repository counts.

Full JSON Schema vocabulary evaluation, remote `$ref` resolution, arbitrary
combinator evaluation, format vocabularies beyond the repository's semantic
versions, and generalized third-party schema validation are deferred.

## Acceptance criteria

The final branch must pass:

```bash
npm run validate
npm test
git diff --check
git status --short
```

Before opening the PR, the following compatibility diffs must also be checked:

```bash
git diff upstream/main -- skills/hallmark/SKILL.md
git diff upstream/main -- skills/hallmark/references
git diff upstream/main -- site
```

All three are expected to be empty. The PR may be opened only from a green
branch and must contain Phase A only.
