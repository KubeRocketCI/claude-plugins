# Monorepo Patterns and Organization

Comprehensive guide to monorepo architecture, code organization, import patterns, and barrel export strategies for the KubeRocketCI portal.

## Monorepo Structure

```
portal/
├── apps/
│   ├── client/          # Frontend application
│   └── server/          # Backend for Frontend (BFF)
├── packages/
│   └── shared/          # Common code and models
└── package.json         # Root configuration
```

## Shared Package Structure

```
packages/shared/
├── src/
│   ├── models/
│   │   ├── auth/          # Authentication models
│   │   ├── user/          # User-related types
│   │   └── k8s/           # Kubernetes business models
│   │       ├── groups/    # Resource group definitions
│   │       └── core/      # Core K8s types and schemas
│   ├── utils/             # Shared utility functions
│   ├── constants/         # Application constants
│   └── schemas/           # Validation schemas (Zod)
└── package.json
```

### Shared Package Contents

**Mutual Models**:

- Authentication types and interfaces
- User data structures
- Common application types

**K8s Business Models**:

- Resource configurations (`K8sResourceConfig`)
- Schema definitions with Zod
- Label selectors and filters
- Resource group definitions

**Draft Creators**:

- Utility functions for creating K8s resource drafts
- Pre-configured templates for common resources
- Type-safe draft generation

**Validation Schemas**:

- Zod schemas for data validation
- Input validation for forms and APIs
- Type inference from schemas

**Constants**:

- API versions for K8s resources
- Operation types and enums
- Shared configuration values

## Import Path Patterns

### TypeScript Path Mapping

Each application has its own path mapping configuration in `tsconfig.json`:

**Client tsconfig.json**:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@my-project/shared": ["../../packages/shared/src"]
    }
  }
}
```

**Server tsconfig.json**:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@my-project/shared": ["../../packages/shared/src"]
    }
  }
}
```

### Import Pattern Examples

**Internal Imports (within client)**:

```typescript
// Component imports
import { Button } from "@/core/components/ui/Button";
import { DataTable } from "@/core/components/tables/DataTable";

// Hook imports
import { useAuth } from "@/core/auth/hooks/useAuth";
import { usePermissions } from "@/core/permissions/hooks/usePermissions";

// Utility imports
import { formatDate } from "@/core/utils/formatters";
import { validateEmail } from "@/core/utils/validation";

// Module-specific imports
import { CodebaseList } from "@/modules/codebase/components/CodebaseList";
import { useCodebase } from "@/modules/codebase/hooks/useCodebase";
```

**Internal Imports (within server)**:

```typescript
// tRPC router imports
import { createTRPCRouter } from "@/trpc/utils/createTRPCRouter";
import { publicProcedure } from "@/trpc/procedures/publicProcedure";

// Middleware imports
import { authMiddleware } from "@/middleware/auth";
import { sessionMiddleware } from "@/middleware/session";

// Service imports
import { k8sService } from "@/services/k8s";
import { authService } from "@/services/auth";
```

**Cross-Package Imports (shared package)**:

```typescript
// From client or server
import {
  K8sResourceConfig,
  createCodebaseDraft,
  k8sCodebaseConfig,
  CodebaseDraft
} from "@my-project/shared";

// Specific model imports
import { User, AuthTokens } from "@my-project/shared";
import { PipelineRun, PipelineRunStatus } from "@my-project/shared";

// Schema imports
import { codebaseSchema, pipelineRunSchema } from "@my-project/shared";
```

## Code Placement Guidelines

### Decision Tree: Where Should Code Go?

**Question 1**: Is the code used by both client AND server?

- **Yes** → Place in `packages/shared/`
- **No** → Go to Question 2

**Question 2**: Does the code contain UI/React components?

- **Yes** → Place in `apps/client/`
- **No** → Go to Question 3

**Question 3**: Does the code handle API endpoints or server logic?

- **Yes** → Place in `apps/server/`
- **No** → Re-evaluate if it should be in shared

### Examples by Category

**Shared Package Examples**:

