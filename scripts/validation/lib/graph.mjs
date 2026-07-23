export function validateDependencies(entities) {
  const knownIds = new Set(entities.map((entity) => entity.id));
  const diagnostics = [];

  for (const entity of entities) {
    for (const dependencyId of entity.dependencies ?? []) {
      if (!knownIds.has(dependencyId)) {
        diagnostics.push({
          code: "MISSING_DEPENDENCY",
          entityId: entity.id,
          dependencyId,
        });
      }
    }
  }

  return diagnostics;
}

export function findDependencyCycles(entities) {
  const dependencies = new Map(
    entities.map((entity) => [entity.id, entity.dependencies ?? []]),
  );
  const state = new Map();
  const stack = [];
  const cycles = [];
  const seenCycles = new Set();

  function visit(id) {
    if (state.get(id) === "visited") return;

    if (state.get(id) === "visiting") {
      const start = stack.indexOf(id);
      const cycle = [...stack.slice(start), id];
      const key = cycle.join(" -> ");
      if (!seenCycles.has(key)) {
        seenCycles.add(key);
        cycles.push(cycle);
      }
      return;
    }

    state.set(id, "visiting");
    stack.push(id);

    for (const dependencyId of dependencies.get(id) ?? []) {
      if (dependencies.has(dependencyId)) visit(dependencyId);
    }

    stack.pop();
    state.set(id, "visited");
  }

  for (const id of dependencies.keys()) visit(id);
  return cycles;
}

export function validateRelations(relations, knownIds) {
  const diagnostics = [];

  for (const relation of relations) {
    if (!knownIds.has(relation.from)) {
      diagnostics.push({
        code: "UNKNOWN_RELATION_SOURCE",
        relationId: relation.id,
        sourceId: relation.from,
      });
    }

    if (!knownIds.has(relation.to)) {
      diagnostics.push({
        code: "UNKNOWN_RELATION_TARGET",
        relationId: relation.id,
        targetId: relation.to,
      });
    }
  }

  return diagnostics;
}
