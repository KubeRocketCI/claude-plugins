# KRCI Agent Capabilities Summary

Consolidated reference for all specialized KRCI agent capabilities.

## krci-fullstack Agent

**Primary Repository**: krci-portal
**Skills**: component-development, api-integration, form-patterns, table-patterns, filter-patterns, routing-permissions, k8s-resources, testing-standards, frontend-tech-stack

**Commands**:

- `/krci-fullstack:implement-feature` - guided workflow for portal features
- `/krci-fullstack:fix-issue` - guided debugging and bug fixing workflow

**Capabilities**:

**Component Development**:

- React functional components with TypeScript
- Radix UI component library usage
- Tailwind CSS styling
- Custom hooks implementation
- Component composition patterns

**API Integration**:

- tRPC procedure creation (query/mutation)
- React Query hooks for data fetching
- Type-safe client-server communication
- Error handling and loading states

**Form Patterns**:

- Tanstack Form implementation
- Field validation (Zod schemas)
- Multi-step forms and wizards
- Form state management

**Table Patterns**:

- Tanstack Table implementation
- Column configuration
- Sorting and filtering
- Pagination
- Row actions

**Routing & Permissions**:

- React Router configuration
- Protected routes with RBAC
- Permission checks (usePermissions hook)
- Breadcrumb navigation

**Kubernetes Resources**:

- CRD display and management UI
- Watch hooks for real-time updates
- Resource creation/edit forms
- Status indicators

**Testing**:

- Vitest unit tests
- React Testing Library component tests
- Test coverage requirements
- Mocking patterns

---

## krci-devops Agent

**Primary Repository**: edp-tekton
**Skills**: edp-tekton-standards, edp-tekton-triggers

**Commands**:

- `/krci-devops:add-task` - Onboard new Tekton Task
- `/krci-devops:add-pipeline` - Onboard build and review pipelines
- `/krci-devops:add-trigger` - Create Tekton Triggers for VCS webhooks

**Capabilities**:

**Tekton Standards**:

- Pipeline and Task naming conventions (kebab-case)
- Onboarding script usage (`add_task.sh`, `add_pipeline.sh`)
- Helm chart structure and templating
- Workspace patterns (source, cache, dockerconfig)
- Parameter conventions
- Feature flags configuration

**Task Development**:

- Task scaffolding and structure
- Step implementation
- Resource requirements
- Results and artifacts

**Pipeline Development**:

- Build pipelines (compile, test, scan, build image, push)
- Review pipelines (PR/MR validation)
- Pipeline composition from tasks
- Conditional execution (when expressions)

**Trigger Patterns**:

- GitHub webhooks (push, pull_request events)
- GitLab webhooks (push, merge_request events)
- Gerrit webhooks (patchset-created, change-merged)
- Bitbucket webhooks
- 3-stage interceptor chains:
  1. CEL filter and transform
  2. VCS-specific interceptor
  3. CEL routing to pipeline

**Helm Templating**:

- Values file structure
- Template conditionals
- Resource naming
- Label conventions

---

## krci-godev Agent

**Primary Repositories**: edp-codebase-operator, edp-cd-pipeline-operator
**Skills**: go-coding-standards, operator-best-practices

**Commands**:

- `/krci-godev:review-code` - Code review against Go standards
- `/krci-godev:implement-new-cr` - Scaffold and implement Custom Resource

**Capabilities**:

**Go Standards**:

- Idiomatic Go code patterns
- Naming conventions (camelCase, PascalCase)
- Error handling patterns
- Package organization
- Testing with table-driven tests
- Go modules and dependencies

**CRD Design**:

- API versioning (v1, v1alpha1, v1beta1)
- Schema definition with kubebuilder markers
- Validation rules
- Default values
- Status subresource

**Controller Patterns**:

- Reconciliation loop implementation
- Client-go usage
- Controller-runtime patterns
- Error handling and requeuing
- Status updates

**Operator SDK**:

- Scaffolding new resources (`operator-sdk create api`)
- Generating manifests and CRDs
- Building and deploying operators
- Testing operators

**Best Practices**:

- Finalizers for cleanup
- Owner references for dependent resources
- RBAC configuration
- Webhook implementation (validation/mutation)
- Metrics and observability

---

## Cross-Agent Integration

### Portal + Operator Integration

