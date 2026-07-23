import fs from "node:fs";
import path from "node:path";

const MARKDOWN_LINK = /!?\[[^\]]*]\(([^)]+)\)/g;
const REFERENCE_DEFINITION = /^\s*\[([^\]]+)]:\s*(\S+)/gm;
const REFERENCE_LINK = /!?\[[^\]]+]\[([^\]]+)]/g;

function normalizeTarget(rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/g, "");
  return target.split(/\s+(?=["'])/)[0];
}

function isLocalTarget(target) {
  return (
    target.length > 0 &&
    !/^(?:https?:|mailto:|tel:|data:)/i.test(target)
  );
}

export function extractMarkdownLinks(markdown) {
  const targets = [];
  let match;

  while ((match = MARKDOWN_LINK.exec(markdown)) !== null) {
    const target = normalizeTarget(match[1]);
    if (isLocalTarget(target) && !target.startsWith("#")) targets.push(target);
  }

  while ((match = REFERENCE_DEFINITION.exec(markdown)) !== null) {
    const target = normalizeTarget(match[2]);
    if (isLocalTarget(target) && !target.startsWith("#")) targets.push(target);
  }

  return targets;
}

function collectMarkdownTargets(markdown) {
  const definitions = new Map();
  let match;

  while ((match = REFERENCE_DEFINITION.exec(markdown)) !== null) {
    definitions.set(match[1].trim().toLowerCase(), normalizeTarget(match[2]));
  }

  const targets = [];
  while ((match = MARKDOWN_LINK.exec(markdown)) !== null) {
    targets.push({ target: normalizeTarget(match[1]), index: match.index });
  }

  while ((match = REFERENCE_LINK.exec(markdown)) !== null) {
    const target = definitions.get(match[1].trim().toLowerCase());
    if (target) targets.push({ target, index: match.index });
  }

  return targets;
}

function headingAnchors(markdown) {
  const anchors = new Set();
  for (const match of markdown.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const anchor = match[1]
      .trim()
      .toLowerCase()
      .replace(/[`*_~]/g, "")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    anchors.add(anchor);
  }
  return anchors;
}

export function validateMarkdownLinks(repositoryRoot, files) {
  const diagnostics = [];

  for (const relativeFile of files) {
    const absoluteFile = path.resolve(repositoryRoot, relativeFile);
    const markdown = fs.readFileSync(absoluteFile, "utf8");
    for (const { target, index } of collectMarkdownTargets(markdown)) {
      if (!isLocalTarget(target)) continue;

      const [pathPart, anchor] = target.split("#", 2);
      const resolved = pathPart
        ? path.resolve(path.dirname(absoluteFile), pathPart)
        : absoluteFile;

      const line = markdown.slice(0, index).split("\n").length;
      if (!fs.existsSync(resolved)) {
        diagnostics.push({
          code: "BROKEN_INTERNAL_LINK",
          file: relativeFile,
          line,
          target,
          resolvedPath: path.relative(repositoryRoot, resolved),
        });
        continue;
      }

      if (anchor && path.extname(resolved).toLowerCase() === ".md") {
        const targetMarkdown = fs.readFileSync(resolved, "utf8");
        if (!headingAnchors(targetMarkdown).has(anchor.toLowerCase())) {
          diagnostics.push({
            code: "BROKEN_INTERNAL_ANCHOR",
            file: relativeFile,
            line,
            target,
            resolvedPath: path.relative(repositoryRoot, resolved),
            anchor,
          });
        }
      }
    }
  }

  return diagnostics;
}
