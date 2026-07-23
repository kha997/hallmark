# ADR 0001: Registry-Driven Single-Package Architecture

Date: 2026-07-23  
Status: Accepted

## Context

Hallmark currently ships as one agent skill with a large entry document and a
selectively loaded reference library. It must grow into a reusable Design
Intelligence platform while preserving upstream synchronization and a simple
installation experience across Claude Code, Codex, OpenCode, Hermes, and future
agents.

Creating independently installable packages for every workflow would fragment
invocation, duplicate common knowledge, and create package-discovery pressure
for agents that manage hundreds of skills. Moving distributable intelligence
outside `skills/` would also break the current package publishing contract.

## Decision

Hallmark will retain exactly one installable package:
`skills/hallmark/`.

Build, audit, redesign, study, and future review capabilities will be internal,
context-loadable modules. A stable `hallmark` router will select modules and
knowledge through canonical registry data.

The registry owns discovery and routing metadata. Markdown owns professional
knowledge and workflow content. Runtime routing will not scan directories.
Filesystem scanning is limited to validation, CI, migration, and development
tooling.

All distributable core, module, profile, domain, schema, registry, and relation
content will remain under `skills/hallmark/`.

Knowledge relationships will use versioned typed data. No graph database or
runtime dependency is introduced.

## Consequences

### Positive

- Existing installation and invocation remain stable.
- Shared rules can have one canonical owner.
- Agent context can be loaded selectively without additional installed skills.
- Registry IDs remain stable as files move.
- Upstream content can remain unchanged while additive platform foundations
  are introduced.

### Costs

- Registry and file content can drift unless validated.
- Phase A temporarily has registry contracts alongside the existing
  `SKILL.md` router.
- Later extraction requires compatibility bridges and explicit migrations.

## Rejected alternatives

### Multiple installable workflow packages

Rejected for the current stage because it creates package explosion and a
fragmented public experience.

### Top-level distributable core

Rejected because the current package publishes only `skills/`.

### Runtime filesystem discovery

Rejected because it is expensive, agent-dependent, and makes routing behavior
implicit.

### Graph database or RDF runtime

Rejected as unnecessary infrastructure for the initial typed relationship
model.
