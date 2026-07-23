import test from "node:test";
import assert from "node:assert/strict";

import {
  validateCanonicalOwnership,
  validatePublicInvocations,
  validateRegisteredPaths,
} from "../../scripts/validation/lib/repository.mjs";

test("reports duplicate canonical ownership", () => {
  const entities = [
    { id: "module.build", owns: ["capability.intent.build"] },
    { id: "module.audit", owns: ["capability.intent.build"] },
  ];

  assert.deepEqual(validateCanonicalOwnership(entities), [
    {
      code: "DUPLICATE_CANONICAL_OWNERSHIP",
      ownership: "capability.intent.build",
      entityIds: ["module.build", "module.audit"],
    },
  ]);
});

test("requires exactly one public module for every public invocation", () => {
  const modules = [
    { id: "module.build", public: true, intents: ["build"] },
    { id: "module.audit", public: true, intents: ["audit"] },
  ];

  assert.deepEqual(
    validatePublicInvocations(["build", "audit", "study"], modules),
    [
      {
        code: "PUBLIC_INVOCATION_OWNER_COUNT",
        invocation: "study",
        owners: [],
      },
    ],
  );
});

test("reports registered paths that do not exist", () => {
  const entities = [
    { id: "module.build", path: "skills/hallmark/does-not-exist.md" },
  ];

  assert.deepEqual(validateRegisteredPaths("/repository", entities, () => false), [
    {
      code: "MISSING_REGISTERED_PATH",
      entityId: "module.build",
      path: "skills/hallmark/does-not-exist.md",
    },
  ]);
});
