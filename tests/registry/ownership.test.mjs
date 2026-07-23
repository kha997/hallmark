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

test("reports a missing public invocation owner", () => {
  const modules = [
    {
      id: "module.build",
      public: true,
      status: "confirmed",
      intents: ["build"],
    },
  ];

  assert.deepEqual(
    validatePublicInvocations(["build", "audit"], modules),
    [
      {
        code: "PUBLIC_INVOCATION_OWNER_MISSING",
        invocation: "audit",
        owners: [],
      },
    ],
  );
});

test("reports duplicate public invocation owners", () => {
  const modules = [
    {
      id: "module.build",
      public: true,
      status: "confirmed",
      intents: ["build"],
    },
    {
      id: "module.build-alternate",
      public: true,
      status: "confirmed",
      intents: ["build"],
    },
  ];

  assert.deepEqual(validatePublicInvocations(["build"], modules), [
    {
      code: "PUBLIC_INVOCATION_OWNER_DUPLICATE",
      invocation: "build",
      owners: ["module.build", "module.build-alternate"],
    },
  ]);
});

for (const status of [
  "proposed",
  "deprecated",
  "compatibility-placeholder",
]) {
  test(`rejects a ${status} public invocation owner`, () => {
    const modules = [
      {
        id: "module.build",
        public: true,
        status,
        intents: ["build"],
      },
    ];

    assert.deepEqual(validatePublicInvocations(["build"], modules), [
      {
        code: "PUBLIC_INVOCATION_OWNER_NOT_CONFIRMED",
        invocation: "build",
        owner: "module.build",
        status,
      },
    ]);
  });
}

test("reports registered paths that do not exist", () => {
  const entities = [
    { id: "module.build", path: "skills/hallmark/does-not-exist.md" },
  ];

  assert.deepEqual(validateRegisteredPaths("/repository", entities, () => false), [
    {
      code: "REGISTRY_PATH_MISSING",
      entityId: "module.build",
      path: "skills/hallmark/does-not-exist.md",
    },
  ]);
});

test("reports an empty registered entity path", () => {
  assert.deepEqual(
    validateRegisteredPaths("/repository", [
      { id: "module.build", path: "" },
    ]),
    [
      {
        code: "REGISTRY_PATH_INVALID",
        entityId: "module.build",
        path: "",
      },
    ],
  );
});
