---
"@lightsparkdev/eslint-config": patch
---

Require ESLint 10 and Node ^20.19.0, ^22.13.0, or >=24. ESLint 10's recommended set adds `no-unassigned-vars`, `no-useless-assignment`, and `preserve-caught-error`. `eslint-plugin-react` and `eslint-plugin-jsx-a11y` still cap their ESLint peer range at 9, so npm installs need `--legacy-peer-deps` until they publish ESLint 10 support.
