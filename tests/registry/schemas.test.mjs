import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function schema(name) {
  return JSON.parse(
    fs.readFileSync(`skills/hallmark/schemas/${name}.schema.json`, "utf8"),
  );
}

test("decision trace requires precedence and ambiguity resolution", () => {
  const decision = schema("decision-trace");

  assert.equal(decision.required.includes("precedence"), true);
  assert.equal(decision.required.includes("ambiguity"), true);
  assert.deepEqual(
    decision.properties.ambiguity.required,
    ["materiality", "action", "reason"],
  );
});

test("scoring rubric requires deterministic scoring contracts", () => {
  const rubric = schema("scoring-rubric");

  for (const field of [
    "formula",
    "thresholds",
    "severityLevels",
    "machineRules",
    "reportStructure",
  ]) {
    assert.equal(rubric.required.includes(field), true, field);
  }
});

test("review category distinguishes scored and not-scored states", () => {
  const report = schema("review-report");
  const category = report.properties.categories.items;

  assert.equal(Array.isArray(category.oneOf), true);
  assert.equal(category.oneOf.length, 2);
});
