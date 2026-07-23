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
      );

    if (owners.length === 0) {
      diagnostics.push({
        code: "PUBLIC_INVOCATION_OWNER_MISSING",
        invocation,
        owners: [],
      });
    } else if (owners.length > 1) {
      diagnostics.push({
        code: "PUBLIC_INVOCATION_OWNER_DUPLICATE",
        invocation,
        owners: owners.map((module) => module.id),
      });
    } else if (owners[0].status !== "confirmed") {
      diagnostics.push({
        code: "PUBLIC_INVOCATION_OWNER_NOT_CONFIRMED",
        invocation,
        owner: owners[0].id,
        status: owners[0].status,
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

export function validateRegistryPath({
  rawPath,
  baseDirectory,
  packageDirectory,
  exists = fs.existsSync,
  realpath = null,
}) {
  if (
    typeof rawPath !== "string" ||
    rawPath.length === 0 ||
    /^file:/i.test(rawPath) ||
    rawPath.includes("\\")
  ) {
    if (
      typeof rawPath === "string" &&
      (/^[A-Za-z]:[\\/]/.test(rawPath) || /^(?:\\\\|\/\/)/.test(rawPath))
    ) {
      return [{ code: "REGISTRY_PATH_ABSOLUTE", path: rawPath }];
    }
    return [{ code: "REGISTRY_PATH_INVALID", path: rawPath }];
  }

  if (
    path.posix.isAbsolute(rawPath) ||
    /^[A-Za-z]:[\\/]/.test(rawPath) ||
    /^(?:\\\\|\/\/)/.test(rawPath)
  ) {
    return [{ code: "REGISTRY_PATH_ABSOLUTE", path: rawPath }];
  }

  const resolvedPath = path.resolve(baseDirectory, rawPath);
  const relativeToPackage = path.relative(packageDirectory, resolvedPath);
  const isOutsidePackage =
    relativeToPackage === ".." ||
    relativeToPackage.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeToPackage);

  if (isOutsidePackage) {
    return [{ code: "REGISTRY_PATH_OUTSIDE_PACKAGE", path: rawPath }];
  }

  if (!exists(resolvedPath)) {
    return [{ code: "REGISTRY_PATH_MISSING", path: rawPath }];
  }

  if (realpath) {
    const canonicalPath = realpath(resolvedPath);
    const canonicalPackage = realpath(packageDirectory);
    const canonicalRelative = path.relative(canonicalPackage, canonicalPath);
    const canonicalOutside =
      canonicalRelative === ".." ||
      canonicalRelative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(canonicalRelative);

    if (canonicalOutside) {
      return [{ code: "REGISTRY_PATH_OUTSIDE_PACKAGE", path: rawPath }];
    }
  }

  return [];
}

export function validateRegisteredPaths(
  repositoryRoot,
  entities,
  exists = fs.existsSync,
) {
  const packageDirectory = path.resolve(repositoryRoot, "skills/hallmark");

  return entities
    .filter((entity) => Object.hasOwn(entity, "path"))
    .flatMap((entity) =>
      validateRegistryPath({
        rawPath: entity.path,
        baseDirectory: repositoryRoot,
        packageDirectory,
        exists,
        realpath: exists === fs.existsSync ? fs.realpathSync : null,
      }).map((item) => ({ ...item, entityId: entity.id })),
    );
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
