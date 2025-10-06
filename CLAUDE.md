# CLAUDE.md

This file provides guidance to Claude Code when working in the js/ directory.

## Overview

JavaScript/TypeScript monorepo for Lightspark's Lightning Network and UMA services. Public SDKs, internal applications, and shared packages using Yarn workspaces + Turbo.

## Structure

- **packages/** - Shared libraries
  - **core/** - Auth, utilities
  - **lightspark-sdk/** - Public Lightning SDK
  - **ui/** - React components, design system
  - **private/** - Internal utilities, GraphQL clients
- **apps/examples/** - Public examples and CLI tools
- **apps/private/** - Internal apps (site, ops, uma-bridge)

## Essential Commands

### Setup
```bash
nvm use || nvm install  # Match Node version
corepack enable && corepack prepare --activate  # Enable Yarn
yarn  # Install all workspace dependencies
```

### Development Workflow
```bash
# Start applications
yarn start site uma-bridge ops  # Specific apps (@lightsparkdev/ prefix implied)
yarn start private              # All private apps
yarn start examples             # All examples

# Code quality
yarn lint && yarn format        # Lint + Prettier
yarn checks                     # Full validation: deps, lint, format, test, circular-deps

# Building
yarn build                      # Build all workspaces with Turbo caching
yarn build --force              # Rebuild without cache

# Testing
yarn test                       # Run all tests
yarn workspace @lightsparkdev/ui test  # Test specific workspace

# GraphQL codegen
yarn gql-codegen                # Regenerate TypeScript types from schemas
```

### Workspace Targeting
```bash
# From repo root
yarn workspace @lightsparkdev/<name> <command>

# From workspace directory
cd apps/private/uma-bridge && yarn start
```

## Architecture & Patterns

### Monorepo Management
- **Yarn workspaces** with workspace protocol (`"@lightsparkdev/ui": "*"`)
- **Turbo** orchestrates builds with caching and parallelization
- Shared configs: `@lightsparkdev/{tsconfig,eslint-config}`
- Build artifacts in `dist/`, ignored by git

### GraphQL
- TypeScript types auto-generated via GraphQL Code Generator
- Schema variants per API surface (internal, third-party)
- Fragments/operations defined per app
- Real-time subscriptions for transaction updates
- **After Python schema changes**: run `yarn gql-codegen` from root

### React Stack
- **Vite** - Dev server and bundler
- **Emotion** - CSS-in-JS styling
- **React Router** - Navigation
- **React Query** - Server state
- **Zustand** - Client state

### Testing
- **Jest** - Unit/integration tests
- **React Testing Library** - Component tests
- **Cypress** - E2E tests
- Tests colocated with source (`.test.ts`, `.spec.ts`)

## Configuration Files

- **turbo.json** - Build pipeline, task dependencies, caching
- **package.json** (root) - Workspace definitions, scripts
- **packages/eslint-config/** - Shared linting rules
- **packages/tsconfig/** - TypeScript presets

## Code Standards

- **TypeScript strict mode** enabled
- **ESLint** extends shared configs
- **Prettier** with import organization
- **Circular dependency detection** via madge
- **Prefer Edit tool** over inline rewrites for existing code

## Common Task Workflows

### Adding New Package
1. Create directory in `packages/` or `apps/`
2. Add workspace reference in root `package.json`
3. Create `package.json` with dependencies (use workspace protocol for internal deps)
4. Add build config to `turbo.json` if needed
5. Run `yarn` to link workspace

### GraphQL Type Updates
After Python backend schema changes:
```bash
yarn gql-codegen  # All workspaces
yarn workspace @lightsparkdev/uma-bridge gql-codegen  # Specific app
```

### Debugging Build Issues
```bash
yarn clean-all         # Remove dist/ and caches
yarn build --force     # Bypass Turbo cache
yarn clean-resolve     # Nuclear option: reset lockfile
```

### UMA Bridge Development
```bash
# Lint bridge + UI package
yarn run lint --filter=@lightsparkdev/ui --filter=@lightsparkdev/uma-bridge

# Start with Vite dev server (proxy configured for backend)
yarn workspace @lightsparkdev/uma-bridge start
```

Integrates with: Plaid, Tazapay, Striga, other payment providers

### Adding Dependencies
```bash
# Workspace-specific
yarn workspace @lightsparkdev/<name> add <package>

# Root-level (affects all workspaces)
yarn add -W <package>
```

## Release Process

**Public packages** (SDK, core utilities):
- Changesets for version management
- Copybara syncs to public repo on main merge
- Release PR auto-created
- Merge Release PR → npm publish

**Private packages** (`packages/private/`, `apps/private/`):
- Not published to npm
- Versioned internally only

## Troubleshooting

**Import errors**: Check workspace dependencies use `"*"` not version numbers
**Type errors after GraphQL changes**: Run `yarn gql-codegen`
**Stale build artifacts**: `yarn clean-all && yarn build`
**Turbo cache issues**: Add `--force` flag to bypass cache