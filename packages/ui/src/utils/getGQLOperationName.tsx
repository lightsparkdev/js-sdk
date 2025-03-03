import { Kind, type DocumentNode } from "graphql";

export function getGQLOperationName(query: DocumentNode) {
  if (query.definitions.length === 0) {
    return undefined;
  }

  const definition = query.definitions[0];

  // Check that the definition is an operation definition,
  // which is expected to have a "name" property.
  if (definition.kind !== Kind.OPERATION_DEFINITION) {
    return undefined;
  }

  // At this point, it's safe to assert the type.
  const opDef = definition;
  return opDef.name?.value;
}
