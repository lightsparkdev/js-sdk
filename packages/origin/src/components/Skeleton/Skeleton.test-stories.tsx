import * as React from "react";
import { Skeleton } from "./Skeleton";

export function BasicSkeleton() {
  return <Skeleton data-testid="skeleton" style={{ width: 200, height: 20 }} />;
}

export function RefSkeleton() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [tag, setTag] = React.useState("");
  React.useEffect(() => {
    if (ref.current) setTag(ref.current.tagName);
  }, []);
  return (
    <>
      <Skeleton
        ref={ref}
        data-testid="skeleton"
        style={{ width: 100, height: 16 }}
      />
      <span data-testid="tag">{tag}</span>
    </>
  );
}

export function CircleSkeleton() {
  return (
    <Skeleton
      data-testid="skeleton"
      style={{
        width: 48,
        height: 48,
        borderRadius: "var(--corner-radius-round)",
      }}
    />
  );
}

export function CustomClassSkeleton() {
  return (
    <Skeleton
      data-testid="skeleton"
      className="custom-class"
      style={{ width: 100, height: 16 }}
    />
  );
}

export function GroupedSkeletons() {
  return (
    <Skeleton.Group data-testid="group">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Skeleton
          data-testid="skeleton-circle"
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--corner-radius-round)",
            flexShrink: 0,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Skeleton
            data-testid="skeleton-line1"
            style={{ width: 150, height: 16 }}
          />
          <Skeleton
            data-testid="skeleton-line2"
            style={{ width: 100, height: 16 }}
          />
        </div>
      </div>
    </Skeleton.Group>
  );
}
