import { type ReactNode, isValidElement } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Type guard to check if a value is a ReactNode
export function isReactNode(value: any): value is ReactNode {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined ||
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    isValidElement(value) ||
    (Array.isArray(value) && value.every(isReactNode))
  );
}
