---
"@lightsparkdev/origin": patch
---

PhoneInput: add `PhoneInput.LockedCountry`, a static leading cap rendered in place of `CountrySelect` when the country cannot be changed. It shows the flag and dial code with no chevron and no interaction states — not a select, not focusable, no popup semantics. Matches the trigger's typography, height, and border treatment, with 12px right padding in place of the trigger's chevron slot.
