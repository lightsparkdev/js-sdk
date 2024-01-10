/* Direct component selectors only work in babel contexts. This is a util to convert the
    component to a string selector for convenience. See LIG-4092 for more details. */
export function select(component: { toString: () => string }) {
  return component.toString();
}
