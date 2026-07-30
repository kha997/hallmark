import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const presetRoot = new URL('../skills/hallmark/presets/zena-enterprise-saas/', import.meta.url);

async function readPresetFile(name) {
  return readFile(new URL(name, presetRoot), 'utf8');
}

test('ZENA Enterprise SaaS preset ships the complete portable design DNA', async () => {
  const [design, tokens, components, layouts] = await Promise.all([
    readPresetFile('design.md'),
    readPresetFile('tokens.css'),
    readPresetFile('components.md'),
    readPresetFile('layouts.md'),
  ]);

  assert.match(design, /^# ZENA Enterprise SaaS Design DNA/m);
  assert.match(design, /Data first, decoration second\./);
  assert.match(design, /Never pixel-clone/i);
  assert.match(design, /320 px, 375 px, 414 px and 768 px/);

  assert.match(tokens, /--zena-color-primary:/);
  assert.match(tokens, /--zena-font-sans:/);
  assert.match(tokens, /--zena-sidebar-width:/);
  assert.doesNotMatch(tokens, /!important/);

  for (const state of ['default', 'hover', 'focus-visible', 'active', 'disabled', 'loading', 'error', 'success']) {
    assert.match(components, new RegExp(`\\b${state}\\b`, 'i'));
  }

  assert.match(layouts, /CRM pipeline/i);
  assert.match(layouts, /responsive/i);
});
