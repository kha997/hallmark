import test from "node:test";
import assert from "node:assert/strict";

import {
  validateDeclaredCounts,
  validateDocumentation,
} from "../../scripts/validation/validate-docs.mjs";

test("reports stale gate, theme, and recipe declarations", () => {
  const diagnostics = validateDeclaredCounts({
    readme: "Runs a 57-gate test across twenty themes.",
    recipes: "# Recipes\n\nEight worked briefs.\n\n## 00 · A\n## 01 · B\n",
    canonicalGateCount: 58,
    canonicalThemeCount: 20,
  });

  assert.deepEqual(
    diagnostics.map((item) => item.code),
    ["STALE_GATE_COUNT", "STALE_RECIPE_COUNT"],
  );
});

test("the tracked documentation baseline is internally consistent", () => {
  assert.deepEqual(validateDocumentation(), []);
});
