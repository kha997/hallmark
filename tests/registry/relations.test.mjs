import test from "node:test";
import assert from "node:assert/strict";

import { validateRelations } from "../../scripts/validation/lib/graph.mjs";

test("reports relation endpoints that are not registered", () => {
  const knownIds = new Set(["module.build"]);
  const relations = [
    {
      id: "relation.build-uses-missing",
      from: "module.build",
      relation: "uses",
      to: "principle.missing",
    },
  ];

  assert.deepEqual(validateRelations(relations, knownIds), [
    {
      code: "UNKNOWN_RELATION_TARGET",
      relationId: "relation.build-uses-missing",
      targetId: "principle.missing",
    },
  ]);
});
