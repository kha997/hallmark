import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

const REQUIRED_DNA_FIELDS = [
  'id', 'name', 'version', 'status', 'genre', 'entry', 'tokens', 'components', 'layouts', 'activation'
];

const STRING_FIELDS = ['id', 'name', 'version', 'status', 'genre', 'entry', 'tokens', 'components', 'layouts'];

const VALID_STATUSES = new Set(['active', 'deprecated', 'draft']);

function isPlainObject(value) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value);
}

/**
 * Find a Design DNA by its canonical ID.
 * @param {string} id
 * @param {{ designDnas: Array }} registry
 * @returns {object|null}
 */
export function resolveDna(id, registry) {
  if (!registry || !Array.isArray(registry.designDnas)) return null;
  if (typeof id !== 'string' && typeof id !== 'number') return null;
  return registry.designDnas.find(dna => dna && dna.id === String(id)) ?? null;
}

/**
 * Find a Design DNA by an explicit activation name.
 * Checks both exact match and case-insensitive match against explicitNames.
 * @param {string} name
 * @param {{ designDnas: Array }} registry
 * @returns {object|null}
 */
export function resolveDnaByName(name, registry) {
  if (!registry || !Array.isArray(registry.designDnas)) return null;
  if (typeof name !== 'string') return null;
  const lowerName = name.toLowerCase();
  return registry.designDnas.find(dna =>
    dna?.activation?.explicitNames?.some(en =>
      typeof en === 'string' && (en === name || en.toLowerCase() === lowerName)
    )
  ) ?? null;
}

/**
 * Find a Design DNA by scanning project design.md content for hallmark_design_dna: <id> markers.
 * @param {string} content - The full text of a project design.md file
 * @param {{ designDnas: Array }} registry
 * @returns {object|null}
 */
export function resolveDnaByMarker(content, registry) {
  if (!content || typeof content !== 'string') return null;
  if (!registry || !Array.isArray(registry.designDnas)) return null;
  const markerMatch = content.match(/hallmark_design_dna:\s*([\w-]+)/);
  if (!markerMatch) return null;
  const dnaId = markerMatch[1];
  return resolveDna(dnaId, registry);
}

/**
 * Validate the entire Design DNA registry.
 * Returns an array of diagnostic objects with code and details.
 * @param {{ designDnas: Array }} registry
 * @param {object} [options]
 * @param {string} [options.presetsBase] - Base path for presets (default: repoRoot/skills/hallmark/presets)
 * @returns {Array<{code: string, [key: string]: any}>}
 */
export function validateDnaRegistry(registry, options = {}) {
  const diagnostics = [];

  if (!registry || typeof registry !== 'object') {
    diagnostics.push({ code: 'DESIGN_DNA_REGISTRY_NOT_OBJECT' });
    return diagnostics;
  }

  if (!Array.isArray(registry.designDnas)) {
    diagnostics.push({ code: 'DESIGN_DNA_REGISTRY_MISSING_DNAS' });
    return diagnostics;
  }

  if (registry.designDnas.length === 0) {
    diagnostics.push({ code: 'DESIGN_DNA_REGISTRY_EMPTY' });
    return diagnostics;
  }

  const presetsBase = options.presetsBase
    ? options.presetsBase
    : path.resolve(repoRoot, 'skills/hallmark/presets');

  const seenIds = new Map();

  for (let i = 0; i < registry.designDnas.length; i++) {
    diagnostics.push(...validateDnaEntry(registry.designDnas[i], presetsBase, seenIds, i));
  }

  return diagnostics;
}

/**
 * Validate a single Design DNA entry.
 * @param {object} dna
 * @param {string} presetsBase
 * @param {Map<string, string>} seenIds
 * @returns {Array<{code: string, entityId: string, [key: string]: any}>}
 */
