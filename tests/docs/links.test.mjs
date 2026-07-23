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
