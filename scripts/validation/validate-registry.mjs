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

const SUPPORTED_SCHEMA_VERSION = "1.0.0";
const SUPPORTED_REGISTRY_VERSION = "1.0.0";
const CURRENT_PUBLIC_INVOCATIONS = ["build", "audit", "redesign", "study"];
const STATUSES = new Set([
  "confirmed",
  "compatibility-placeholder",
  "proposed",
  "deprecated",
]);

const REQUIRED_ENTITY_FIELDS = {
  modules: [
    "id",
    "schemaVersion",
    "version",
    "status",
    "path",
    "public",
    "intents",
    "dependencies",
    "appliesTo",
    "capabilities",
    "outputs",
    "owns",
  ],
  principles: [
    "id",
    "schemaVersion",
    "version",
    "status",
    "path",
    "dependencies",
    "appliesTo",
    "capabilities",
    "owns",
  ],
  domains: [
    "id",
    "schemaVersion",
    "version",
    "status",
    "path",
    "signals",
    "dependencies",
    "owns",
  ],
  profiles: [
    "id",
    "schemaVersion",
    "version",
    "status",
    "kind",
    "path",
    "dependencies",
    "appliesTo",
    "owns",
  ],
  relations: [
    "id",
    "schemaVersion",
    "version",
    "status",
    "from",
    "relation",
    "to",
  ],
  scoring: [
    "id",
    "schemaVersion",
    "version",
    "status",
    "path",
    "kind",
    "public",
    "dependencies",
    "weighted",
    "owns",
  ],
};

const ARRAY_FIELDS = new Set([
  "intents",
  "dependencies",
  "appliesTo",
  "capabilities",
  "outputs",
  "owns",
  "signals",
]);
const BOOLEAN_FIELDS = new Set(["public", "weighted"]);

function diagnostic(code, details = {}) {
  return { code, ...details };
}

function isEntityObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateManifestShape(manifest) {
  const diagnostics = [];
  for (const field of ["registryVersion", "publicInvocations", "registries"]) {
    if (!(field in manifest)) {
      diagnostics.push(
        diagnostic("MISSING_REQUIRED_FIELD", {
          entityId: "registry.manifest",
          field,
        }),
      );
    }
  }

  if (
    "publicInvocations" in manifest &&
    (!Array.isArray(manifest.publicInvocations) ||
      manifest.publicInvocations.some((value) => typeof value !== "string"))
  ) {
    diagnostics.push(
      diagnostic("INVALID_FIELD_TYPE", {
        entityId: "registry.manifest",
        field: "publicInvocations",
        expected: "string[]",
      }),
    );
  } else if ("publicInvocations" in manifest) {
    const actual = [...new Set(manifest.publicInvocations)].sort();
    const expected = [...CURRENT_PUBLIC_INVOCATIONS].sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      diagnostics.push(
        diagnostic("PUBLIC_INVOCATION_CONTRACT_MISMATCH", {
          expected,
          actual,
        }),
      );
    }
  }

  if (
    "registries" in manifest &&
    (manifest.registries === null ||
      Array.isArray(manifest.registries) ||
      typeof manifest.registries !== "object")
  ) {
    diagnostics.push(
      diagnostic("INVALID_FIELD_TYPE", {
        entityId: "registry.manifest",
        field: "registries",
        expected: "object",
      }),
    );
  }

  return diagnostics;
}

