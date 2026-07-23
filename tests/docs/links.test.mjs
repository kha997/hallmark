import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  extractMarkdownLinks,
  validateMarkdownLinks,
} from "../../scripts/validation/lib/markdown-links.mjs";

test("extracts local Markdown targets and ignores external links", () => {
  const markdown = [
    "[local](../guide.md)",
    "[anchor](#section)",
    "[web](https://example.com)",
    "[mail](mailto:test@example.com)",
  ].join("\n");

  assert.deepEqual(extractMarkdownLinks(markdown), ["../guide.md"]);
});

test("reports a broken relative Markdown link with its source line", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hallmark-links-"));
  const docs = path.join(root, "docs");
  fs.mkdirSync(docs);
  fs.writeFileSync(path.join(docs, "index.md"), "See [missing](guide.md).\n");

  assert.deepEqual(
    validateMarkdownLinks(root, ["docs/index.md"]),
    [
      {
        code: "BROKEN_INTERNAL_LINK",
        file: "docs/index.md",
        line: 1,
        target: "guide.md",
        resolvedPath: "docs/guide.md",
      },
    ],
  );
});

test("validates reference-style links", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hallmark-links-"));
  const docs = path.join(root, "docs");
  fs.mkdirSync(docs);
  fs.writeFileSync(
    path.join(docs, "index.md"),
    "See [the guide][guide].\n\n[guide]: missing.md\n",
  );

  assert.equal(
    validateMarkdownLinks(root, ["docs/index.md"])[0].code,
    "BROKEN_INTERNAL_LINK",
  );
});

test("reports fragments that do not match a target heading", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hallmark-links-"));
  const docs = path.join(root, "docs");
  fs.mkdirSync(docs);
  fs.writeFileSync(path.join(docs, "index.md"), "See [topic](guide.md#missing).\n");
  fs.writeFileSync(path.join(docs, "guide.md"), "# Existing\n");

  assert.deepEqual(validateMarkdownLinks(root, ["docs/index.md"]), [
    {
      code: "BROKEN_INTERNAL_ANCHOR",
      file: "docs/index.md",
      line: 1,
      target: "guide.md#missing",
      resolvedPath: "docs/guide.md",
      anchor: "missing",
    },
  ]);
});
