# Monorepo Patterns and Organization

Comprehensive guide to monorepo architecture, code organization, import patterns, and barrel export strategies for the KubeRocketCI portal.

## Monorepo Structure

```
portal/
├── apps/
│   ├── client/          # Frontend application
│   └── server/          # Hosting server (auth, cookies, sessions, static files)
├── packages/
│   ├── shared/          # Common code, types, and models
│   └── trpc/            # tRPC routers, procedures, and API definitions
└── package.json         # Root configuration
```

## Package Structures

### Shared Package

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

### tRPC Package

```
packages/trpc/
├── src/
│   ├── routers/           # tRPC routers with endpoint definitions
│   │   ├── k8s/           # Kubernetes API routers
│   │   ├── auth/          # Authentication routers
│   │   └── index.ts       # Root router aggregation
│   ├── procedures/        # Base procedures (public, protected)
│   ├── context/           # tRPC context definitions
│   ├── clients/           # tRPC clients for different environments
│   ├── utils/             # tRPC utilities
│   └── index.ts           # Package exports
└── package.json
```

### tRPC Package Contents

**Routers**:

- API endpoint definitions using tRPC
- Query and mutation procedures
- Input validation with Zod schemas
- Business logic integration with K8s clients

**Procedures**:

- Base procedure builders (public, protected)
- Middleware integration (auth, logging)
- Context augmentation

**Clients**:

- tRPC clients for server-side usage
- Client configuration for different environments
- Type-safe API client instances

**Context**:

- Request context creation
- User session handling
- Authentication state

### Client App Structure - K8s Module

```
apps/client/src/k8s/
├── api/
│   ├── groups/            # K8s resource group API integrations
│   │   ├── KRCI/          # KRCI-specific resources
│   │   │   ├── Codebase/
│   │   │   │   ├── hooks/ # useCodebaseWatchList, useCodebasePermissions
│   │   │   │   └── utils/ # Status icons, formatters, UI helpers
│   │   │   └── ...
│   │   └── Tekton/        # Tekton resources
│   └── hooks/             # Generic K8s watch hooks (useWatchList, useWatchItem)
├── constants/             # UI-related constants (tables, status colors)
├── services/              # K8s API service layer
├── store/                 # K8s state management (Zustand)
└── types.ts               # Client-specific K8s types
```

### Client K8s Module Contents

**API Integration**:

- Watch hooks for real-time K8s resource updates (`useWatchList`, `useWatchItem`)
- Resource-specific hooks (e.g., `useCodebaseWatchList`)
- Permission hooks for RBAC (`useCodebasePermissions`)
- CRUD operation hooks (`useBasicCRUD`)

**UI Constants & Utils**:

- Status icon configurations (icon, color, spinning state)
- Status color mappings for UI display
- Resource formatters for display
- Table configurations and column definitions
- UI-specific helper functions

**State Management**:

- Zustand store for K8s cluster state
- Namespace management
- WebSocket connection state

**Example - Status Icons (UI logic in client)**:

```typescript
// apps/client/src/k8s/api/groups/KRCI/Codebase/utils/getCodebaseStatusIcon.ts
export const getCodebaseStatusIcon = (codebase: Codebase) => {
  const phase = codebase.status?.phase;
  switch (phase) {
    case 'Running': return { Icon: CheckCircle, color: 'success' };
    case 'Failed': return { Icon: XCircle, color: 'error' };
    // ... UI presentation logic
  }
};
```

### Shared Package - K8s Models

**What belongs in shared k8s**:

**Resource Configurations**:

```typescript
// packages/shared/src/models/k8s/groups/KRCI/Codebase/constants.ts
export const k8sCodebaseConfig = {
  apiVersion: "v2.edp.epam.com/v1",
  kind: "Codebase",
  pluralName: "codebases",
  // ... resource metadata
} as const satisfies K8sResourceConfig;
```

**TypeScript Types & Interfaces**:

```typescript
// packages/shared/src/models/k8s/groups/KRCI/Codebase/types.ts
export interface Codebase extends K8sResource {
  spec: CodebaseSpec;
  status?: CodebaseStatus;
}
```

**Zod Schemas**:

```typescript
// packages/shared/src/models/k8s/groups/KRCI/Codebase/schema.ts
export const codebaseSchema = z.object({
  name: z.string().min(1),
  gitUrl: z.string().url(),
  // ... validation rules
});
```

**Business Logic Utilities**:

