import test from "node:test";
import assert from "node:assert/strict";

import {
  isLogicalId,
  isSemanticVersion,
  validateEntityIdentity,
} from "../../scripts/validation/lib/identifiers.mjs";

test("accepts stable dot-separated logical IDs", () => {
  assert.equal(isLogicalId("module.build"), true);
  assert.equal(isLogicalId("profile.brand.design-system"), true);
});

test("rejects uppercase, path-like, and single-segment IDs", () => {
  assert.equal(isLogicalId("Module.Build"), false);
  assert.equal(isLogicalId("module/build"), false);
  assert.equal(isLogicalId("build"), false);
});

test("accepts semantic versions and rejects ambiguous versions", () => {
  assert.equal(isSemanticVersion("1.0.0"), true);
  assert.equal(isSemanticVersion("1.2.3-beta.1+build.4"), true);
  assert.equal(isSemanticVersion("v1.0"), false);
  assert.equal(isSemanticVersion("1.0"), false);
});

test("reports invalid entity ID and version", () => {
  const diagnostics = validateEntityIdentity({
    id: "Module/Build",
    schemaVersion: "1.0",
    version: "v1",
  });

  assert.deepEqual(
    diagnostics.map((item) => item.code),
    ["INVALID_ID", "INVALID_SEMVER", "INVALID_SEMVER"],
  );
});
