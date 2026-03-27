import { Button } from "./Button";

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M10 12L6 8L10 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M6 12L10 8L6 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 2v12M2 8h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export function FilledButton() {
  return <Button variant="filled">Click me</Button>;
}

export function OutlineButton() {
  return <Button variant="outline">Click me</Button>;
}

export function GhostButton() {
  return <Button variant="ghost">Click me</Button>;
}

export function CriticalButton() {
  return <Button variant="critical">Delete</Button>;
}

export function LinkButton() {
  return <Button variant="link">Learn more</Button>;
}

export function DisabledLinkButton() {
  return (
    <Button variant="link" disabled>
      Learn more
    </Button>
  );
}

export function SecondaryButton() {
  return <Button variant="secondary">Click me</Button>;
}

export function DisabledSecondaryButton() {
  return (
    <Button variant="secondary" disabled>
      Disabled
    </Button>
  );
}

export function DisabledButton() {
  return <Button disabled>Disabled</Button>;
}

export function DisabledOutlineButton() {
  return (
    <Button variant="outline" disabled>
      Disabled
    </Button>
  );
}

export function LoadingButton() {
  return <Button loading>Loading</Button>;
}

export function AllSizes() {
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Button size="compact">Compact</Button>
      <Button size="default">Default</Button>
    </div>
  );
}

export function IconOnlyButton() {
  return <Button iconOnly aria-label="Add item" leadingIcon={<PlusIcon />} />;
}

export function IconOnlyButtonWithChildren() {
  return (
    <Button iconOnly aria-label="Add item">
      <PlusIcon />
    </Button>
  );
}

export function ButtonWithLeadingIcon() {
  return <Button leadingIcon={<ChevronLeft />}>Back</Button>;
}

export function ButtonWithTrailingIcon() {
  return <Button trailingIcon={<ChevronRight />}>Next</Button>;
}

export function ButtonWithBothIcons() {
  return (
    <Button leadingIcon={<ChevronLeft />} trailingIcon={<ChevronRight />}>
      Navigate
    </Button>
  );
}
