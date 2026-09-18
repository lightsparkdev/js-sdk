import * as React from "react";

export function wrapTextChildren(children: React.ReactNode, className: string) {
  const wrappedChildren: React.ReactNode[] = [];
  let textChildren: Array<string | number> = [];

  const flushTextChildren = () => {
    if (textChildren.length === 0) {
      return;
    }

    wrappedChildren.push(
      <span key={`text-${wrappedChildren.length}`} className={className}>
        {textChildren}
      </span>,
    );
    textChildren = [];
  };

  React.Children.toArray(children).forEach((child) => {
    if (typeof child === "string" || typeof child === "number") {
      textChildren.push(child);
      return;
    }

    flushTextChildren();
    wrappedChildren.push(child);
  });
  flushTextChildren();

  return wrappedChildren;
}
