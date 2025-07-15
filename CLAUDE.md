# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a pnpm-based monorepo using Turborepo for build orchestration. It contains educational tools and content management systems, primarily built with Next.js and React.

## Essential Development Commands

```bash
# Install dependencies (from root)
pnpm install

# Run all apps in development mode
pnpm dev

# Run specific app
pnpm dev --filter=web
pnpm dev --filter=grading

# Build all apps
pnpm build

# Build specific app
pnpm build --filter=web

# Run linting across monorepo
pnpm lint

# Format code with Prettier
pnpm format

# Clean build artifacts
pnpm clean

# Add dependency to specific workspace
pnpm add <package> --filter=web
pnpm add <package> --filter=@bluenote/ui

# Run tests (when available)
pnpm test --filter=<app-name>
```

## High-Level Architecture

### Monorepo Structure
- **apps/**: Individual applications
  - **web**: Main educational website (JavaScript, NextAuth, Supabase, Claude AI integration)
  - **grading**: AI-powered essay assessment system (TypeScript, Supabase/Prisma)
- **packages/**: Shared packages across apps
  - **ui**: Common React components and utilities
  - **auth**: Shared authentication logic
  - **config**: Shared configurations (ESLint, TypeScript, Tailwind)
  - **database**: Database client configurations

### Key Architectural Decisions

1. **Package Management**: Uses pnpm workspaces for efficient dependency management and disk space optimization
2. **Build System**: Turborepo handles build orchestration with intelligent caching
3. **Shared Code**: Common functionality is extracted into packages to avoid duplication
4. **Type Safety**: Mixed approach - web app uses JavaScript, grading app uses TypeScript
5. **Authentication**: Centralized in @bluenote/auth package using NextAuth
6. **Database**: Both apps use Supabase, with grading app also supporting Prisma/SQLite

### Cross-App Dependencies

The apps share dependencies through workspace packages:
- `@bluenote/ui` provides consistent UI components
- `@bluenote/auth` handles authentication across apps
- `@bluenote/config` ensures consistent build configurations

### Environment Configuration

Each app has its own `.env.local` file. Key environment variables are declared in `turbo.json` to ensure proper caching:
- Authentication credentials (NextAuth, Google OAuth)
- Database connections (Supabase, Prisma)
- API keys (Claude/Anthropic)
- Security keys (JWT, encryption)

### Development Workflow

1. **Starting Development**: Run `pnpm dev` from root to start all apps simultaneously
2. **Making Changes**: 
   - App-specific code goes in `apps/<app-name>`
   - Shared code goes in appropriate package under `packages/`
   - Run `pnpm dev --filter=<app>` for focused development
3. **Building**: Use `pnpm build` to build all apps with Turborepo's caching
4. **Deployment**: Each app can be deployed independently to Vercel

### Important Patterns

1. **Monorepo Imports**: Use workspace protocol for internal packages
   ```json
   "@bluenote/ui": "workspace:*"
   ```

2. **Turborepo Pipeline**: Defined in `turbo.json`, ensures correct build order and caching

3. **Configuration Inheritance**: Apps extend base configs from packages:
   - TypeScript: `extends: "@bluenote/config/tsconfig/base.json"`
   - Tailwind: `presets: [require("@bluenote/config/tailwind")]`

### App-Specific Guidance

Each app has its own CLAUDE.md file with detailed instructions:
- **apps/web/CLAUDE.md**: Web app architecture, CMS features, admin system
- **apps/grading/CLAUDE.md**: Grading system architecture, AI evaluation logic

Refer to these files when working on specific apps for detailed implementation guidance.

### Common Tasks

**Adding a new shared component**:
1. Create component in `packages/ui/src/components`
2. Export from `packages/ui/src/index.ts`
3. Import in apps using `@bluenote/ui`

**Adding a new app**:
1. Create new directory under `apps/`
2. Add to `pnpm-workspace.yaml`
3. Configure in `turbo.json`
4. Set up app-specific environment variables

**Updating dependencies**:
1. Use `pnpm update` for minor updates
2. For major updates, update in specific workspace: `pnpm update <package> --filter=<workspace>`
3. Run `pnpm install` after updates to sync lockfile