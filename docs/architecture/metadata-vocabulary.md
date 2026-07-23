# Hallmark Metadata Vocabulary

## Authority boundary

Registry JSON owns discovery and routing metadata: IDs, versions, paths,
intents, dependencies, applicability, capabilities, output types, relations,
rubrics, and canonical ownership.

Markdown owns design knowledge, workflow guidance, rules, examples, and
professional reasoning. Markdown frontmatter must not duplicate registry-owned
routing metadata.

## Identifiers

Logical IDs:

- contain lowercase ASCII letters, digits, dots, and hyphens;
- use dots to separate namespace segments;
- use kebab-case inside a segment;
- begin and end each segment with a letter or digit;
- remain stable when a file moves;
- are never reused after deprecation.

Pattern:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$
```

Examples:

```text
module.build
principle.visual-hierarchy
domain.landing-page
profile.brand.generic
engine.decision
rubric.default
output.report.markdown
```

## Versions

Hallmark uses semantic versions without a leading `v`.

- `schemaVersion`: structure of a registry or schema-owned data document.
- `registryVersion`: content or routing contract of the registry as a whole.
- Entity `version`: content contract of one registered entity.
- Repository release version: distribution release recorded separately in
  package and release metadata.

Phase A accepts `MAJOR.MINOR.PATCH` with optional SemVer prerelease and build
metadata. It does not compare version precedence.

## Lifecycle status

- `confirmed`: capability or knowledge source exists in the audited baseline.
- `compatibility-placeholder`: an explicit bridge needed to preserve a current
  contract while implementation moves.
- `proposed`: approved direction that is not an existing capability.
- `deprecated`: retained for compatibility but no longer recommended.

The Phase A current-truth registry uses only `confirmed`.

## Entity kinds

- `module`: public or internal workflow capability.
- `principle`: canonical professional knowledge source.
- `domain`: an artifact or market context recognized by current Hallmark.
- `profile`: reusable context data such as a brand or industry.
- `evaluation`: critique or gate-based evaluation mechanism.
- `rubric`: versioned scoring categories and aggregation rules.

## Dependencies

`dependencies` contains logical entity IDs, not file paths. A dependency means
the source entity may load or requires the target entity's contract. Every
dependency must resolve, and the dependency graph must remain acyclic.

## Applicability

`appliesTo` contains registered domain IDs. An empty array means the entity is
cross-domain. Applicability guides later routing; it is not permission to ignore
universal accessibility or safety requirements.

## Intents and public invocations

The root manifest declares the stable invocation vocabulary:

```json
{
  "publicInvocations": ["build", "audit", "redesign", "study"]
}
```

Each public invocation has exactly one confirmed module owner. Runtime
capability discovery must not parse prose in `SKILL.md`.

## Capabilities and outputs

`capabilities` names stable behaviors provided by an entity. `outputs` uses
logical output IDs such as `output.report.markdown`. Output IDs need not map
one-to-one to files.

## Canonical ownership

`owns` contains stable ownership keys. Exactly one entity may own a given key.
Other entities may depend on or reference that owner, but may not redeclare the
key.

## Relations

A relation has a registered `from` ID, typed predicate, and registered `to` ID.
Phase A supports:

```text
uses
supports
constrains
evaluates
applies-to
compatible-with
conflicts-with
```

Relations provide Design Intelligence context. They do not execute behavior.

## Scoring fields

- `score`: assessed category result on the rubric's declared scale.
- `weight`: deterministic contribution to overall score.
- `confidence`: confidence in evidence quality, kept separate from score.
- `evidence`: observations supporting the assessment.
- `applicableRules`: rules used to reach the assessment.
- `locations`: affected regions or files.
- `notScored`: true when evidence is insufficient.

The overall formula is:

```text
overall = Σ(category score × category weight)
```

Confidence never modifies score.
