---
"@lightsparkdev/lightspark-cli": minor
---

- Bolt 12 “Offer” commands

  - Added `create-offer` command to generate a BOLT12 offer, specifying an amount or zero for user-chosen amounts, plus a description.
  - Added `pay-offer` command allowing you to pay a BOLT12 offer from the CLI, with optional fee/timeouts.

- Misc. node usage

  - Polished logic for local vs. remote signing in the new BOLT12 commands.
  - Minor improvements to usage strings and help text.

- General
  - Focus is on new BOLT12 Offer features; the rest is routine housekeeping in `index.ts`.