export function validateDnaEntry(dna, presetsBase, seenIds = new Map(), entryIndex) {
  const diagnostics = [];
  const location = entryIndex !== undefined ? `designDnas[${entryIndex}]` : null;

  if (!isPlainObject(dna)) {
    diagnostics.push({
      code: 'DESIGN_DNA_ENTRY_NOT_OBJECT',
      ...(location ? { location } : {})
    });
    return diagnostics;
  }

  const entityId = dna.id ?? 'unknown';

  // Check required fields
  for (const field of REQUIRED_DNA_FIELDS) {
    if (!(field in dna) || dna[field] === undefined || dna[field] === null) {
      diagnostics.push({
        code: 'DESIGN_DNA_MISSING_FIELD',
        entityId,
        field
      });
    }
  }

  // Check string fields are strings
  for (const field of STRING_FIELDS) {
    if (field in dna && dna[field] !== undefined && dna[field] !== null && typeof dna[field] !== 'string') {
      diagnostics.push({
        code: 'DESIGN_DNA_FIELD_TYPE',
        entityId,
        field,
        expected: 'string'
      });
    }
  }

  // Check status
  if (dna.status && !VALID_STATUSES.has(dna.status)) {
    diagnostics.push({
      code: 'DESIGN_DNA_INVALID_STATUS',
      entityId,
      value: dna.status
    });
  }

  // Check version format
  if (dna.version && !/^\d+\.\d+\.\d+$/.test(dna.version)) {
    diagnostics.push({
      code: 'DESIGN_DNA_INVALID_VERSION',
      entityId,
      value: dna.version
    });
  }

  // Check ID format
  if (dna.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dna.id)) {
    diagnostics.push({
      code: 'DESIGN_DNA_INVALID_ID',
      entityId,
      value: dna.id
    });
  }

  // Check duplicate IDs
  if (dna.id) {
    if (seenIds.has(dna.id)) {
      diagnostics.push({
        code: 'DUPLICATE_DESIGN_DNA_ID',
        entityId: dna.id,
        previousLocation: seenIds.get(dna.id)
      });
    }
    seenIds.set(dna.id, dna.entry ?? 'unknown');
  }

  // Check activation block
  if (dna.activation) {
    if (!Array.isArray(dna.activation.explicitNames) || dna.activation.explicitNames.length === 0) {
      diagnostics.push({
        code: 'DESIGN_DNA_EMPTY_ACTIVATION',
        entityId,
        detail: 'explicitNames must be a non-empty array'
      });
    }
    if (!Array.isArray(dna.activation.projectMarkers) || dna.activation.projectMarkers.length === 0) {
      diagnostics.push({
        code: 'DESIGN_DNA_EMPTY_ACTIVATION',
        entityId,
        detail: 'projectMarkers must be a non-empty array'
      });
    }
    // Check markers use canonical hallmark_design_dna: prefix
    if (Array.isArray(dna.activation.projectMarkers)) {
      for (const marker of dna.activation.projectMarkers) {
        if (!marker.startsWith('hallmark_design_dna:')) {
          diagnostics.push({
            code: 'DESIGN_DNA_INVALID_MARKER',
            entityId,
            marker,
            detail: 'projectMarkers must start with hallmark_design_dna:'
          });
        }
      }
    }
  }

  // Check path fields
  const pathFields = ['entry', 'tokens', 'components', 'layouts'];
  for (const field of pathFields) {
    const p = dna[field];
    if (p && typeof p === 'string') {
      // Check traversal
      if (p.includes('..')) {
        diagnostics.push({
          code: 'DESIGN_DNA_PATH_TRAVERSAL',
          entityId,
          field,
          path: p
        });
        continue;
      }
      // Check starts with presets/
      if (!p.startsWith('presets/')) {
        diagnostics.push({
          code: 'DESIGN_DNA_PATH_INVALID',
          entityId,
          field,
          path: p
        });
        continue;
      }
      // Check file exists
      const relativePath = p.replace(/^presets\//, '');
      const fullPath = path.resolve(presetsBase, relativePath);
      if (!fs.existsSync(fullPath)) {
        diagnostics.push({
          code: 'DESIGN_DNA_MISSING_FILE',
          entityId,
          field,
          path: p,
          resolvedPath: fullPath
        });
      }
    }
  }

  return diagnostics;
}