export function validateEntityShape(entity, registryName) {
  if (!isEntityObject(entity)) {
    return [
      diagnostic("INVALID_ENTITY_TYPE", {
        registry: registryName,
        expected: "object",
        value: entity,
      }),
    ];
  }

  const diagnostics = [];
  const required = REQUIRED_ENTITY_FIELDS[registryName] ?? [];

  for (const field of required) {
    if (!(field in entity)) {
      diagnostics.push(
        diagnostic("MISSING_REQUIRED_FIELD", {
          entityId: entity.id ?? "unknown",
          field,
        }),
      );
    }
  }

  if ("status" in entity && !STATUSES.has(entity.status)) {
    diagnostics.push(
      diagnostic("INVALID_STATUS", {
        entityId: entity.id,
        value: entity.status,
      }),
    );
  }

  for (const field of required.filter((candidate) => ARRAY_FIELDS.has(candidate))) {
    if (field in entity && !Array.isArray(entity[field])) {
      diagnostics.push(
        diagnostic("INVALID_FIELD_TYPE", {
          entityId: entity.id,
          field,
          expected: "array",
        }),
      );
    }
  }

  for (const field of required.filter((candidate) => BOOLEAN_FIELDS.has(candidate))) {
    if (field in entity && typeof entity[field] !== "boolean") {
      diagnostics.push(
        diagnostic("INVALID_FIELD_TYPE", {
          entityId: entity.id,
          field,
          expected: "boolean",
        }),
      );
    }
  }

  for (const field of required.filter(
    (candidate) =>
      !ARRAY_FIELDS.has(candidate) && !BOOLEAN_FIELDS.has(candidate),
  )) {
    if (field in entity && typeof entity[field] !== "string") {
      diagnostics.push(
        diagnostic("INVALID_FIELD_TYPE", {
          entityId: entity.id,
          field,
          expected: "string",
        }),
      );
    }
  }

  return diagnostics;
}

export function validateRegistry(root = repositoryRoot) {
  const directory = path.join(root, "skills/hallmark/registry");
  const manifest = readJson(path.join(directory, "registry.json"));
  const diagnostics = validateManifestShape(manifest);

  if (!isSemanticVersion(manifest.schemaVersion)) {
    diagnostics.push(
      diagnostic("INVALID_SEMVER", {
        file: "registry.json",
        field: "schemaVersion",
        value: manifest.schemaVersion,
      }),
    );
  } else if (manifest.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    diagnostics.push(
      diagnostic("UNSUPPORTED_SCHEMA_VERSION", {
        file: "registry.json",
        value: manifest.schemaVersion,
        supported: SUPPORTED_SCHEMA_VERSION,
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
  } else if (manifest.registryVersion !== SUPPORTED_REGISTRY_VERSION) {
    diagnostics.push(
      diagnostic("UNSUPPORTED_REGISTRY_VERSION", {
        file: "registry.json",
        value: manifest.registryVersion,
        supported: SUPPORTED_REGISTRY_VERSION,
      }),
    );
  }

  const registryDocuments = Object.entries(manifest.registries ?? {}).map(
    ([name, relativePath]) => {
      if (typeof relativePath !== "string") {
        diagnostics.push(
          diagnostic("INVALID_FIELD_TYPE", {
            entityId: "registry.manifest",
            field: `registries.${name}`,
            expected: "string",
          }),
        );
        return { name, relativePath, entities: [] };
      }

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
      const entities = Array.isArray(document.entities)
        ? document.entities
        : [];
      if (!Array.isArray(document.entities)) {
        diagnostics.push(
          diagnostic("INVALID_FIELD_TYPE", {
            file: relativePath,
            field: "entities",
            expected: "array",
          }),
        );
      }
      return { name, relativePath, entities };
    },
  );

  for (const name of Object.keys(REQUIRED_ENTITY_FIELDS)) {
    if (!registryDocuments.some((document) => document.name === name)) {
      diagnostics.push(
        diagnostic("MISSING_REGISTRY_FILE", {
          registry: name,
          path: manifest.registries?.[name] ?? null,
        }),
      );
    }
  }

  const entities = registryDocuments
    .flatMap((document) => document.entities)
    .filter(isEntityObject);
  const modules =
    registryDocuments
      .find((document) => document.name === "modules")
      ?.entities.filter(isEntityObject) ?? [];
  const relations =
    registryDocuments
      .find((document) => document.name === "relations")
      ?.entities.filter(isEntityObject) ?? [];

  const ids = new Map();
  for (const document of registryDocuments) {
    for (const entity of document.entities) {
      diagnostics.push(...validateEntityShape(entity, document.name));
    }
  }

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