```typescript
// Type definitions used by both
export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// Business logic functions (no UI)
export const getPipelineRunStatus = (pipelineRun: PipelineRun): PipelineRunStatus => {
  return pipelineRun.status?.conditions?.[0]?.type || "Unknown";
};

// K8s resource configuration
export const k8sPipelineRunConfig = {
  apiVersion: "tekton.dev/v1beta1",
  kind: "PipelineRun",
  group: "tekton.dev",
  version: "v1beta1",
  plural: "pipelineruns",
} as const satisfies K8sResourceConfig;

// Validation schema
export const codebaseSchema = z.object({
  name: z.string().min(1),
  gitUrl: z.string().url(),
  branch: z.string().optional(),
});
```

**Client-Only Examples**:

```typescript
// React component
export const PipelineRunStatus: React.FC<Props> = ({ pipelineRun }) => {
  const status = getPipelineRunStatus(pipelineRun);
  const Icon = getStatusIcon(status);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Icon />
      <Typography>{status}</Typography>
    </Box>
  );
};

// UI-specific utility
export const getPipelineRunStatusIcon = (status: PipelineRunStatus): React.ComponentType => {
  switch (status) {
    case "Running": return RunningIcon;
    case "Failed": return ErrorIcon;
    case "Succeeded": return CheckIcon;
    default: return UnknownIcon;
  }
};

// Custom hook with React Query
export const usePipelineRuns = () => {
  const trpc = useTRPC();
  return trpc.pipelineRuns.list.useQuery();
};
```

**Server-Only Examples**:

```typescript
// tRPC router
export const pipelineRunRouter = createTRPCRouter({
  list: publicProcedure
    .query(async ({ ctx }) => {
      const runs = await k8sService.listPipelineRuns();
      return runs;
    }),

  create: protectedProcedure
    .input(codebaseSchema)
    .mutation(async ({ ctx, input }) => {
      const run = await k8sService.createPipelineRun(input);
      return run;
    }),
});

// Kubernetes service
export class K8sService {
  async listPipelineRuns(): Promise<PipelineRun[]> {
    // Implementation
  }
}

// Authentication middleware
export const authMiddleware = async (req, res, next) => {
  // Validate session, attach user to context
};
```

## Barrel Export Patterns

### When to Use Barrel Exports

Barrel exports (`export * from` in `index.ts`) are appropriate when the folder represents a cohesive unit consumed as a whole.

#### Appropriate: Shared Packages

Packages define public APIs consumed by multiple apps:

```typescript
// packages/shared/src/index.ts
export * from "./models/k8s";
export * from "./models/auth";
export * from "./models/user";
export * from "./utils";
export * from "./constants";
export * from "./schemas";
```

**Why**: External consumers (`apps/client/`, `apps/server/`) import from the package as a unit, not individual files.

#### Appropriate: K8s API Resource Folders

Each K8s resource folder is a cohesive unit with hooks and utilities used together:

```typescript
// k8s/api/groups/KRCI/Codebase/index.ts
export * from "./hooks";      // useWatchItem, useWatchList, etc.
export * from "./utils";      // getStatusIcon, formatters
export * from "./types";      // TypeScript interfaces

// Usage - consumers import the resource as a unit
import {
  useCodebaseWatchList,
  getCodebaseStatusIcon,
  Codebase
} from "@/k8s/api/groups/KRCI/Codebase";
```

**Why**: Resources are self-contained units with related functionality that's typically used together.

### When NOT to Use Barrel Exports

#### Inappropriate: Convenience Re-exports in Hook Files

Do not re-export unrelated modules from a hook or component file:

```typescript
// DON'T: Re-export from a hook file
// modules/platform/tekton/hooks/usePipelineMetrics/index.tsx
export const usePipelineMetrics = () => { ... };
export * from "./filters";  // Bad - mixing concerns
export * from "./utils";    // Bad - creates implicit dependencies

// DO: Keep exports focused
// modules/platform/tekton/hooks/usePipelineMetrics/index.tsx
export const usePipelineMetrics = () => { ... };

// Consumer imports what they need directly:
import { usePipelineMetrics } from "@/modules/platform/tekton/hooks/usePipelineMetrics";
import { buildPipelineFilter } from "@/modules/platform/tekton/hooks/usePipelineMetrics/filters";
```

**Why**: Mixing concerns, breaks tree-shaking, hides import origins.

#### Inappropriate: Deep Re-exports Across Module Boundaries

Do not re-export from parent folders to create shortcuts:

