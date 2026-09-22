---
"@lightsparkdev/origin": patch
---

Fix `Radio` and `Checkbox` option styling in field compositions: item labels now use regular weight (400) so options read as body text rather than emphasized, and default-variant `Radio.Group` / `Checkbox.Group` containers carry the same horizontal inset as field label/description text so controls align with the legend above them. Card-variant groups keep the full field width so card borders stay aligned with sibling inputs.
