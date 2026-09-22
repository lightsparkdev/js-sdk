---
"@lightsparkdev/origin": patch
---

Extend `Command` with controlled input, loading and empty states, drill-in
navigation, cancellable open changes, a `container` prop for custom portal
parents, and default footer hints. The popup now freezes its rendered
content (inert to activation) during the exit transition and resets on
open (notifying `onInputValueChange` when uncontrolled), so closing never
repaints the palette and a reopen that interrupts the exit shows live,
clean state. Improve screen-reader support with persistent
empty/status live regions, explicit dialog and input names (the input
name is customizable via `inputAriaLabel`, independent of the visual
placeholder), and a visually hidden close control. Update its responsive presentation and
add `IconReceiptBill` and `IconArrowCornerDownLeft`.

`Shortcut` keys now accept React nodes for icon-based key hints.
