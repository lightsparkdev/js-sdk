/** The operator choices a filter can offer. */
export const FILTER_OPERATORS = {
  is: { value: "is", label: "is" },
  isNot: { value: "isNot", label: "is not" },
} as const;

export type FilterOperatorValue =
  (typeof FILTER_OPERATORS)[keyof typeof FILTER_OPERATORS]["value"];

export interface FilterOperatorOption {
  label: string;
  value: FilterOperatorValue;
}

interface OperatorDescriptor {
  operators?: readonly FilterOperatorOption[];
}

/**
 * The descriptor's operator matching `requested`, else its first (default)
 * operator. Unknown operators from state or the URL never survive.
 */
export function resolveFilterOperator(
  descriptor: OperatorDescriptor,
  requested?: string | null,
): FilterOperatorOption | undefined {
  return (
    descriptor.operators?.find((candidate) => candidate.value === requested) ??
    descriptor.operators?.[0]
  );
}

/** State fields for the resolved operator, empty for operator-less filters. */
export function getOperatorState(
  descriptor: OperatorDescriptor,
  requested?: string | null,
): { operator?: FilterOperatorValue } {
  const operator = resolveFilterOperator(descriptor, requested)?.value;
  return operator === undefined ? {} : { operator };
}
