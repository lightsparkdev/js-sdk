# JS Monorepo

TypeScript monorepo for Lightning Network SDKs and internal applications. Yarn workspaces + Turbo.

## Quick Reference

| Action | Command |
|--------|---------|
| Install | `yarn` |
| Start apps | `yarn start site uma-bridge ops` |
| Build | `yarn build` |
| Test | `yarn test` |
| Lint + format | `yarn lint && yarn format` |
| Full checks | `yarn checks` |
| GraphQL regen | `yarn gql-codegen` |
| Clean all | `yarn clean-all` |

## Structure

```
packages/
  core/           # Auth, utilities
  lightspark-sdk/ # Public Lightning SDK
  ui/             # React components
  private/        # Internal utilities
apps/
  examples/       # Public examples
  private/        # Internal apps (site, ops, uma-bridge)
```

## Workspace Commands

```bash
# Target specific workspace
yarn workspace @lightsparkdev/<name> <command>

# Examples
yarn workspace @lightsparkdev/uma-bridge start
yarn workspace @lightsparkdev/ui test
```

## Code Patterns

### Dependencies
- Use workspace protocol for internal deps: `"@lightsparkdev/ui": "*"`
- Shared configs: `@lightsparkdev/{tsconfig,eslint-config}`

### GraphQL
After Python schema changes:
```bash
yarn gql-codegen                              # All workspaces
yarn workspace @lightsparkdev/uma-bridge gql-codegen  # Specific
```

### Adding Dependencies
```bash
yarn workspace @lightsparkdev/<name> add <package>  # To workspace
yarn add -W <package>                               # Root level
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Import errors | Check deps use `"*"` not versions |
| Type errors after GraphQL | `yarn gql-codegen` |
| Stale builds | `yarn clean-all && yarn build` |
| Cache issues | `yarn build --force` |
