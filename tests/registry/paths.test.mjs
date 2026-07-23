import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { validateRegistryPath } from "../../scripts/validation/lib/repository.mjs";

const cases = JSON.parse(
  fs.readFileSync("tests/fixtures/path-contract/cases.json", "utf8"),
);

for (const fixture of cases) {
  test(fixture.name, () => {
    const diagnostics = validateRegistryPath({
      rawPath: fixture.path,
      baseDirectory: "/repo",
      packageDirectory: "/repo/skills/hallmark",
      exists: () => fixture.exists,
    });

    assert.deepEqual(
      diagnostics.map((item) => item.code),
      fixture.expectedCodes,
    );
  });
}

test("valid nested package path resolves inside the package", () => {
  const diagnostics = validateRegistryPath({
    rawPath: "skills/hallmark/registry/modules.json",
    baseDirectory: "/repo",
    packageDirectory: "/repo/skills/hallmark",
    exists: (target) =>
      target === path.resolve("/repo/skills/hallmark/registry/modules.json"),
  });

  assert.deepEqual(diagnostics, []);
});
