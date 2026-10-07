import { FILTER_OPERATORS, type FilterDescriptor } from "../src";

export const validOperators = [
  {
    type: "enum",
    id: "status",
    label: "Status",
    options: [{ label: "Failed", value: "FAILED" }],
    operators: [FILTER_OPERATORS.is, FILTER_OPERATORS.isNot],
  },
] as const satisfies readonly FilterDescriptor<"status">[];

export const misspelledOperator = [
  {
    type: "enum",
    id: "status",
    label: "Status",
    options: [{ label: "Failed", value: "FAILED" }],
    // @ts-expect-error Operator values come from FILTER_OPERATORS.
    operators: [{ value: "isnot", label: "is not" }],
  },
] as const satisfies readonly FilterDescriptor<"status">[];

export const dateOperators = [
  // @ts-expect-error Only filters with options support operators.
  {
    type: "date",
    id: "createdAt",
    label: "Created",
    operators: [FILTER_OPERATORS.is],
  },
] as const satisfies readonly FilterDescriptor<"createdAt">[];

export const stringOperators = [
  // @ts-expect-error Only filters with options support operators.
  {
    type: "string",
    id: "reference",
    label: "Reference",
    operators: [FILTER_OPERATORS.is],
  },
] as const satisfies readonly FilterDescriptor<"reference">[];