**Flow**:

1. Operator defines CRD (krci-godev)
2. Portal displays/manages CRD (krci-fullstack)

**Integration Point**: CRD schema (group/version/kind, spec/status fields)

**Example**:

```go
// Operator defines (krci-godev)
type CodebaseSpec struct {
    Name     string `json:"name"`
    GitURL   string `json:"gitUrl"`
    Language string `json:"language"`
}
```

```typescript
// Portal uses (krci-fullstack)
interface Codebase {
  spec: {
    name: string;
    gitUrl: string;
    language: string;
  };
}
```

### Pipeline + Operator Integration

**Flow**:

1. Operator creates/updates CR (krci-godev)
2. Pipeline triggered by CR changes (krci-devops)

**Integration Point**: Custom Resource triggering Tekton

**Example**:

```yaml
# Operator creates Codebase (krci-godev)
apiVersion: v2.edp.epam.com/v1
kind: Codebase
metadata:
  name: my-app

# Tekton trigger watches (krci-devops)
# On Codebase create → trigger build pipeline
```

### Pipeline + Portal Integration

**Flow**:

1. Portal triggers pipeline via Kubernetes API (krci-fullstack)
2. Portal monitors PipelineRun status (krci-fullstack)

**Integration Point**: Tekton API

**Example**:

```typescript
// Portal creates PipelineRun (krci-fullstack)
const pipelineRun = await k8sApi.createPipelineRun({
  pipelineRef: { name: 'build-default' },
  params: [{ name: 'codebase', value: 'my-app' }]
});

// Watch status updates
watch('/apis/tekton.dev/v1/pipelineruns/' + pipelineRun.name);
```

---

## Delegation Decision Tree

```
Is this portal/UI work?
├─ YES → krci-fullstack
│  ├─ React components?              → YES
│  ├─ Forms, tables, routing?        → YES
│  ├─ tRPC API (frontend-backend)?   → YES
│  └─ UI tests?                       → YES
│
├─ NO → Is this CI/CD pipeline work?
   ├─ YES → krci-devops
   │  ├─ Tekton pipelines/tasks?     → YES
   │  ├─ Git webhooks/triggers?       → YES
   │  ├─ Helm charts for pipelines?   → YES
   │  └─ VCS integration?             → YES
   │
   └─ NO → Is this Kubernetes operator work?
      └─ YES → krci-godev
         ├─ CRDs and controllers?    → YES
         ├─ Go code in operators?     → YES
         ├─ Operator reconciliation?  → YES
         └─ K8s API integration?      → YES
```

---

## Common Delegation Patterns

### Pattern 1: New Feature Across All Layers

**Scenario**: Add webhook configuration to CD pipelines

**Delegation**:

1. **krci-godev**: Add `webhookURL` field to CDPipeline CRD
2. **krci-devops**: Create post-pipeline task sending webhook
3. **krci-fullstack**: Add webhook URL field to pipeline creation form

### Pattern 2: Operator + Portal Only

**Scenario**: Add new codebase property with UI management

**Delegation**:

1. **krci-godev**: Add field to Codebase CRD
2. **krci-fullstack**: Add field to codebase creation/edit forms

### Pattern 3: Pipeline + Portal Only

**Scenario**: Add pipeline visualization feature

**Delegation**:

1. **krci-devops**: Ensure pipeline emits necessary status/metadata
2. **krci-fullstack**: Create visualization component consuming PipelineRun data

### Pattern 4: Operator + Pipeline Only

**Scenario**: Trigger pipeline on CRD status change

**Delegation**:

1. **krci-godev**: Update operator to set specific status condition
2. **krci-devops**: Create trigger watching for status condition

---

## Agent Communication Protocol

When delegating, provide:

1. **Context**: What feature/change is being implemented
2. **Scope**: What this agent should implement specifically
3. **Integration Points**: How this connects to other components
4. **Constraints**: Any limitations or requirements
5. **Examples**: Reference similar existing implementations

**Template**:

```
Delegate to [agent-name]:

Context: [Overall feature being implemented]

Your scope:
- [Specific task 1]
- [Specific task 2]

Integration points:
- [How your work connects to component A]
- [Data contract with component B]

Constraints:
- [Requirement or limitation]

Examples:
- See [file:line] for similar implementation
```
