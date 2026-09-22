---
"@lightsparkdev/origin": patch
---

Quiet placeholder text to `--text-tertiary` in every input component (Input,
Textarea, InputGroup, TextareaGroup, Combobox, Autocomplete, Command,
PhoneInput, OTPField, and Select's `[data-placeholder]` state). Placeholders
previously shared `--text-secondary` with helper text, so sample answers read
as loudly as real guidance; a placeholder is never content, so every component
moves down one step with no exceptions. The color now lives in a single
`input-placeholder` mixin alongside the other input-state mixins.
