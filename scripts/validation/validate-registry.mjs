#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  findDependencyCycles,
  validateDependencies,
  validateRelations,
} from "./lib/graph.mjs";
import {
  isSemanticVersion,
  validateEntityIdentity,
} from "./lib/identifiers.mjs";
import {
  readJson,
  validateCanonicalOwnership,
  validatePublicInvocations,
  validateRegisteredPaths,
} from "./lib/repository.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const registryDirectory = path.join(
  repositoryRoot,
  "skills/hallmark/registry",
);

function diagnostic(code, details = {}) {
  return { code, ...details };
}

export function validateRegistry(root = repositoryRoot) {
  const directory = path.join(root, "skills/hallmark/registry");
  const manifest = readJson(path.join(directory, "registry.json"));
  const diagnostics = [];

  if (!isSemanticVersion(manifest.schemaVersion)) {
    diagnostics.push(
      diagnostic("INVALID_SEMVER", {
        file: "registry.json",
        field: "schemaVersion",
        value: manifest.schemaVersion,
      }),
    );
  }

  if (!isSemanticVersion(manifest.registryVersion)) {
    diagnostics.push(
      diagnostic("INVALID_SEMVER", {
        file: "registry.json",
        field: "registryVersion",
        value: manifest.registryVersion,
      }),
    );
  }

  const registryDocuments = Object.entries(manifest.registries).map(
    ([name, relativePath]) => {
      const filePath = path.join(directory, relativePath);
      if (!fs.existsSync(filePath)) {
        diagnostics.push(
          diagnostic("MISSING_REGISTRY_FILE", { registry: name, path: relativePath }),
        );
        return { name, relativePath, entities: [] };
      }

      const document = readJson(filePath);
      for (const field of ["schemaVersion", "registryVersion"]) {
        if (!isSemanticVersion(document[field])) {
          diagnostics.push(
            diagnostic("INVALID_SEMVER", {
              file: relativePath,
              field,
              value: document[field],
            }),
          );
        }
      }
      return { name, relativePath, entities: document.entities ?? [] };
    },
  );

  const entities = registryDocuments.flatMap((document) => document.entities);
  const modules =
    registryDocuments.find((document) => document.name === "modules")?.entities ??
    [];
  const relations =
    registryDocuments.find((document) => document.name === "relations")?.entities ??
    [];

  const ids = new Map();
  for (const entity of entities) {
    diagnostics.push(...validateEntityIdentity(entity));
    const locations = ids.get(entity.id) ?? [];
    locations.push(entity.path ?? entity.id);
    ids.set(entity.id, locations);
  }

  for (const [id, locations] of ids) {
    if (locations.length > 1) {
      diagnostics.push(diagnostic("DUPLICATE_ID", { entityId: id, locations }));
    }
  }

  diagnostics.push(...validateDependencies(entities));
  diagnostics.push(
    ...findDependencyCycles(entities).map((cycle) =>
      diagnostic("DEPENDENCY_CYCLE", { cycle }),
    ),
  );
  diagnostics.push(...validateRelations(relations, new Set(ids.keys())));
  diagnostics.push(...validateCanonicalOwnership(entities));
  diagnostics.push(
    ...validatePublicInvocations(manifest.publicInvocations ?? [], modules),
  );
  diagnostics.push(...validateRegisteredPaths(root, entities));

  return diagnostics;
}

function formatDiagnostic(item) {
  return `${item.code}: ${JSON.stringify(item)}`;
}

if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const diagnostics = validateRegistry(repositoryRoot);

  if (diagnostics.length > 0) {
    for (const item of diagnostics) console.error(formatDiagnostic(item));
    process.exitCode = 1;
  } else {
    console.log(
      `Registry validation passed (${registryDirectory.replace(`${repositoryRoot}/`, "")}).`,
    );
  }
}
