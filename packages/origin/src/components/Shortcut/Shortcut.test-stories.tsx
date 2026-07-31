"use client";

import { Shortcut } from "./Shortcut";
import { CentralIcon } from "../Icon";

export function SingleKey() {
  return <Shortcut keys={["⌘"]} />;
}

export function MultipleKeys() {
  return <Shortcut keys={["⌘", "⇧", "K"]} />;
}

export function TwoKeys() {
  return <Shortcut keys={["⌘", "K"]} />;
}

export function CustomClassName() {
  return <Shortcut keys={["⌘"]} className="custom-class" />;
}

export function IconKey() {
  return (
    <Shortcut
      keys={[
        <span key="up" role="img" aria-label="Arrow up">
          <CentralIcon name="IconArrowUp" size={12} />
        </span>,
      ]}
    />
  );
}

export function CommonShortcuts() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Shortcut keys={["⌘", "C"]} />
      <Shortcut keys={["⌘", "V"]} />
      <Shortcut keys={["⌘", "⇧", "P"]} />
      <Shortcut keys={["Ctrl", "Alt", "Del"]} />
    </div>
  );
}
