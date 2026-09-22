---
"@lightsparkdev/origin": patch
---

PhoneInput: the country Select no longer inherits the surrounding Field's form name. A `Field.Root` wrapped around the whole phone input used to propagate the phone `Input`'s `name` onto the Select's hidden serialization input, submitting a duplicate, earlier-in-DOM entry under the phone field's name (so `FormData.get()` returned the country value). `CountrySelect` now establishes its own field boundary; its hidden input is nameless by default and serializes under its own key only when `name` is passed to `CountrySelect`.
