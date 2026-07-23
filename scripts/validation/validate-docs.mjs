#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { validateMarkdownLinks } from "./lib/markdown-links.mjs";
import { readJson } from "./lib/repository.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(scriptDirectory, "../..");

const NUMBER_WORDS = new Map([
  ["zero", 0],
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
]);

function declaredRecipeCount(markdown) {
  const match = markdown.match(
    /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+worked briefs\b/i,
  );
  if (!match) return null;
  const token = match[1].toLowerCase();
  return NUMBER_WORDS.get(token) ?? Number(token);
}

function actualRecipeCount(markdown) {
  return [...markdown.matchAll(/^##\s+\d{2}\s+·\s+/gm)].length;
}

export function validateDeclaredCounts({
  readme,
  recipes,
  canonicalGateCount,
  canonicalThemeCount,
}) {
  const diagnostics = [];
  const staleGatePatterns = [
    /\b57-gate\b/i,
    /\b57\s*\/\s*57\b/i,
    /\bfifty-seven\b/i,
  ];

  if (
    canonicalGateCount !== 57 &&
    staleGatePatterns.some((pattern) => pattern.test(readme))
  ) {
    diagnostics.push({
      code: "STALE_GATE_COUNT",
      expected: canonicalGateCount,
    });
  }

  const staleThemePatterns = [
    /\b16 themes\b/i,
    /\bsixteen themes\b/i,
    /\b21\s+macrostructures\s*[×x]\s*16\s+themes\b/i,
  ];

  if (
    canonicalThemeCount !== 16 &&
    staleThemePatterns.some(
      (pattern) => pattern.test(readme) || pattern.test(recipes),
    )
  ) {
    diagnostics.push({
      code: "STALE_THEME_COUNT",
      expected: canonicalThemeCount,
    });
  }

  const declared = declaredRecipeCount(recipes);
  const actual = actualRecipeCount(recipes);
  if (declared !== null && declared !== actual) {
    diagnostics.push({
      code: "STALE_RECIPE_COUNT",
      declared,
      actual,
    });
  }

  return diagnostics;
}

function trackedMarkdownFiles(repositoryRoot) {
  const output = execFileSync("git", ["ls-files", "*.md"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  return output
    .split("\n")
    .filter(Boolean)
    .filter((file) => !file.startsWith("site/_tests/"));
}

export function validateDocumentation(repositoryRoot = defaultRepositoryRoot) {
  const scoring = readJson(
    path.join(repositoryRoot, "skills/hallmark/registry/scoring.json"),
  );
  const canonicalGateCount = scoring.entities.find(
    (entity) => entity.id === "evaluation.slop-test",
  ).gateCount;
  const customTheme = fs.readFileSync(
    path.join(
      repositoryRoot,
      "skills/hallmark/references/custom-theme.md",
    ),
    "utf8",
  );
  const themeMatch = customTheme.match(/Hallmark's\s+(\d+)\s+themes/);
  const canonicalThemeCount = Number(themeMatch?.[1]);
  const readme = fs.readFileSync(path.join(repositoryRoot, "README.md"), "utf8");
  const recipes = fs.readFileSync(
    path.join(repositoryRoot, "docs/recipes.md"),
    "utf8",
  );

  return [
    ...validateDeclaredCounts({
      readme,
      recipes,
      canonicalGateCount,
      canonicalThemeCount,
    }),
    ...validateMarkdownLinks(repositoryRoot, trackedMarkdownFiles(repositoryRoot)),
  ];
}

if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const diagnostics = validateDocumentation(defaultRepositoryRoot);
  if (diagnostics.length > 0) {
    for (const item of diagnostics) {
      console.error(`${item.code}: ${JSON.stringify(item)}`);
    }
    process.exitCode = 1;
  } else {
    console.log("Documentation validation passed.");
  }
}
