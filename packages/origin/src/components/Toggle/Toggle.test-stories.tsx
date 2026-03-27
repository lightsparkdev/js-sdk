"use client";

import * as React from "react";
import { Toggle } from "./Toggle";
import { ToggleGroup } from "./Toggle";

// --- Toggle stories ---

export function TestToggleDefault() {
  return <Toggle data-testid="toggle" aria-label="Favorite" />;
}

export function TestToggleWithLabel() {
  return (
    <Toggle data-testid="toggle" aria-label="Favorite">
      Favorite
    </Toggle>
  );
}

export function TestToggleDefaultPressed() {
  return (
    <Toggle data-testid="toggle" defaultPressed aria-label="Favorite">
      Favorite
    </Toggle>
  );
}

export function TestToggleControlled() {
  const [pressed, setPressed] = React.useState(false);
  return (
    <div>
      <button data-testid="press-btn" onClick={() => setPressed(true)}>
        Press
      </button>
      <button data-testid="unpress-btn" onClick={() => setPressed(false)}>
        Unpress
      </button>
      <Toggle
        data-testid="toggle"
        pressed={pressed}
        onPressedChange={setPressed}
        aria-label="Favorite"
      >
        Favorite
      </Toggle>
    </div>
  );
}

export function TestToggleDisabled() {
  return (
    <Toggle data-testid="toggle" disabled aria-label="Favorite">
      Favorite
    </Toggle>
  );
}

export function TestTogglePressedDisabled() {
  return (
    <Toggle data-testid="toggle" defaultPressed disabled aria-label="Favorite">
      Favorite
    </Toggle>
  );
}

// --- ToggleGroup stories ---

export function TestToggleGroupDefault() {
  return (
    <ToggleGroup data-testid="group">
      <Toggle data-testid="toggle-a" value="a" aria-label="Option A">
        A
      </Toggle>
      <Toggle data-testid="toggle-b" value="b" aria-label="Option B">
        B
      </Toggle>
      <Toggle data-testid="toggle-c" value="c" aria-label="Option C">
        C
      </Toggle>
    </ToggleGroup>
  );
}

export function TestToggleGroupDefaultValue() {
  return (
    <ToggleGroup data-testid="group" defaultValue={["b"]}>
      <Toggle data-testid="toggle-a" value="a" aria-label="Option A">
        A
      </Toggle>
      <Toggle data-testid="toggle-b" value="b" aria-label="Option B">
        B
      </Toggle>
      <Toggle data-testid="toggle-c" value="c" aria-label="Option C">
        C
      </Toggle>
    </ToggleGroup>
  );
}

export function TestToggleGroupControlled() {
  const [value, setValue] = React.useState<string[]>([]);
  return (
    <div>
      <button data-testid="select-b" onClick={() => setValue(["b"])}>
        Select B
      </button>
      <button data-testid="clear" onClick={() => setValue([])}>
        Clear
      </button>
      <ToggleGroup data-testid="group" value={value} onValueChange={setValue}>
        <Toggle data-testid="toggle-a" value="a" aria-label="Option A">
          A
        </Toggle>
        <Toggle data-testid="toggle-b" value="b" aria-label="Option B">
          B
        </Toggle>
      </ToggleGroup>
    </div>
  );
}

export function TestToggleGroupMultiple() {
  return (
    <ToggleGroup data-testid="group" multiple>
      <Toggle data-testid="toggle-a" value="a" aria-label="Option A">
        A
      </Toggle>
      <Toggle data-testid="toggle-b" value="b" aria-label="Option B">
        B
      </Toggle>
      <Toggle data-testid="toggle-c" value="c" aria-label="Option C">
        C
      </Toggle>
    </ToggleGroup>
  );
}

export function TestToggleGroupDisabled() {
  return (
    <ToggleGroup data-testid="group" disabled>
      <Toggle data-testid="toggle-a" value="a" aria-label="Option A">
        A
      </Toggle>
      <Toggle data-testid="toggle-b" value="b" aria-label="Option B">
        B
      </Toggle>
    </ToggleGroup>
  );
}

export function TestToggleGroupKeyboard() {
  return (
    <ToggleGroup data-testid="group">
      <Toggle data-testid="toggle-a" value="a" aria-label="Option A">
        A
      </Toggle>
      <Toggle data-testid="toggle-b" value="b" aria-label="Option B">
        B
      </Toggle>
      <Toggle data-testid="toggle-c" value="c" aria-label="Option C">
        C
      </Toggle>
    </ToggleGroup>
  );
}
