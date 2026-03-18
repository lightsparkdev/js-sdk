"use client";

import * as React from "react";
import { TextareaGroup } from "./";

// Minimal chip for testing (avoids Chip dependency)
function TestChip({
  children,
  onDismiss,
}: {
  children: string;
  onDismiss?: () => void;
}) {
  return (
    <span data-testid="chip">
      {children}
      {onDismiss && (
        <button
          type="button"
          aria-label={`Remove ${children}`}
          onClick={onDismiss}
        >
          x
        </button>
      )}
    </span>
  );
}

// Minimal icon button for testing
function IconButton({
  label,
  ...props
}: { label: string } & React.ComponentPropsWithoutRef<"button">) {
  return (
    <button type="button" aria-label={label} {...props}>
      +
    </button>
  );
}

// Default: textarea only
export function Default() {
  return (
    <TextareaGroup.Root>
      <TextareaGroup.Textarea placeholder="Write a message..." />
    </TextareaGroup.Root>
  );
}

// With header chips
export function WithHeader() {
  return (
    <TextareaGroup.Root>
      <TextareaGroup.Header>
        <TestChip>tag-1</TestChip>
        <TestChip>tag-2</TestChip>
      </TextareaGroup.Header>
      <TextareaGroup.Textarea placeholder="Write a message..." />
    </TextareaGroup.Root>
  );
}

// With footer
export function WithFooter() {
  return (
    <TextareaGroup.Root>
      <TextareaGroup.Textarea placeholder="Write a message..." />
      <TextareaGroup.Footer>
        <div>
          <IconButton label="Add attachment" />
        </div>
        <div>
          <button type="button">Send</button>
        </div>
      </TextareaGroup.Footer>
    </TextareaGroup.Root>
  );
}

// Full composer: header + textarea + footer
export function FullComposer() {
  return (
    <TextareaGroup.Root>
      <TextareaGroup.Header>
        <TestChip>tag-1</TestChip>
        <TestChip>tag-2</TestChip>
      </TextareaGroup.Header>
      <TextareaGroup.Textarea placeholder="Write a message..." />
      <TextareaGroup.Footer>
        <div>
          <IconButton label="Add attachment" />
          <TestChip>label</TestChip>
        </div>
        <div>
          <button type="button">Send</button>
        </div>
      </TextareaGroup.Footer>
    </TextareaGroup.Root>
  );
}

// With max height
export function WithMaxHeight() {
  return (
    <TextareaGroup.Root maxHeight={200}>
      <TextareaGroup.Textarea
        placeholder="Write a message..."
        defaultValue={"Line\n".repeat(20)}
      />
      <TextareaGroup.Footer>
        <div />
        <div>
          <button type="button">Send</button>
        </div>
      </TextareaGroup.Footer>
    </TextareaGroup.Root>
  );
}

// Disabled state
export function Disabled() {
  return (
    <TextareaGroup.Root disabled>
      <TextareaGroup.Header>
        <TestChip>tag-1</TestChip>
      </TextareaGroup.Header>
      <TextareaGroup.Textarea placeholder="Write a message..." />
      <TextareaGroup.Footer>
        <div />
        <div>
          <button type="button">Send</button>
        </div>
      </TextareaGroup.Footer>
    </TextareaGroup.Root>
  );
}

// Invalid state
export function Invalid() {
  return (
    <TextareaGroup.Root invalid>
      <TextareaGroup.Textarea
        placeholder="Write a message..."
        defaultValue="Bad content"
      />
    </TextareaGroup.Root>
  );
}

// Controlled
export function Controlled() {
  const [value, setValue] = React.useState("");
  return (
    <div>
      <TextareaGroup.Root>
        <TextareaGroup.Textarea
          value={value}
          onChange={(e) => setValue((e.target as HTMLTextAreaElement).value)}
          placeholder="Type here"
        />
      </TextareaGroup.Root>
      <span data-testid="value">{value}</span>
    </div>
  );
}

// Conformance: Root
export function ConformanceRoot(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <TextareaGroup.Root data-testid="test-root" {...props}>
      <TextareaGroup.Textarea placeholder="Test" />
    </TextareaGroup.Root>
  );
}

// Conformance: Header
export function ConformanceHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <TextareaGroup.Root>
      <TextareaGroup.Header data-testid="test-root" {...props}>
        <TestChip>tag</TestChip>
      </TextareaGroup.Header>
      <TextareaGroup.Textarea placeholder="Test" />
    </TextareaGroup.Root>
  );
}

// Conformance: Textarea
export function ConformanceTextarea(
  props: React.ComponentPropsWithoutRef<"textarea">,
) {
  return (
    <TextareaGroup.Root>
      <TextareaGroup.Textarea
        data-testid="test-root"
        placeholder="Test"
        {...props}
      />
    </TextareaGroup.Root>
  );
}

// Conformance: Footer
export function ConformanceFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <TextareaGroup.Root>
      <TextareaGroup.Textarea placeholder="Test" />
      <TextareaGroup.Footer data-testid="test-root" {...props}>
        <div>Footer content</div>
      </TextareaGroup.Footer>
    </TextareaGroup.Root>
  );
}
