import test from "node:test";
import assert from "node:assert/strict";

import {
  findDependencyCycles,
  validateDependencies,
} from "../../scripts/validation/lib/graph.mjs";

test("reports dependencies that do not resolve", () => {
  const entities = [
    { id: "module.build", dependencies: ["principle.missing"] },
  ];

  assert.deepEqual(validateDependencies(entities), [
    {
      code: "MISSING_DEPENDENCY",
      entityId: "module.build",
      dependencyId: "principle.missing",
    },
  ]);
});

test("returns the dependency cycle path", () => {
  const entities = [
    { id: "module.build", dependencies: ["principle.color"] },
    { id: "principle.color", dependencies: ["module.build"] },
  ];

  assert.deepEqual(findDependencyCycles(entities), [
    ["module.build", "principle.color", "module.build"],
  ]);
});

test("accepts an acyclic dependency graph", () => {
  const entities = [
    { id: "module.build", dependencies: ["principle.color"] },
    { id: "principle.color", dependencies: [] },
  ];

  assert.deepEqual(validateDependencies(entities), []);
  assert.deepEqual(findDependencyCycles(entities), []);
});
