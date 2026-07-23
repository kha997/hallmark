import fs from "node:fs";
import path from "node:path";

export function validateCanonicalOwnership(entities) {
  const owners = new Map();

  for (const entity of entities) {
    for (const ownership of entity.owns ?? []) {
      const entityIds = owners.get(ownership) ?? [];
      entityIds.push(entity.id);
      owners.set(ownership, entityIds);
    }
  }

  return [...owners.entries()]
    .filter(([, entityIds]) => entityIds.length > 1)
    .map(([ownership, entityIds]) => ({
      code: "DUPLICATE_CANONICAL_OWNERSHIP",
      ownership,
      entityIds,
    }));
}

export function validatePublicInvocations(publicInvocations, modules) {
  const diagnostics = [];

  for (const invocation of publicInvocations) {
    const owners = modules
      .filter(
        (module) =>
          module.public === true && (module.intents ?? []).includes(invocation),
      )
      .map((module) => module.id);

    if (owners.length !== 1) {
      diagnostics.push({
        code: "PUBLIC_INVOCATION_OWNER_COUNT",
        invocation,
        owners,
      });
    }
  }

  for (const module of modules.filter((candidate) => candidate.public === true)) {
    for (const intent of module.intents ?? []) {
      if (!publicInvocations.includes(intent)) {
        diagnostics.push({
          code: "UNDECLARED_PUBLIC_INVOCATION",
          invocation: intent,
          moduleId: module.id,
        });
      }
    }
  }

  return diagnostics;
}

export function validateRegisteredPaths(
  repositoryRoot,
  entities,
  exists = fs.existsSync,
) {
  return entities
    .filter((entity) => typeof entity.path === "string" && entity.path)
    .filter((entity) => !exists(path.resolve(repositoryRoot, entity.path)))
    .map((entity) => ({
      code: "MISSING_REGISTERED_PATH",
      entityId: entity.id,
      path: entity.path,
    }));
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
