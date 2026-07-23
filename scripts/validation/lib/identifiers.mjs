const LOGICAL_ID =
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/;

const SEMANTIC_VERSION =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export function isLogicalId(value) {
  return typeof value === "string" && LOGICAL_ID.test(value);
}

export function isSemanticVersion(value) {
  return typeof value === "string" && SEMANTIC_VERSION.test(value);
}

export function validateEntityIdentity(entity) {
  const diagnostics = [];

  if (!isLogicalId(entity.id)) {
    diagnostics.push({
      code: "INVALID_ID",
      entityId: entity.id,
      value: entity.id,
    });
  }

  for (const field of ["schemaVersion", "version"]) {
    if (!isSemanticVersion(entity[field])) {
      diagnostics.push({
        code: "INVALID_SEMVER",
        entityId: entity.id,
        field,
        value: entity[field],
      });
    }
  }

  return diagnostics;
}
