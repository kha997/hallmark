import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  validateEntityShape,
  validateManifestShape,
  validateRegistry,
} from "../../scripts/validation/validate-registry.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

test("reports missing manifest fields instead of throwing", () => {
  assert.deepEqual(
    validateManifestShape({ schemaVersion: "1.0.0" }).map((item) => item.code),
    [
      "MISSING_REQUIRED_FIELD",
      "MISSING_REQUIRED_FIELD",
      "MISSING_REQUIRED_FIELD",
    ],
  );
});

test("reports missing and invalid module fields", () => {
  const diagnostics = validateEntityShape(
    {
      id: "module.build",
      schemaVersion: "1.0.0",
      version: "1.0.0",
      status: "unknown",
      path: "skills/hallmark/SKILL.md",
      public: "yes",
      intents: ["build"],
      dependencies: [],
      appliesTo: [],
      capabilities: [],
    },
    "modules",
  );

  assert.deepEqual(
    diagnostics.map((item) => item.code),
    [
      "MISSING_REQUIRED_FIELD",
      "MISSING_REQUIRED_FIELD",
      "INVALID_STATUS",
      "INVALID_FIELD_TYPE",
    ],
  );
});

test("reports malformed string and boolean entity fields", () => {
  const relationDiagnostics = validateEntityShape(
    {
      id: "relation.example",
      schemaVersion: "1.0.0",
      version: "1.0.0",
      status: "confirmed",
      from: 42,
      relation: "uses",
      to: "principle.color",
    },
    "relations",
  );
  const scoringDiagnostics = validateEntityShape(
    {
      id: "evaluation.example",
      schemaVersion: "1.0.0",
      version: "1.0.0",
      status: "confirmed",
      path: 42,
      kind: "critique",
      public: "no",
      dependencies: [],
      weighted: "no",
      owns: [],
    },
    "scoring",
  );

  assert.deepEqual(
    [...relationDiagnostics, ...scoringDiagnostics]
      .map((item) => [item.code, item.field])
      .sort((left, right) => left[1].localeCompare(right[1])),
    [
      ["INVALID_FIELD_TYPE", "from"],
      ["INVALID_FIELD_TYPE", "path"],
      ["INVALID_FIELD_TYPE", "public"],
      ["INVALID_FIELD_TYPE", "weighted"],
    ].sort((left, right) => left[1].localeCompare(right[1])),
  );
});

test("invalid registry fixture produces diagnostics without crashing", () => {
  const fixtureRoot = path.resolve(
    testDirectory,
    "../fixtures/invalid-registry",
  );
  const diagnostics = validateRegistry(fixtureRoot);
  const codes = new Set(diagnostics.map((item) => item.code));

  assert.equal(codes.has("MISSING_REQUIRED_FIELD"), true);
  assert.equal(codes.has("MISSING_REGISTRY_FILE"), true);
});

test("malformed registry documents produce diagnostics without crashing", () => {
  const fixtureRoot = path.resolve(
    testDirectory,
    "../fixtures/malformed-registry",
  );
  const diagnostics = validateRegistry(fixtureRoot);
  const codes = diagnostics.map((item) => item.code);

  assert.equal(codes.includes("INVALID_FIELD_TYPE"), true);
  assert.equal(codes.includes("MISSING_REGISTRY_FILE"), true);
});