```typescript
// DON'T: modules/platform/tekton/index.ts
export * from "./components";
export * from "./hooks";
export * from "./utils";

// DO: Import from specific locations
import { PipelineRunList } from "@/modules/platform/tekton/components/PipelineRunList";
import { usePipelineRuns } from "@/modules/platform/tekton/hooks/usePipelineRuns";
```

**Why**: Creates import shortcuts that hide actual code location, makes refactoring harder.

### Barrel Export Decision Matrix

| Location | Appropriate? | Reason |
|----------|--------------|--------|
| `packages/shared/` | Yes | Public API for multiple consumers |
| `packages/trpc/` | Yes | Public API for multiple consumers |
| `k8s/api/groups/{Resource}/` | Yes | Resource is a cohesive unit |
| Hook file re-exporting utilities | No | Mixing concerns, breaks tree-shaking |
| Module root aggregating subfolders | No | Creates shortcuts, hides origins |
| Component folder with single component | No | Single file, no need for barrel |
| Utility folder with related functions | Maybe | Only if functions are always used together |

## Monorepo Best Practices

### Dependency Management

**Shared Dependencies**: Place common dependencies in root `package.json`:

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^0.34.0"
  }
}
```

**App-Specific Dependencies**: Place in app's `package.json`:

```json
// apps/client/package.json
{
  "dependencies": {
    "react": "^18.2.0",
    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-dialog": "^1.1.4",
    "tailwindcss": "^4.0.8",
    "class-variance-authority": "^0.7.1"
  }
}
```

### TypeScript Configuration

**Root tsconfig.json**: Shared base configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true
  }
}
```

**App tsconfig.json**: Extends root with app-specific paths

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@my-project/shared": ["../../packages/shared/src"]
    }
  }
}
```

### Code Organization Principles

1. **Single Source of Truth**: Types and interfaces live in one place (usually shared)
2. **Clear Boundaries**: UI logic in client, API logic in server, common logic in shared
3. **Minimal Coupling**: Apps depend on shared, but not on each other
4. **Explicit Imports**: Use full paths, avoid deep barrel exports
5. **Type Safety**: Leverage TypeScript path mapping for compile-time validation

## Common Anti-Patterns to Avoid

### Anti-Pattern 1: Circular Dependencies

**Don't**:

```typescript
// apps/client/src/utils/index.ts
import { formatDate } from "@my-project/shared";

// packages/shared/src/utils/index.ts
import { formatComponent } from "krci-portal/apps/client/src/utils";  // Circular!
```

**Do**:

```typescript
// Keep dependencies unidirectional: client/server → shared, never reverse
```

### Anti-Pattern 2: Client Code in Shared

**Don't**:

```typescript
// packages/shared/src/components/Button.tsx  ← React component in shared!
import React from 'react';
export const Button: React.FC = () => <button>Click</button>;
```

**Do**:

```typescript
// apps/client/src/core/components/ui/Button.tsx  ← React in client only
import React from 'react';
export const Button: React.FC = () => <button>Click</button>;
```

### Anti-Pattern 3: Server Code in Client

**Don't**:

```typescript
// apps/client/src/services/k8s.ts  ← Direct K8s API calls in client!
import { KubeConfig } from '@kubernetes/client-node';
export const listPods = async () => { /* ... */ };
```

**Do**:

```typescript
// apps/client/src/hooks/usePods.ts  ← Use tRPC to call server
export const usePods = () => {
  const trpc = useTRPC();
  return trpc.k8s.listPods.useQuery();
};

// apps/server/src/routers/k8s.ts  ← K8s logic on server
export const k8sRouter = createTRPCRouter({
  listPods: protectedProcedure.query(async () => { /* ... */ }),
});
```

### Anti-Pattern 4: Root Project Imports

**Don't**:

```typescript
import { Button } from "krci-portal/apps/client/src/core/components/ui/Button";
import { authMiddleware } from "krci-portal/apps/server/src/middleware/auth";
```

**Do**:

```typescript
// Within client
import { Button } from "@/core/components/ui/Button";

// Within server
import { authMiddleware } from "@/middleware/auth";
```

## Summary

- Use `@/` for internal imports within an app
- Use `@my-project/shared` for shared package imports
- Place code in shared only if used by both client and server
- Keep UI/React code in client, API/backend code in server
- Use barrel exports only for cohesive units (packages, K8s resources)
- Avoid circular dependencies and cross-app imports
- Always check tsconfig.json for correct import configuration
- Follow pnpm for package management