```typescript
// packages/shared/src/models/k8s/groups/KRCI/Codebase/utils.ts
export const createCodebaseDraft = (data: CodebaseFormData): Codebase => {
  return {
    apiVersion: k8sCodebaseConfig.apiVersion,
    kind: k8sCodebaseConfig.kind,
    metadata: { name: data.name },
    spec: { /* ... */ },
  };
};
```

**Resource-Specific Labels** (separate `labels.ts` file):

```typescript
// packages/shared/src/models/k8s/groups/KRCI/Codebase/labels.ts
export const codebaseLabels = {
  codebaseType: 'app.edp.epam.com/codebaseType',
  gitServer: 'app.edp.epam.com/gitserver',
  integration: 'app.edp.epam.com/integration',
  systemType: 'app.edp.epam.com/systemType',
} as const;

// packages/shared/src/models/k8s/groups/ArgoCD/Application/labels.ts
export const applicationLabels = {
  pipeline: 'app.edp.epam.com/pipeline',
  stage: 'app.edp.epam.com/stage',
  component: 'app.kubernetes.io/component', // Standard K8s label
  environment: 'environment', // Custom label
} as const;
```

**Label Usage in Config**:

```typescript
// packages/shared/src/models/k8s/groups/KRCI/Codebase/constants.ts
import { codebaseLabels } from "./labels.js";

export const k8sCodebaseConfig = {
  apiVersion: "v2.edp.epam.com/v1",
  kind: "Codebase",
  pluralName: "codebases",
  labels: codebaseLabels, // Reference label constants
} as const satisfies K8sResourceConfig<typeof codebaseLabels>;
```

### Client K8s vs Shared K8s - Summary

| Location | Purpose | Examples |
|----------|---------|----------|
| `apps/client/src/k8s/` | **API integration & UI logic** | Watch hooks, status icons, colors, formatters, permission hooks, store |
| `packages/shared/src/models/k8s/` | **Resource definitions & business logic** | Configs, types, schemas, draft creators, **label constants** |

**Resource Structure in Shared**:

```
packages/shared/src/models/k8s/groups/{Group}/{Resource}/
├── constants.ts    # Resource config, enums, constants
├── labels.ts       # Label key constants (app.edp.epam.com/*, app.kubernetes.io/*)
├── types.ts        # TypeScript interfaces
├── schema.ts       # Zod validation schemas
└── utils/          # Business logic (draft creators, etc.)
```

**Rule of thumb**:

- If it's about **how resources are displayed or fetched** → Client k8s module
- If it's about **what resources are and how they're structured** → Shared package
- **All label keys** (including standard K8s labels like `app.kubernetes.io/*`) → Shared package in `labels.ts`

### Server App Structure

```
apps/server/
├── src/
│   ├── config/            # Server configuration
│   │   ├── development.ts # Development server setup
│   │   └── production.ts  # Production server setup
│   ├── clients/           # External clients (optional)
│   ├── index.ts           # Server entry point
│   ├── config.ts          # Environment configuration
│   └── paths.ts           # Path constants
└── package.json
```

### Server App Purpose

The server app is a **pure hosting application** that:

- Sets up Fastify server with middleware
- Configures authentication (OAuth, sessions)
- Manages cookies and sessions
- Serves static files (client build)
- Configures CORS and websockets
- Hosts the tRPC router from `@my-project/trpc` package

**Server does NOT contain**:

- ❌ API endpoint definitions (those are in trpc package)
- ❌ Business logic (in shared or trpc packages)
- ❌ tRPC procedures (in trpc package)

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
      "@my-project/shared": ["../../packages/shared/src"],
      "@my-project/trpc": ["../../packages/trpc/src"]
    }
  }
}
```

**tRPC Package tsconfig.json**:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@my-project/shared": ["../shared/src"]
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
// Server configuration imports
import { LocalFastifyServer } from "@/config/development";
import { ProductionFastifyServer } from "@/config/production";

// Server-specific utilities
import { PATHS } from "@/paths";
import { config } from "@/config";
```

**Internal Imports (within trpc package)**:

```typescript
// tRPC utilities
import { createTRPCRouter } from "@/utils/createTRPCRouter";
import { publicProcedure, protectedProcedure } from "@/procedures";

// Context imports
import { createTRPCContext } from "@/context";

// Client imports
import { k8sClient } from "@/clients/k8s";
import { authClient } from "@/clients/auth";

// Router imports
import { k8sRouter } from "@/routers/k8s";
import { authRouter } from "@/routers/auth";
```

**Cross-Package Imports (from shared package)**:

```typescript
// From client, server, or trpc package
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

**Cross-Package Imports (from trpc package)**:

```typescript
// From client - tRPC client-side hooks
import { trpc } from "@my-project/trpc/client";

