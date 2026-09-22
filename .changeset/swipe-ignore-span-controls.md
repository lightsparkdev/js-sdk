---
"@lightsparkdev/origin": patch
---

Fix Checkbox, Radio, and Switch being unclickable inside a Drawer. Base UI renders these three controls as a `<span>`, and its swipe-dismiss gesture only skips native interactive elements, so a pointer press on one started a drawer swipe, captured the pointer, and the click never reached the control. All three now set `data-base-ui-swipe-ignore`.
