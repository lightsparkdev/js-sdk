# @lightsparkdev/eslint-config

## 0.0.2

### Patch Changes

- d518fb7: Require ESLint 10 and Node ^20.19.0, ^22.13.0, or >=24. ESLint 10's recommended set adds `no-unassigned-vars`, `no-useless-assignment`, and `preserve-caught-error`. `eslint-plugin-react` and `eslint-plugin-jsx-a11y` still cap their ESLint peer range at 9, so npm installs need `--legacy-peer-deps` until they publish ESLint 10 support.

## 0.0.1

### Patch Changes

- 062bf8a: [js] Add engines field to all packages to indicate supported NodeJS versions