// From server - tRPC router and context
import { appRouter } from "@my-project/trpc";
import { createTRPCContext } from "@my-project/trpc";

// Type exports for client usage
import type { AppRouter } from "@my-project/trpc";
```

## Code Placement Guidelines

### Decision Tree: Where Should Code Go?

**Question 1**: Is the code related to tRPC API endpoints/procedures?

- **Yes** → Place in `packages/trpc/`
- **No** → Go to Question 2

**Question 2**: Is the code K8s-related?

- **Yes** → Go to K8s sub-decision:
  - **Resource configs, types, schemas, draft creators?** → `packages/shared/src/models/k8s/`
  - **API hooks, status icons, UI formatters, permissions?** → `apps/client/src/k8s/`
- **No** → Go to Question 3

**Question 3**: Is the code used by multiple packages (client, server, AND/OR trpc)?

- **Yes** → Place in `packages/shared/`
- **No** → Go to Question 4

**Question 4**: Does the code contain UI/React components?

- **Yes** → Place in `apps/client/`
- **No** → Go to Question 5

**Question 5**: Does the code handle server hosting concerns (auth, cookies, sessions)?

- **Yes** → Place in `apps/server/`
- **No** → Re-evaluate or place in `packages/shared/`

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

**tRPC Package Examples**:

```typescript
// tRPC router
export const pipelineRunRouter = createTRPCRouter({
  list: publicProcedure
    .query(async ({ ctx }) => {
      const runs = await k8sClient.listPipelineRuns();
      return runs;
    }),

  create: protectedProcedure
    .input(codebaseSchema)
    .mutation(async ({ ctx, input }) => {
      const run = await k8sClient.createPipelineRun(input);
      return run;
    }),
});

// Kubernetes service
export class K8sService {
  async listPipelineRuns(): Promise<PipelineRun[]> {
    // Implementation using @kubernetes/client-node
  }
}
```

**Server App Examples**:

```typescript
// Fastify server setup (in apps/server/src/config/development.ts)
export class LocalFastifyServer {
  private fastify: FastifyInstance;

  constructor() {
    this.fastify = Fastify();
    this.setupMiddleware();
    this.setupTRPC();
  }

  private setupMiddleware() {
    // Cookie, session, CORS, static files
    this.fastify.register(fastifyCookie);
    this.fastify.register(fastifySession, { /* ... */ });
    this.fastify.register(fastifyCors, { /* ... */ });
  }

