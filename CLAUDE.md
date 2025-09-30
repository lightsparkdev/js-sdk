# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the JavaScript/TypeScript monorepo for Lightspark's Lightning Network and UMA services. It contains public SDKs, internal applications, and supporting packages using Yarn workspaces and Turbo for build orchestration.

## Main Components

- **packages/** - Shared libraries and public SDKs
  - **core/** - Core utilities and auth providers  
  - **lightspark-sdk/** - Main public Lightning SDK
  - **ui/** - Shared UI components and design system
  - **private/** - Internal utilities and GraphQL clients
- **apps/examples/** - Public example applications and CLI tools
- **apps/private/** - Internal applications (site, ops, uma-bridge, etc.)

## Essential Development Commands

### Install and Setup
```bash
# Use nvm for Node version management
nvm use || nvm install

# Enable and prepare Yarn via corepack  
corepack enable && corepack prepare --activate

# Install all workspace dependencies
yarn
```

### Development
```bash
# Start specific apps (replaces app names with @lightsparkdev/name)
yarn start site uma-bridge ops

# Or use predefined filters
yarn start private     # Start all private apps
yarn start examples    # Start all example apps

# Individual commands
yarn build             # Build all workspaces
yarn dev               # Start dev servers with watchers
yarn test              # Run all tests
yarn lint              # Lint all workspaces
yarn format            # Format code with Prettier
yarn gql-codegen       # Generate GraphQL TypeScript types
yarn checks            # Full validation suite (deps, lint, format, test, circular-deps)
```

### Specific Workspace Commands
```bash
# From root - target specific workspace
yarn workspace @lightsparkdev/uma-bridge start
yarn workspace @lightsparkdev/ui test

# From workspace directory - runs locally
cd apps/private/uma-bridge && yarn start
```

## Architecture Patterns

### Monorepo Structure
- Yarn workspaces with Turbo for build caching and parallelization  
- Package dependencies managed via workspace protocol (`"@lightsparkdev/ui": "*"`)
- Shared configurations via `@lightsparkdev/tsconfig`, `@lightsparkdev/eslint-config`
- Build artifacts cached in `dist/` directories

### GraphQL Integration
- Generated TypeScript types via GraphQL Code Generator
- Schema variants for different API surfaces (internal, third-party, etc.)
- Fragments and operations defined per application
- Real-time subscriptions for transaction updates

### React Applications  
- Vite for bundling and development
- Emotion for CSS-in-JS styling
- React Router for navigation
- React Query for API state management
- Zustand for client state

### Testing Strategy
- Jest for unit/integration testing
- Cypress for E2E testing on applications
- React Testing Library for component testing
- Test configs extend shared base configurations

## Key Configuration Files

- **turbo.json** - Build pipeline, caching, and task dependencies
- **package.json** - Workspace definitions and scripts
- **packages/eslint-config/** - Shared linting rules
- **packages/tsconfig/** - TypeScript configuration presets

## Development Standards

### Code Quality
- ESLint for code standards (extends shared configs)
- Prettier for formatting with import organization
- TypeScript strict mode enabled
- Circular dependency detection via madge

### Build Process  
- Turbo orchestrates builds with proper dependency ordering
- TypeScript builds generate declarations in `dist/`
- Vite applications build to `dist/` with static assets
- Build caching prevents unnecessary rebuilds

### Testing
- Unit tests colocated with source code
- Integration tests in dedicated test directories  
- E2E tests use Cypress with custom commands
- Test files use `.test.ts` or `.spec.ts` extensions

## Common Development Tasks

### Adding New Packages
1. Create in appropriate `packages/` subdirectory
2. Add workspace reference in root `package.json`
3. Set up `package.json` with proper dependencies
4. Configure build scripts in `turbo.json`

### GraphQL Updates
```bash
# After schema changes, regenerate types
yarn gql-codegen

# For specific applications  
yarn workspace @lightsparkdev/uma-bridge gql-codegen
```

### Debugging Build Issues
```bash
# Clean all build artifacts and caches
yarn clean-all

# Force rebuild without cache
yarn build --force

# Reset lockfile (last resort)
yarn clean-resolve
```

### UMA Bridge Specific
- Lint command: `yarn run lint --filter=@lightsparkdev/ui --filter=@lightsparkdev/uma-bridge`
- Uses Vite for development with proxy configuration
- Integrates with multiple payment providers (Plaid, Tazapay, etc.)

## Release Process

Public packages use Changesets for versioning:
1. Changes merged to main trigger Copybara sync to public repo
2. Release PR automatically created/updated  
3. Add changesets via bot comments on Release PR
4. Merge Release PR publishes to npm

Internal packages in `private/` subdirectories are not published publicly.