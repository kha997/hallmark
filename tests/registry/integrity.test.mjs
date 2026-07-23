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