  private setupTRPC() {
    // Host the tRPC router from @my-project/trpc
    this.fastify.register(fastifyTRPCPlugin, {
      router: appRouter,
      createContext: createTRPCContext,
    });
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

### Anti-Pattern 3: K8s UI Logic in Shared

❌ **Don't**:

```typescript
// packages/shared/src/models/k8s/Codebase/utils.ts  ← UI logic in shared!
export const getCodebaseStatusIcon = (codebase: Codebase) => {
  return {
    Icon: codebase.status === 'Running' ? CheckIcon : ErrorIcon,
    color: codebase.status === 'Running' ? 'success' : 'error',
  };
};

// packages/shared/src/models/k8s/Codebase/hooks.ts  ← React hooks in shared!
export const useCodebaseWatch = () => useWatchList({ /* ... */ });
```

**Do**:

```typescript
// apps/client/src/k8s/api/groups/KRCI/Codebase/utils/getStatusIcon.ts
export const getCodebaseStatusIcon = (codebase: Codebase) => {
  return {
    Icon: codebase.status === 'Running' ? CheckIcon : ErrorIcon,
    color: codebase.status === 'Running' ? 'success' : 'error',
  };
};

// apps/client/src/k8s/api/groups/KRCI/Codebase/hooks/useCodebaseWatchList.ts
export const useCodebaseWatchList = () => useWatchList({ /* ... */ });

// packages/shared/src/models/k8s/Codebase/ ← Keep only configs, types, schemas
```

**Why**: Shared should have no UI dependencies (React, icons, colors). UI presentation logic belongs in client.

### Anti-Pattern 4: K8s Resource Configs in Client

❌ **Don't**:

```typescript
// apps/client/src/k8s/config/codebase.ts  ← Resource config in client!
export const k8sCodebaseConfig = {
  apiVersion: "v2.edp.epam.com/v1",
  kind: "Codebase",
  pluralName: "codebases",
};

// apps/client/src/utils/createDraft.ts  ← Draft creator in client!
export const createCodebaseDraft = (data: FormData) => ({ /* ... */ });
```

**Do**:

```typescript
// packages/shared/src/models/k8s/groups/KRCI/Codebase/constants.ts
export const k8sCodebaseConfig = {
  apiVersion: "v2.edp.epam.com/v1",
  kind: "Codebase",
  pluralName: "codebases",
} as const satisfies K8sResourceConfig;

// packages/shared/src/models/k8s/groups/KRCI/Codebase/utils.ts
export const createCodebaseDraft = (data: FormData): Codebase => ({ /* ... */ });
```

**Why**: Resource definitions and business logic should be shared between client and trpc packages.

### Anti-Pattern 5: Hardcoding K8s Label Strings

❌ **Don't**:

```typescript
// apps/client/src/components/CodebaseBranches.tsx  ← Hardcoded labels!
const { data: branches } = useWatchList({
  config: k8sCodebaseBranchConfig,
  labelSelector: {
    'app.edp.epam.com/codebaseName': codebaseName, // Typo-prone, no type safety
  },
});

// apps/client/src/components/AppList.tsx  ← Hardcoded standard K8s label!
const { data: apps } = useWatchList({
  labelSelector: {
    'app.kubernetes.io/component': 'frontend', // Should be constant
  },
});
```

**Do**:

```typescript
// packages/shared/src/models/k8s/groups/KRCI/CodebaseBranch/labels.ts
export const codebaseBranchLabels = {
  codebase: 'app.edp.epam.com/codebaseName',
} as const;

// packages/shared/src/models/k8s/groups/ArgoCD/Application/labels.ts
export const applicationLabels = {
  component: 'app.kubernetes.io/component', // Standard K8s label as constant
  environment: 'environment',
} as const;

// apps/client/src/components/CodebaseBranches.tsx
import { codebaseBranchLabels } from "@my-project/shared";

const { data: branches } = useWatchList({
  config: k8sCodebaseBranchConfig,
  labelSelector: {
    [codebaseBranchLabels.codebase]: codebaseName, // Type-safe constant
  },
});
```

**Why**: Label constants provide type safety, prevent typos, enable refactoring, and maintain consistency across client and trpc packages.

### Anti-Pattern 6: Server Code in Client

**Don't**:

```typescript
// apps/client/src/services/k8s.ts  ← Direct K8s API calls in client!
import { KubeConfig } from '@kubernetes/client-node';
export const listPods = async () => { /* ... */ };
```

**Do**:

```typescript
// apps/client/src/hooks/usePods.ts  ← Use tRPC to call API
export const usePods = () => {
  const trpc = useTRPC();
  return trpc.k8s.listPods.useQuery();
};

// packages/trpc/src/routers/k8s.ts  ← K8s API logic in trpc package
export const k8sRouter = createTRPCRouter({
  listPods: protectedProcedure.query(async () => { /* ... */ }),
});
```

### Anti-Pattern 7: tRPC Code in Wrong Package

❌ **Don't**:

```typescript
// packages/shared/src/routers/k8s.ts  ← tRPC router in shared!
export const k8sRouter = createTRPCRouter({ /* ... */ });

// apps/server/src/routers/k8s.ts  ← tRPC router in server app!
export const k8sRouter = createTRPCRouter({ /* ... */ });
```

**Do**:

```typescript
// packages/trpc/src/routers/k8s.ts  ← tRPC routers belong in trpc package
export const k8sRouter = createTRPCRouter({ /* ... */ });
```

**Why**: The trpc package is specifically for API definitions. Server app only hosts the router, it doesn't define it.

### Anti-Pattern 8: Root Project Imports

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

// Within trpc package
import { k8sClient } from "@/clients/k8s";
```

## Summary

- Use `@/` for internal imports within an app or package
- Use `@my-project/shared` for shared package imports (types, models, utilities)
- Use `@my-project/trpc` for tRPC package imports (routers, procedures, clients)
- **tRPC routers and procedures** → `packages/trpc/`
- **Shared types and business logic** → `packages/shared/`
- **UI/React code** → `apps/client/`
- **Server hosting (auth, cookies, sessions)** → `apps/server/`
- Use barrel exports only for cohesive units (packages, K8s resources)
- Avoid circular dependencies and cross-app imports
- Always check tsconfig.json for correct import configuration
- Follow pnpm for package management

### Package Dependency Flow

```
apps/client  ──→  @my-project/trpc (client)  ──→  @my-project/shared
apps/server  ──→  @my-project/trpc           ──→  @my-project/shared
packages/trpc ──────────────────────────────────→  @my-project/shared
```

**Key Points**:

- Server app imports from trpc package (for router and context)
- Server app does NOT define API endpoints
- tRPC package is where all API logic lives
- Both client and server consume trpc package differently
