# Current Capability Map

This map separates confirmed Hallmark behavior from proposed module locations.
Future locations are planning targets, not claims about current implementation.

| Capability | Semantics | Current implementation | Phase A registry entity | Current canonical source | Proposed future location | Compatibility constraints |
| --- | --- | --- | --- | --- | --- | --- |
| Build | Default public invocation for producing a page or component | `skills/hallmark/SKILL.md` default Design flow | `module.build` | `SKILL.md` plus selectively loaded references | `skills/hallmark/modules/build/` | Default invocation, preflight, state files, stamps, tokens, and existing fallbacks remain compatible |
| Audit | Read-only evaluation of an existing artifact | `skills/hallmark/SKILL.md` and `references/verbs/audit.md` | `module.audit` | `references/verbs/audit.md`, `anti-patterns.md`, and `slop-test.md` | `skills/hallmark/modules/audit/` | `hallmark audit <target>` remains read-only and preserves report expectations |
| Redesign | Visual and interaction redesign within existing implementation boundaries | `skills/hallmark/SKILL.md` and `references/verbs/redesign.md` | `module.redesign` | `references/verbs/redesign.md` | `skills/hallmark/modules/redesign/` | `hallmark redesign` preserves routes, ownership, intent, brand, IA, and deletion safety |
| Study | Extract design DNA from image or URL without copying pixels | `skills/hallmark/SKILL.md` and `references/study.md` | `module.study` | `references/study.md` | `skills/hallmark/modules/study/` | `hallmark study` source detection, refusal rules, diagnosis, and optional `design.md` remain compatible |
| Pre-emit critique | Internal six-axis critique before handoff; not a public invocation | `SKILL.md` discipline and `references/slop-test.md` | `evaluation.pre-emit-critique` | `references/slop-test.md` | `skills/hallmark/core/evaluation/pre-emit-critique.md` | Six axes and revise-below-three behavior remain intact until separately versioned |
| Slop test | Final 58-gate validation after build; not audit, review, or critique | `SKILL.md` Step 7 and `references/slop-test.md` | `evaluation.slop-test` | `references/slop-test.md` | `skills/hallmark/core/evaluation/slop-test.md` | Gate count, genre overrides, final-gate timing, and every-answer-must-be-no contract remain intact |

## Semantic boundaries

### Audit

Audit starts with an artifact that already exists and a user request to
evaluate it. It produces evidence-backed findings without editing.

### Review

Review is proposed for Phase B. It evaluates an artifact being produced before
completion or handoff. It is not a current public invocation and is not
registered as a Phase A module.

### Critique

Critique is an internal workflow step. The current pre-emit critique uses six
axes to trigger revision but is not independently invoked.

### Slop test

The slop test is the final gate-based mechanism. It validates conformance after
production and does not replace broader audit or review reasoning.
