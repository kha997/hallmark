import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const registryPath = resolve(repoRoot, 'skills/hallmark/design-dna/registry.json');
const designDnaDir = resolve(repoRoot, 'skills/hallmark/design-dna');
const presetsDir = resolve(repoRoot, 'skills/hallmark/presets');

test('Design DNA registry exists and is valid JSON', async () => {
  assert.ok(existsSync(registryPath), 'registry.json must exist');
  const raw = await readFile(registryPath, 'utf8');
  let registry;
  try {
    registry = JSON.parse(raw);
  } catch {
    assert.fail('registry.json must be valid JSON');
  }

  assert.ok(typeof registry === 'object' && registry !== null, 'registry must be an object');
  assert.equal(typeof registry.schemaVersion, 'string', 'schemaVersion is required');
  assert.ok(Array.isArray(registry.designDnas), 'designDnas must be an array');
});

test('Design DNA registry has valid schema version', async () => {
  const raw = await readFile(registryPath, 'utf8');
  const registry = JSON.parse(raw);
  assert.match(registry.schemaVersion, /^\d+\.\d+\.\d+$/, 'schemaVersion must be semver');
  assert.equal(registry.schemaVersion, '1.0.0', 'current schema version is 1.0.0');
});

test('ZENA Enterprise SaaS is registered in Design DNA registry', async () => {
  const raw = await readFile(registryPath, 'utf8');
  const registry = JSON.parse(raw);
  const zena = registry.designDnas.find(dna => dna.id === 'zena-enterprise-saas');
  assert.ok(zena, 'zena-enterprise-saas must be registered');
  assert.equal(zena.name, 'ZENA Enterprise SaaS');
  assert.equal(zena.version, '1.0.0');
  assert.equal(zena.status, 'active');
  assert.equal(zena.genre, 'modern-minimal');
});

test('ZENA Design DNA entry has all required fields', async () => {
  const raw = await readFile(registryPath, 'utf8');
  const registry = JSON.parse(raw);
  const zena = registry.designDnas.find(dna => dna.id === 'zena-enterprise-saas');

  const requiredStrings = ['id', 'name', 'version', 'status', 'genre', 'entry', 'tokens', 'components', 'layouts'];
  for (const field of requiredStrings) {
    assert.equal(typeof zena[field], 'string', `${field} must be a string`);
    assert.ok(zena[field].length > 0, `${field} must not be empty`);
  }

  assert.ok(zena.activation, 'activation block is required');
  assert.ok(Array.isArray(zena.activation.explicitNames), 'activation.explicitNames must be an array');
  assert.ok(zena.activation.explicitNames.length > 0, 'activation.explicitNames must not be empty');
  assert.ok(Array.isArray(zena.activation.projectMarkers), 'activation.projectMarkers must be an array');
  assert.ok(zena.activation.projectMarkers.length > 0, 'activation.projectMarkers must not be empty');
});

test('ZENA Design DNA entry paths resolve to existing files', async () => {
  const raw = await readFile(registryPath, 'utf8');
  const registry = JSON.parse(raw);
  const zena = registry.designDnas.find(dna => dna.id === 'zena-enterprise-saas');

  const pathFields = ['entry', 'tokens', 'components', 'layouts'];
  for (const field of pathFields) {
    const filePath = resolve(presetsDir, zena[field].replace(/^presets\//, ''));
    assert.ok(existsSync(filePath), `${field} file must exist at ${filePath}`);
  }
});

test('ZENA Design DNA entry activation names include canonical identifiers', async () => {
  const raw = await readFile(registryPath, 'utf8');
  const registry = JSON.parse(raw);
  const zena = registry.designDnas.find(dna => dna.id === 'zena-enterprise-saas');

  assert.ok(zena.activation.explicitNames.includes('ZENA Enterprise SaaS'));
  assert.ok(zena.activation.explicitNames.includes('zena-enterprise-saas'));

  const canonicalMarker = `hallmark_design_dna: ${zena.id}`;
  assert.ok(
    zena.activation.projectMarkers.some(m => m.startsWith('hallmark_design_dna:')),
    'projectMarkers must use hallmark_design_dna: prefix'
  );
});

test('Design DNA registry has unique IDs', async () => {
  const raw = await readFile(registryPath, 'utf8');
  const registry = JSON.parse(raw);
  const ids = registry.designDnas.map(dna => dna.id);
  const uniqueIds = new Set(ids);
  assert.equal(ids.length, uniqueIds.size, 'design DNA IDs must be unique');
});

test('Design DNA entry paths do not traverse outside presets directory', async () => {
  const raw = await readFile(registryPath, 'utf8');
  const registry = JSON.parse(raw);

  for (const dna of registry.designDnas) {
    for (const field of ['entry', 'tokens', 'components', 'layouts']) {
      const p = dna[field];
      assert.doesNotMatch(p, /\.\./, `${field} path must not contain traversal: ${p}`);
      assert.match(p, /^presets\//, `${field} path must start with presets/: ${p}`);
    }
  }
});
