import fs from "node:fs";
import path from "node:path";

const MARKDOWN_LINK = /!?\[[^\]]*]\(([^)]+)\)/g;

function normalizeTarget(rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/g, "");
  return target.split(/\s+(?=["'])/)[0];
}

function isLocalTarget(target) {
  return (
    target.length > 0 &&
    !target.startsWith("#") &&
    !/^(?:https?:|mailto:|tel:|data:)/i.test(target)
  );
}

export function extractMarkdownLinks(markdown) {
  const targets = [];
  let match;

  while ((match = MARKDOWN_LINK.exec(markdown)) !== null) {
    const target = normalizeTarget(match[1]);
    if (isLocalTarget(target)) targets.push(target);
  }

  return targets;
}

export function validateMarkdownLinks(repositoryRoot, files) {
  const diagnostics = [];

  for (const relativeFile of files) {
    const absoluteFile = path.resolve(repositoryRoot, relativeFile);
    const markdown = fs.readFileSync(absoluteFile, "utf8");
    let match;

    while ((match = MARKDOWN_LINK.exec(markdown)) !== null) {
      const target = normalizeTarget(match[1]);
      if (!isLocalTarget(target)) continue;

      const pathPart = target.split("#")[0];
      if (!pathPart) continue;

      const resolved = path.resolve(path.dirname(absoluteFile), pathPart);
      if (fs.existsSync(resolved)) continue;

      const line = markdown.slice(0, match.index).split("\n").length;
      diagnostics.push({
        code: "BROKEN_INTERNAL_LINK",
        file: relativeFile,
        line,
        target,
        resolvedPath: path.relative(repositoryRoot, resolved),
      });
    }
  }

  return diagnostics;
}
