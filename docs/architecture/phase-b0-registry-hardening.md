# Phase B0 — Registry Contract Hardening

Status: Approved

## Purpose

Phase B0 closes three non-blocking validation observations recorded when Phase
A was merged. It does not start the Phase B router refactor.

## Contract

### Child registry schema compatibility

Every child registry referenced by `registry.json` must use the same
`schemaVersion` as the root manifest. Phase B0 uses exact equality and adds no
version-range or SemVer dependency.

An incompatible child produces:

```text
REGISTRY_SCHEMA_VERSION_MISMATCH
```

The diagnostic identifies the registry file, expected version, and actual
version.

### Confirmed public invocation ownership

Each existing public invocation (`build`, `audit`, `redesign`, and `study`) must
have exactly one public owning module, and that owner must have
`status: confirmed`.

Diagnostics distinguish:

```text
PUBLIC_INVOCATION_OWNER_MISSING
PUBLIC_INVOCATION_OWNER_DUPLICATE
PUBLIC_INVOCATION_OWNER_NOT_CONFIRMED
```

The invocation vocabulary remains unchanged.

### Package-contained paths

Registry-owned filesystem paths must be relative, portable, and resolve inside
`skills/hallmark/` after normalization. Validation rejects:

- absolute POSIX paths;
- Windows drive-letter paths;
- UNC paths;
- `file:` URLs;
- traversal outside the package;
- missing required targets.

Diagnostics are:

```text
REGISTRY_PATH_ABSOLUTE
REGISTRY_PATH_OUTSIDE_PACKAGE
REGISTRY_PATH_INVALID
REGISTRY_PATH_MISSING
```

Containment is determined from normalized absolute paths and `path.relative`,
not a string-prefix comparison. Validation never reads or trusts an entity path
outside the Hallmark package.

## Scope boundary

Phase B0 changes validation, regression fixtures, tests, and prerequisite
documentation only. It does not change runtime routing, `SKILL.md`, existing
references, registry content, profiles, domains, workflow modules, Decision or
Scoring Engine execution, or the showcase.

## Acceptance

```bash
npm run validate
npm test
git diff --check
npm pack --dry-run
```

The diffs for `skills/hallmark/SKILL.md`,
`skills/hallmark/references/`, and `site/` must remain empty.
