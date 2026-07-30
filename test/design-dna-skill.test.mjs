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

test('SKILL.md specifies error for explicit unknown DNA (not fallthrough)', () => {
  // User explicitly names an unregistered DNA → visible error
  const hasExplicitError = /explicit.*(?:not found|unregistered|not exist|not registered|no matching|error)/i.test(skillContent);
  assert.ok(hasExplicitError, 'SKILL.md must specify error for explicit unknown DNA request');
});

test('SKILL.md specifies configuration error for unknown DNA in project marker', () => {
  // Project design.md marker points to unregistered ID → configuration error
  const hasMarkerError = /marker.*(?:unregistered|not.*regist|configuration error|not found|no registered)/i.test(skillContent);
  assert.ok(hasMarkerError, 'SKILL.md must specify error for unknown DNA in project marker');
});

test('SKILL.md distinguishes fallthrough (no request) from error (bad request)', () => {
  // Three distinct behaviors: explicit error, marker error, silent fallthrough
  const hasFallthrough = /normal fallthrough|no DNA request|no marker/i.test(skillContent);
  const hasExplicitErr = /explicit.*request.*(?:not found|no registered|error)/i.test(skillContent);
  const hasMarkerErr = /marker.*(?:unregistered|not.*regist|configuration error)/i.test(skillContent);
  assert.ok(hasFallthrough && hasExplicitErr && hasMarkerErr,
    'SKILL.md must distinguish three cases: explicit unknown (error), marker unknown (config error), no request (fallthrough)');
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
