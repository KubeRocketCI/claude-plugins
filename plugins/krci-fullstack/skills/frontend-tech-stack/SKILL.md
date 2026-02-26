---
name: Frontend Tech Stack
description: This skill should be used when the user asks about "tech stack", "what framework", "what libraries", "monorepo structure", "project architecture", "authentication system", or needs context about the KubeRocketCI portal's technology choices, dependencies, or architectural organization.
version: 0.1.0
---

Understand the KubeRocketCI portal's comprehensive technology stack, monorepo architecture, and authentication system to make informed implementation decisions.

## Purpose

Provide essential context about the portal's technical foundation including frontend/backend frameworks, monorepo organization, import patterns, and authentication flow. Use this knowledge to align new implementations with existing architectural patterns.

## Tech Stack Overview

### Frontend Stack (`apps/client/`)

**Core Framework**:

- React + TypeScript + Vite for UI development with fast builds
- TanStack Router for file-based, type-safe routing
- TanStack React Query for server state management and caching
- tRPC Client for type-safe API communication

**State & Forms**:

- TanStack Form with custom `useAppForm` hook for type-safe forms (see form-patterns skill)
- Zustand for lightweight client-side UI state

**Styling & UI**:

- Radix UI + TailwindCSS for components and styling
- shadcn/ui-style component primitives in `@/core/components/ui/`
- class-variance-authority (CVA) for variant management
- Lucide React for icons

**Testing**: Vitest with React Testing Library

### Backend Stack (`apps/server/`)

**Core Framework**:

- Fastify + TypeScript for high-performance server
- tRPC Server for type-safe API endpoints
- better-sqlite3 for session storage
- esbuild for fast compilation

**Integration**:

- OIDC for Keycloak authentication
- WebSocket for real-time Kubernetes resource watching

**Testing**: Vitest

### Shared Package (`packages/shared/`)

**Purpose**: Common code and models used by both client and server

**Contains**:

- TypeScript types and Zod validation schemas
- K8s Resource Configs with typed definitions
- Draft Creators for K8s resource creation utilities
- Mutual models for authentication, user data, common types
- Constants and shared enums

## Monorepo Architecture

### Architecture Blocks

**Client (`apps/client/`)**: Frontend codebase

- React components and pages
- UI state management and interactions
- Styling and visual components
- Client-specific utilities

**Server (`apps/server/`)**: Backend for Frontend (BFF)

- tRPC API endpoints
- Authentication and session management
- Kubernetes API integration
- Data transformation and validation
- WebSocket connections for real-time updates

**Shared (`packages/shared/`)**: Common code

- Authentication models
- User-related types
- K8s business models and schemas
- Validation schemas
- Shared utilities and constants

### Package Manager

Always use **pnpm** as the primary package manager for this monorepo.

## Critical Import Patterns

### Rule: Check tsconfig Before Imports

Always verify each project's `tsconfig.json` for correct import path configuration before writing imports.

### Correct Import Patterns

**Project-Internal Aliases** (Use these):

```typescript
// In client code
import { Button } from "@/core/components/ui/Button";
import { useAuth } from "@/core/auth/hooks/useAuth";

// In server code
import { createTRPCRouter } from "@/trpc/utils/createTRPCRouter";
import { authMiddleware } from "@/middleware/auth";
```

**Cross-Package Imports** (For shared package):

```typescript
// From client or server to shared
import { K8sResourceConfig, createCodebaseDraft } from "@my-project/shared";
import { k8sCodebaseConfig, CodebaseDraft } from "@my-project/shared";
```

**Never Use Root Project Name** (Avoid):

```typescript
// DON'T DO THIS
import { Button } from "krci-portal/apps/client/src/core/components/ui/Button";
```

## Code Separation Rules

### Strict Domain Boundaries

Place code in the appropriate block based on intended usage:

**Shared Package Criteria** - Use `shared/` if code is used by both client and server:

```typescript
// Shared: Used by both client and server
export const getPipelineRunStatus = (pipelineRun: PipelineRun): PipelineRunStatus => {
  return pipelineRun.status?.conditions?.[0]?.type || "Unknown";
};
```

**Client-Only Code** - Use `client/` for UI/UX specific logic:

```typescript
// Client-only: React component
export const PipelineRunStatus: React.FC<Props> = ({ pipelineRun }) => {
  const Icon = getPipelineRunStatusIcon(getPipelineRunStatus(pipelineRun));
  return <Icon />;
};
```

**Server-Only Code** - Use `server/` for backend logic, API endpoints, authentication.

## Authentication System

### Architecture Components

**Backend Stack**:

- Keycloak: Primary user management and identity provider
- openid-client: OAuth provider connectivity
- OIDCClient: Custom wrapper with simplified interface
- tRPC Procedures: Authenticated endpoints

**Frontend Stack**:

- Login Page: Initiates OAuth authorization flow
- Login Callback Page: Handles OAuth callback and token exchange
- Session Management: HTTP-only cookie-based sessions

### Authentication Flow

1. **Login Initiation**: User requests auth URL from backend
2. **OAuth Authorization**: User redirected to Keycloak for credentials
3. **Token Exchange**: Backend exchanges code for tokens and creates session
4. **Subsequent Requests**: All API calls include sessionId cookie for validation

### Security Features

- HTTP-only Cookies prevent XSS attacks
- Session Database for centralized management (SQLite)
- Token Refresh for automatic renewal
- Secure Token Storage server-side (not in browser)

## Version Management

**Critical Rule**: Always check `package.json` files for actual dependency versions before code generation.

```bash
cat apps/client/package.json | grep -A 20 "dependencies"
cat apps/server/package.json | grep -A 20 "dependencies"
```

Verify versions match before implementing features to ensure compatibility.

## When to Use This Skill

Load this skill when:

- Starting new feature implementation to understand stack context
- Making architectural decisions about code placement
- Determining correct import patterns
- Understanding authentication integration points
- Verifying technology choices align with portal standards

## Additional Resources

### Reference Files

For detailed patterns and guidelines, consult:

- **`references/monorepo-patterns.md`** - Comprehensive monorepo organization, barrel exports, import patterns
- **`references/auth-integration.md`** - Detailed authentication flow and integration points

These references provide in-depth guidance for specific scenarios while keeping this core skill focused on essential context.
