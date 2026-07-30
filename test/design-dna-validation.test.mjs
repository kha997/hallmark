import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

// Resolver module — will be created after RED
let resolver;
try {
  resolver = await import('../scripts/validation/lib/design-dna.mjs');
} catch {
  // Module doesn't exist yet — tests will fail as expected (RED)
}

const validDna = {
  id: 'test-dna',
  name: 'Test DNA',
  version: '1.0.0',
  status: 'active',
  genre: 'editorial',
  entry: 'presets/test/design.md',
  tokens: 'presets/test/tokens.css',
  components: 'presets/test/components.md',
  layouts: 'presets/test/layouts.md',
  activation: {
    explicitNames: ['Test DNA', 'test-dna'],
    projectMarkers: ['hallmark_design_dna: test-dna']
  }
};

test('Resolver module exports required functions', () => {
  assert.ok(resolver, 'resolver module must exist');
  assert.equal(typeof resolver.resolveDna, 'function', 'resolveDna must be a function');
  assert.equal(typeof resolver.resolveDnaByName, 'function', 'resolveDnaByName must be a function');
  assert.equal(typeof resolver.resolveDnaByMarker, 'function', 'resolveDnaByMarker must be a function');
  assert.equal(typeof resolver.validateDnaRegistry, 'function', 'validateDnaRegistry must be a function');
  assert.equal(typeof resolver.validateDnaEntry, 'function', 'validateDnaEntry must be a function');
});

test('resolveDna returns matching DNA by ID', () => {
  const registry = { designDnas: [validDna] };
  const result = resolver.resolveDna('test-dna', registry);
  assert.ok(result, 'must resolve a DNA');
  assert.equal(result.id, 'test-dna');
});

test('resolveDna returns null for unknown ID', () => {
  const registry = { designDnas: [validDna] };
  const result = resolver.resolveDna('unknown-dna', registry);
  assert.equal(result, null);
});

test('resolveDnaByName returns matching DNA by explicit name', () => {
  const registry = { designDnas: [validDna] };
  const result = resolver.resolveDnaByName('Test DNA', registry);
  assert.ok(result);
  assert.equal(result.id, 'test-dna');

  const result2 = resolver.resolveDnaByName('test-dna', registry);
  assert.ok(result2);
  assert.equal(result2.id, 'test-dna');
});

test('resolveDnaByName returns null for unknown name', () => {
  const registry = { designDnas: [validDna] };
  assert.equal(resolver.resolveDnaByName('Unknown', registry), null);
});

test('resolveDnaByMarker finds DNA from project design.md content', () => {
  const registry = { designDnas: [validDna] };
  const content = '# Project Design\n\nSome text\nhallmark_design_dna: test-dna\n\nMore text';
  const result = resolver.resolveDnaByMarker(content, registry);
  assert.ok(result);
  assert.equal(result.id, 'test-dna');
});

test('resolveDnaByMarker returns null when no marker found', () => {
  const registry = { designDnas: [validDna] };
  const content = '# Project Design\n\nNo marker here';
  const result = resolver.resolveDnaByMarker(content, registry);
  assert.equal(result, null);
});

test('resolveDnaByMarker returns null when marker points to unknown DNA', () => {
  const registry = { designDnas: [validDna] };
  const content = '# Project Design\nhallmark_design_dna: nonexistent-dna';
  const result = resolver.resolveDnaByMarker(content, registry);
  assert.equal(result, null);
});

test('validateDnaRegistry rejects duplicate IDs', () => {
  const registry = {
    designDnas: [
      validDna,
      { ...validDna, id: 'test-dna' }  // duplicate ID
    ]
  };
  const errors = resolver.validateDnaRegistry(registry);
  assert.ok(errors.some(e => e.code === 'DUPLICATE_DESIGN_DNA_ID'), 'must detect duplicate ID');
});

test('validateDnaRegistry rejects entry with missing required fields', () => {
  const invalid = { id: 'incomplete' };
  const registry = { designDnas: [invalid] };
  const errors = resolver.validateDnaRegistry(registry);
  assert.ok(errors.length > 0, 'must produce errors for missing fields');
});

test('validateDnaRegistry rejects entry with path traversal', () => {
  const traversal = {
    ...validDna,
    entry: 'presets/../../outside/design.md'
  };
  const registry = { designDnas: [traversal] };
  const errors = resolver.validateDnaRegistry(registry);
  assert.ok(errors.some(e => e.code === 'DESIGN_DNA_PATH_TRAVERSAL'), 'must detect path traversal');
});

test('validateDnaRegistry rejects entry pointing to nonexistent file', () => {
  const missing = {
    ...validDna,
    id: 'missing-file-test',
    entry: 'presets/missing-test/design.md'
  };
  const registry = { designDnas: [missing] };
  const errors = resolver.validateDnaRegistry(registry);
  assert.ok(errors.some(e => e.code === 'DESIGN_DNA_MISSING_FILE'), 'must detect missing file');
});

test('validateDnaRegistry rejects entry with malformed activation', () => {
  const noActivation = {
    ...validDna,
    activation: { explicitNames: [], projectMarkers: [] }
  };
  const registry = { designDnas: [noActivation] };
  const errors = resolver.validateDnaRegistry(registry);
  assert.ok(errors.some(e => e.code === 'DESIGN_DNA_EMPTY_ACTIVATION'), 'must detect empty activation');

  const nonStandardMarker = {
    ...validDna,
    activation: {
      explicitNames: ['test'],
      projectMarkers: ['custom_prefix: test-dna']
    }
  };
  const registry2 = { designDnas: [nonStandardMarker] };
  const errors2 = resolver.validateDnaRegistry(registry2);
  assert.ok(errors2.some(e => e.code === 'DESIGN_DNA_INVALID_MARKER'), 'must detect non-standard marker');
});
