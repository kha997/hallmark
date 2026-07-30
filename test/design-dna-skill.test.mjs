import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const skillPath = resolve(repoRoot, 'skills/hallmark/SKILL.md');
const registryPath = resolve(repoRoot, 'skills/hallmark/design-dna/registry.json');

let skillContent;
let resolver;
let registry;

test.before(async () => {
  skillContent = await readFile(skillPath, 'utf8');
  registry = JSON.parse(await readFile(registryPath, 'utf8'));
  try {
    resolver = await import('../scripts/validation/lib/design-dna.mjs');
  } catch {}
});

// ─── SKILL.md ─────────────────────────────────────────────────

test('SKILL.md mentions generic Design DNA route (not hard-coded ZENA)', () => {
  // Must mention the concept of Design DNA in general terms
  const hasGenericDna = /[Dd]esign\s+DNA/i.test(skillContent);
  assert.ok(hasGenericDna, 'SKILL.md must mention Design DNA concept');

  // Must NOT hard-code ZENA in conditional routing blocks
  // Allow ZENA in examples and activation-order prose, which reference the registry.
  // Block only conditional/switch-like blocks that dispatch specifically on ZENA.
  const zenaMentions = (skillContent.match(/ZENA/g) || []).length;
  if (zenaMentions > 0) {
    // Check for actual conditional routing blocks mentioning ZENA
    // Look for block patterns: if/switch with ZENA, or ZENA-specific case labels
    // rather than vocabulary co-occurrence on the same line
    const lines = skillContent.split('\n');
    let i = 0;
    const routeBlockLine = (() => {
      for (const line of lines) {
        i++;
        if (line.includes('ZENA')) {
          // Check if this line starts a conditional or case block,
          // or if the surrounding lines (within 3) form a conditional structure
          const blockStart = Math.max(0, i - 4);
          const blockEnd = Math.min(lines.length, i + 3);
          const context = lines.slice(blockStart, blockEnd).join('\n');
          // A routing block: contains ZENA AND has structural routing keywords
          // in the same logical block (not just prose examples)
          if (/if\s*\(.*ZENA|ZENA.*\s*if\s*\(|case\s+['"]?ZENA|ZENA:/.test(context)) {
            return true;
          }
        }
      }
      return false;
    })();
    assert.equal(routeBlockLine, false, 'SKILL.md must not hard-code ZENA-only conditional routing logic');
  }
});

test('SKILL.md mentions activation priority for Design DNA', () => {
  // Must mention activation priority or ordering
  const hasPriority = /priority|activation|design dna route|dna is active/i.test(skillContent);
  assert.ok(hasPriority, 'SKILL.md must mention Design DNA activation or priority');
});

test('SKILL.md mentions project design.md marker for DNA detection', () => {
  const hasMarker = /hallmark_design_dna|marker|design\.md.*DNA/i.test(skillContent);
  assert.ok(hasMarker, 'SKILL.md must mention project design.md marker for DNA detection');
});

// ─── Finding 1: Unknown DNA — no fallback ──────────────────────

test('F1: explicit unknown DNA does NOT say "Falling back" or "continue to Step 1"', () => {
  // The explicit-unknown section must NOT contain fallback language.
  // Split by "Explicit user request" and check the following paragraph.
  const sections = skillContent.split(/\*\*Explicit user request\*\*/);
  if (sections.length < 2) {
    // If section not found, test will fail below
    assert.ok(false, 'Cannot find "Explicit user request" section');
    return;
  }
  // Extract ~15 lines after "Explicit user request"
  const afterExplicit = sections[1].split('\n').slice(0, 15).join('\n');
  const hasFallback = /fall(?:ing\s*back|back)|continue\s*to\s*Step\s*1/i.test(afterExplicit);
  assert.equal(hasFallback, false,
    'Explicit unknown DNA must not say "Falling back" or "continue to Step 1"');
});

test('F1: explicit unknown DNA says "stop" or "halt" dispatch', () => {
  const sections = skillContent.split(/\*\*Explicit user request\*\*/);
  if (sections.length < 2) {
    assert.ok(false, 'Cannot find "Explicit user request" section');
    return;
  }
  // There are 2 occurrences: first in "If a Design DNA is found" (activation flow),
  // second in "If no Design DNA is found" (error handling). Use the last one.
  const afterExplicit = sections[sections.length - 1].split('\n').slice(0, 15).join('\n');
  const hasStop = /stop|halt|dispatch\s*stopped|do\s*not\s*continue/i.test(afterExplicit);
  assert.ok(hasStop,
    'Explicit unknown DNA must stop dispatch, not fall through');
});

test('F1: explicit unknown DNA requires user to pick or continue', () => {
  const sections = skillContent.split(/\*\*Explicit user request\*\*/);
  if (sections.length < 2) {
    assert.ok(false, 'Cannot find "Explicit user request" section');
    return;
  }
  const afterExplicit = sections[1].split('\n').slice(0, 15).join('\n');
  const hasChoice = /(?:select|choose|pick).*(?:DNA|registered)|explicitly\s*continue/i.test(afterExplicit);
  assert.ok(hasChoice,
    'Explicit unknown DNA must require user to select a valid DNA or explicitly continue without');
});

test('F1: unknown marker DNA does NOT say "Falling back" or "continue to Step 1"', () => {
  const sections = skillContent.split(/\*\*Project marker pointing to unregistered DNA\*\*/);
  if (sections.length < 2) {
    // Try alternate heading
    const sections2 = skillContent.split(/Project marker.*unregistered/i);
    if (sections2.length < 2) {
      assert.ok(false, 'Cannot find "Project marker pointing to unregistered DNA" section');
      return;
    }
    // Stop before the Safety section which innocuously says "fallback"
    const beforeSafety = sections2[1].split(/\*\*Safety:\*\*/)[0];
    const afterMarker = beforeSafety.split('\n').slice(0, 15).join('\n');
    const hasFallback = /fall(?:ing\s*back|back)|continue\s*to\s*Step\s*1/i.test(afterMarker);
    assert.equal(hasFallback, false,
      'Unknown marker must not say "Falling back" or "continue to Step 1"');
    return;
  }
  // Stop before the Safety section which innocuously says "fallback"
  const beforeSafety = sections[1].split(/\*\*Safety:\*\*/)[0];
  const afterMarker = beforeSafety.split('\n').slice(0, 15).join('\n');
  const hasFallback = /fall(?:ing\s*back|back)|continue\s*to\s*Step\s*1/i.test(afterMarker);
  assert.equal(hasFallback, false,
    'Unknown marker must not say "Falling back" or "continue to Step 1"');
});

test('F1: unknown marker DNA says "stop" dispatch until corrected', () => {
  // Find the marker section — try both heading forms
  let afterMarker;
  let sections = skillContent.split(/\*\*Project marker pointing to unregistered DNA\*\*/);
  if (sections.length >= 2) {
    afterMarker = sections[1].split('\n').slice(0, 15).join('\n');
  } else {
    sections = skillContent.split(/Project marker.*unregistered/i);
    if (sections.length >= 2) {
      afterMarker = sections[1].split('\n').slice(0, 15).join('\n');
    } else {
      assert.ok(false, 'Cannot find unknown marker section');
      return;
    }
  }
  const hasStop = /stop|halt|dispatch\s*stopped|until.*(?:correct|remov)/i.test(afterMarker);
  assert.ok(hasStop,
    'Unknown marker must stop dispatch until corrected or removed');
});

test('F1: no silent fallthrough to themes after unknown DNA (safety rule)', () => {
  // The safety section must explicitly prevent silent fallback
  const hasNoSilentFallback = /unknown.*unregistered.*DNA.*identifier.*must.*(?:not.*fallback|error.*not.*fallback|not.*silent)/i
    .test(skillContent);
  assert.ok(hasNoSilentFallback,
    'Safety section must forbid silent fallback for unknown DNA identifier');
});

test('F1: unknown DNA does not guess or create DNA on the fly', () => {
  // Must say "do not guess" somewhere in the DNA check section
  const checkSection = skillContent.split(/### 0\.5\. Design DNA check/);
  if (checkSection.length < 2) {
    assert.ok(false, 'Cannot find Step 0.5 section');
    return;
  }
  const step0_5 = checkSection[1].split(/### 1\./)[0]; // until Step 1
  const hasNoGuess = /do\s*not\s*guess|don('t|not)\s*guess/i.test(step0_5);
  assert.ok(hasNoGuess,
    'Step 0.5 must instruct not to guess a DNA');
});

// ─── Finding 2: Plain design.md routing ────────────────────────

test('F2: plain design.md is the locked local design system above studied/custom/catalog', () => {
  // The activation order section lists plain design.md at position 3
  const orderSection = skillContent.split(/The activation order is:/);
  if (orderSection.length < 2) {
    assert.ok(false, 'Cannot find activation order section');
    return;
  }
  const order = orderSection[1].split(/---/)[0]; // until next HR
  const lines = order.split('\n').filter(l => /^\d+\./.test(l));
  // Line 3 should be about plain project design.md
  const line3 = lines[2] || '';
  assert.match(line3, /project.*design\.md.*locked|project.*design\.md.*existing/i,
    'Position 3 must describe plain design.md as locked/existing design system');
  // Lines 4+ should be studied/custom/catalog
  const line4 = lines[3] || '';
  const line5 = lines[4] || '';
  const line6 = lines[5] || '';
  assert.match(line4, /studied|custom/i, 'Position 4 should be studied or custom');
  assert.match(line6, /catalog/i, 'Position 6 should be catalog');
});

test('F2: plain design.md project skips Step 1 and goes to Step 2 (no fallthrough)', () => {
  // The "no DNA request and no marker" section — find the subsection for "project has plain design.md"
  // Look for the no-request case(s) in Step 0.5
  const step0_5section = skillContent.split(/### 0\.5\. Design DNA check/);
  if (step0_5section.length < 2) {
    assert.ok(false, 'Cannot find Step 0.5 section');
    return;
  }
  const step0_5body = step0_5section[1].split(/### 1\./)[0];

  // Must distinguish project-has-design.md from project-lacks-design.md
  const hasDesignMdBranch = /\*\*Project has plain `design\.md`\*\*/.test(step0_5body);
  const hasNoDesignMdBranch = /\*\*Project has no `design\.md`\*\*/.test(step0_5body);
  assert.ok(hasDesignMdBranch && hasNoDesignMdBranch,
    'Step 0.5 must branch on whether a plain design.md exists');

  // Isolate the "No DNA request and no marker" section first, then find the plain design.md bullet
  const noDnaParts = step0_5body.split(/- \*\*No DNA request and no marker\*\*/);
  if (noDnaParts.length < 2) {
    assert.ok(false, 'Cannot find "No DNA request and no marker" section');
    return;
  }
  const plainMdParts = noDnaParts[1].split(/\*\*Project has plain `design\.md`\*\*/);
  const plainMdText = (plainMdParts[1] || '').split(/\n\s*\n/)[0].toLowerCase();
  const skipsStep1 = /skip.*step 1|proceed.*step 2|go.*step 2/i.test(plainMdText);
  assert.ok(skipsStep1,
    'Plain design.md branch must skip Step 1 and go to Step 2');
});

test('F2: plain design.md does NOT fall through to studied/custom/catalog', () => {
  // The plain design.md branch must not mention falling through to themes
  const step0_5section = skillContent.split(/### 0\.5\. Design DNA check/);
  if (step0_5section.length < 2) {
    assert.ok(false, 'Cannot find Step 0.5 section');
    return;
  }
  const step0_5body = step0_5section[1].split(/### 1\./)[0];
  const designMdParts = step0_5body.split(/(?:project has|project already has|existing project|found).*design\.md/i);
  if (designMdParts.length < 2) {
    assert.ok(false, 'Cannot find plain design.md subsection');
    return;
  }
  const afterDesignMd = designMdParts[1].split(/\n\n/)[0] || '';
  // Must NOT say "fall through" or "continue to Step 1" or "normal flow"
  const hasNormalFlow = /fall\s*through|continue\s*to\s*Step\s*1|normal\s*flow/i.test(afterDesignMd);
  assert.equal(hasNormalFlow, false,
    'Plain design.md branch must not fall through to studied/custom/catalog');
});

test('F2: only project without design.md continues normal Hallmark flow', () => {
  const step0_5section = skillContent.split(/### 0\.5\. Design DNA check/);
  if (step0_5section.length < 2) {
    assert.ok(false, 'Cannot find Step 0.5 section');
    return;
  }
  const step0_5body = step0_5section[1].split(/### 1\./)[0];
  const noDesignMdParts = step0_5body.split(/(?:no design\.md|project has no|without design\.md|no project.*design\.md)/i);
  if (noDesignMdParts.length < 2) {
    assert.ok(false, 'Cannot find "no design.md" subsection');
    return;
  }
  const afterNoDesignMd = noDesignMdParts[1].split(/\n\n/)[0] || '';
  // Must say "continue" or "existing flow" or "normal"
  const hasContinue = /continue|normal.*flow|existing.*flow|fall\s*through/i.test(afterNoDesignMd);
  assert.ok(hasContinue,
    'No-design.md case must continue normal Hallmark flow');
});

test('SKILL.md has safety statement for Design DNA', () => {
  const hasSafety = /[Ss]afety|[Ss]afe|[Ss]ecurity|not executable|design.system.data/i.test(skillContent);
  assert.ok(hasSafety, 'SKILL.md must have safety statement for Design DNA');
});

test('SKILL.md describes Design DNA as data not executable instructions', () => {
  const isDataNotCode = /data.*(not|never).*execut|design.*system.*data|portable.*design/i.test(skillContent);
  assert.ok(isDataNotCode, 'SKILL.md must describe Design DNA as data, not executable instructions');
});

test('SKILL.md references the Design DNA registry', () => {
  const hasRegistryRef = /design.dna|registry|design-dna/i.test(skillContent);
  assert.ok(hasRegistryRef, 'SKILL.md must reference the Design DNA mechanism');
});

test('SKILL.md does not turn Design DNA into a theme-only feature', () => {
  // Must mention components, layouts, tokens — not just colors
  const hasMoreThanColor = /component|layout|token|interaction|responsive/i.test(skillContent);
  assert.ok(hasMoreThanColor, 'Design DNA must be more than just a theme/color');
});

// ─── Activation via resolver ───────────────────────────────────

test('Resolver resolves ZENA DNA by explicit identifier', () => {
  const zena = resolver.resolveDna('zena-enterprise-saas', registry);
  assert.ok(zena, 'must resolve zena-enterprise-saas by ID');
  assert.equal(zena.id, 'zena-enterprise-saas');

  const byName = resolver.resolveDnaByName('ZENA Enterprise SaaS', registry);
  assert.ok(byName, 'must resolve by full name');
  assert.equal(byName.id, 'zena-enterprise-saas');

  const byShort = resolver.resolveDnaByName('ZENA', registry);
  assert.ok(byShort, 'must resolve by short name ZENA');
  assert.equal(byShort.id, 'zena-enterprise-saas');

  const byDashed = resolver.resolveDnaByName('zena-enterprise-saas', registry);
  assert.ok(byDashed, 'must resolve by dashed ID');
  assert.equal(byDashed.id, 'zena-enterprise-saas');
});

test('Resolver resolves ZENA DNA by project design.md marker', () => {
  const content = '# Project\n\nhallmark_design_dna: zena-enterprise-saas\n\nMore content';
  const result = resolver.resolveDnaByMarker(content, registry);
  assert.ok(result, 'must resolve by marker');
  assert.equal(result.id, 'zena-enterprise-saas');
});

test('Resolver returns null for unknown DNA identifier', () => {
  const result = resolver.resolveDna('unknown-brand', registry);
  assert.equal(result, null, 'must return null for unknown ID');
});

test('Resolver returns null for unknown marker DNA', () => {
  const content = '# Project\nhallmark_design_dna: nonexistent-dna\n';
  const result = resolver.resolveDnaByMarker(content, registry);
  assert.equal(result, null, 'must return null when marker points to unregistered DNA');
});

test('Resolver returns null for unknown explicit name', () => {
  const result = resolver.resolveDnaByName('Unknown Brand DNA', registry);
  assert.equal(result, null, 'must return null for unknown name');
});
