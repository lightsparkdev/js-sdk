---
"@lightsparkdev/origin": patch
---

Add consumer-supplied DatePicker presets, explicit mode and granularity props, controlled partial-range previews, and opt-in FilterBar integration. Presets provide isolated typeahead text and optional disabled reasons. Invalid preset or typed drafts participate in form validity, preserve inline errors until replaced, and expose first-invalid focus actions for composed Apply boundaries. Calendar keyboard navigation now skips unavailable dates and preserves one visible roving tab stop. Direct DatePicker consumers configure mode and granularity through Root props, while FilterBar descriptors declare one fixed editor shape without runtime switches. Canonical compositions place the calendar first, date-time input rows let date fields fill while localized time fields stay compact, and UTC date-time inputs show an inline timezone suffix.
