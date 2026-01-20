# KRCI Integration Points

Patterns for extending and integrating with the KubeRocketCI platform.

## Adding New Application Languages/Frameworks

### Create Application Template

**Template Structure**:

```
application-template/
├── template.yaml           # Template metadata
├── .edp/                   # EDP configuration
├── src/                    # Source code skeleton
├── tests/                  # Test examples
├── README.md               # Getting started guide
└── .gitignore              # Standard ignores
```

**Template Metadata**:

```yaml
name: springboot-gradle
description: Spring Boot application with Gradle
language: java
framework: springboot
buildTool: gradle
defaultBranch: main
```

**Integration Steps**:

1. Create template repository with skeleton code
2. Add template to Codebase Operator configuration
3. Create corresponding Tekton pipeline in edp-tekton
4. Configure SonarQube quality profile for language
5. Test full workflow (create → build → deploy)

### Create Tekton Pipeline

**Pipeline Structure**:

```
edp-tekton/charts/pipelines-library/templates/pipelines/
└── <language>/
    ├── <framework>/
    │   └── gerrit-build-default.yaml
    └── gerrit-build-<language>.yaml
```

**Required Tasks**:

- `init`: Initialize workspace
- `get-version`: Determine version
- `compile`: Build application
- `test`: Run unit tests
- `sonar`: Code quality scan
- `build-image`: Create container image
- `push`: Push to registry
- `git-tag`: Tag release

**Example Pipeline Reference**: See edp-tekton/charts/pipelines-library/templates/pipelines/java/springboot/

## Extending Portal

### Add New Page

**Steps**:

1. Create page component in `src/pages/`
2. Define route in `src/routes/`
3. Add navigation menu item
4. Implement RBAC checks
5. Create tRPC API routes if needed
6. Add tests

**File Structure**:

```
src/
├── pages/
│   └── MyFeature/
│       ├── index.tsx              # Page component
│       ├── components/             # Feature components
│       └── hooks/                  # Feature hooks
├── routes/
│   └── myFeature.tsx              # Route definition
└── api/
    └── myFeature.ts               # tRPC API routes
```

**RBAC Integration**:

```typescript
import { usePermissions } from '@/hooks/usePermissions';

export const MyFeaturePage = () => {
  const { can } = usePermissions();

  if (!can('myfeature', 'view')) {
    return <AccessDenied />;
  }

  return <MyFeatureContent />;
};
```

### Add tRPC API Route

**Backend Route**:

```typescript
// src/api/myFeature.ts
import { router, protectedProcedure } from './trpc';
import { z } from 'zod';

export const myFeatureRouter = router({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      // Fetch data from Kubernetes API
      const data = await ctx.k8sApi.listMyResources();
      return data.items;
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Create Kubernetes resource
      await ctx.k8sApi.createMyResource(input);
    }),
});
```

**Frontend Usage**:

```typescript
import { trpc } from '@/utils/trpc';

export const MyFeatureList = () => {
  const { data } = trpc.myFeature.list.useQuery();
  const create = trpc.myFeature.create.useMutation();

  return (
    <div>
      {data?.map(item => <Item key={item.id} {...item} />)}
      <Button onClick={() => create.mutate({ name: 'new' })}>
        Create
      </Button>
    </div>
  );
};
```

### Use Radix UI Components

**Standard Components**:

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

**Follow Existing Patterns**: See `src/components/ui/` for component library

## Creating Custom Operators

### Operator Structure

**Using Operator SDK**:

```bash
operator-sdk init --domain edp.epam.com --repo github.com/epam/my-operator
operator-sdk create api --group v2 --version v1 --kind MyResource
```

**Project Layout**:

```
my-operator/
├── api/
│   └── v1/
│       ├── myresource_types.go      # CRD definition
│       └── zz_generated.deepcopy.go
├── controllers/
│   └── myresource_controller.go     # Reconciliation logic
├── config/
│   ├── crd/                          # CRD manifests
│   ├── rbac/                         # RBAC manifests
│   └── manager/                      # Deployment manifests
└── deploy-templates/                 # Helm chart
```

### Define CRD

```go
// api/v1/myresource_types.go
type MyResourceSpec struct {
    Name        string `json:"name"`
    Replicas    int32  `json:"replicas,omitempty"`
    Environment string `json:"environment"`
}

type MyResourceStatus struct {
    Available bool   `json:"available"`
    Message   string `json:"message,omitempty"`
}

type MyResource struct {
    metav1.TypeMeta   `json:",inline"`
    metav1.ObjectMeta `json:"metadata,omitempty"`

    Spec   MyResourceSpec   `json:"spec,omitempty"`
    Status MyResourceStatus `json:"status,omitempty"`
}
```

### Implement Controller

```go
// controllers/myresource_controller.go
func (r *MyResourceReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    log := log.FromContext(ctx)

    // Fetch the resource
    resource := &myapiv1.MyResource{}
    if err := r.Get(ctx, req.NamespacedName, resource); err != nil {
        return ctrl.Result{}, client.IgnoreNotFound(err)
    }

    // Reconciliation logic
    if err := r.reconcileResource(ctx, resource); err != nil {
        return ctrl.Result{}, err
    }

    // Update status
    resource.Status.Available = true
    if err := r.Status().Update(ctx, resource); err != nil {
        return ctrl.Result{}, err
    }

    return ctrl.Result{}, nil
}
```

### Integrate with Platform

**RBAC for Portal Access**:

```yaml
# config/rbac/role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: edp-view
rules:
  - apiGroups: ["myapi.edp.epam.com"]
    resources: ["myresources"]
    verbs: ["get", "list", "watch"]
```

**Portal Integration**: Add portal UI for managing custom resources (follow patterns in existing pages)

## Integrating External Tools

### Add Tool with Keycloak Auth

**Deploy Tool**:

```yaml
# values.yaml for Helm chart
keycloak:
  enabled: true
  realm: main
  clientId: my-tool
  url: https://keycloak.example.com
```

**Configure Keycloak Client**:

```yaml
apiVersion: v1.edp.epam.com/v1alpha1
kind: KeycloakClient
metadata:
  name: my-tool
spec:
  clientId: my-tool
  directAccessGrantsEnabled: false
  public: false
  secret: my-tool-secret
  webUrl: https://my-tool.example.com
  realmRef:
    name: main
```

**Tool OIDC Configuration**:

- Client ID: `my-tool`
- Client Secret: From Kubernetes secret `my-tool-secret`
- OIDC Discovery URL: `https://keycloak.example.com/auth/realms/main/.well-known/openid-configuration`
- Redirect URI: `https://my-tool.example.com/callback`

### Integrate with Tekton Pipelines

**Add Task**:

```yaml
apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: my-tool-scan
spec:
  params:
    - name: source-path
      type: string
  steps:
    - name: scan
      image: my-tool:latest
      script: |
        #!/bin/sh
        my-tool scan $(params.source-path)
```

**Use in Pipeline**:

```yaml
apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: build-with-my-tool
spec:
  tasks:
    - name: my-tool-scan
      taskRef:
        name: my-tool-scan
      params:
        - name: source-path
          value: $(workspaces.source.path)
```

## Webhook Integration

### Configure Git Webhooks

**GitHub**:

```
Payload URL: https://tekton.example.com/github
Content type: application/json
Events: push, pull_request
```

**GitLab**:

```
URL: https://tekton.example.com/gitlab
Trigger: Push events, Merge request events
```

**Gerrit**:

```
# In Gerrit project config
[access "refs/*"]
  stream-events = group Tekton

# Stream events to Tekton
gerrit stream-events | tekton-listener
```

### Process Webhooks in Tekton

**EventListener**:

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: EventListener
metadata:
  name: github-listener
spec:
  triggers:
    - name: github-push
      interceptors:
        - ref:
            name: github
          params:
            - name: eventTypes
              value: ["push"]
        - ref:
            name: cel
          params:
            - name: filter
              value: body.ref == 'refs/heads/main'
      bindings:
        - ref: github-push-binding
      template:
        ref: build-pipeline-template
```

## Monitoring and Observability Integration

### Prometheus Metrics

**Expose Metrics**:

```go
// In operator or application
import "github.com/prometheus/client_golang/prometheus"

var (
    reconcileCounter = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "myoperator_reconcile_total",
            Help: "Total reconciliations",
        },
        []string{"resource", "status"},
    )
)

func init() {
    prometheus.MustRegister(reconcileCounter)
}
```

**ServiceMonitor**:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-operator
spec:
  selector:
    matchLabels:
      app: my-operator
  endpoints:
    - port: metrics
      interval: 30s
```

### OpenSearch Logging

**Structured Logging**:

```go
import "go.uber.org/zap"

logger, _ := zap.NewProduction()
logger.Info("reconciliation started",
    zap.String("resource", req.Name),
    zap.String("namespace", req.Namespace),
)
```

**Log Format**: JSON for OpenSearch parsing

### OpenTelemetry Tracing

**Instrument Code**:

```go
import "go.opentelemetry.io/otel"

tracer := otel.Tracer("my-operator")
ctx, span := tracer.Start(ctx, "reconcile")
defer span.End()

// Trace operations
```

## API Extensions

### Add Custom Kubernetes API

**APIService**:

```yaml
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1.myapi.edp.epam.com
spec:
  service:
    name: my-api-server
    namespace: edp
  group: myapi.edp.epam.com
  version: v1
  groupPriorityMinimum: 1000
  versionPriority: 15
```

### Admission Webhooks

**ValidatingWebhook**:

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: myresource-validator
webhooks:
  - name: validate.myresource.edp.epam.com
    rules:
      - apiGroups: ["myapi.edp.epam.com"]
        resources: ["myresources"]
        operations: ["CREATE", "UPDATE"]
    clientConfig:
      service:
        name: my-operator-webhook
        namespace: edp
        path: /validate
```

## GitOps Integration

### Argo CD Application

**Application Template**:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
spec:
  project: default
  source:
    repoURL: https://git.example.com/my-app.git
    targetRevision: main
    path: manifests/
  destination:
    server: https://kubernetes.default.svc
    namespace: my-app
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

**Created by CD Pipeline Operator**: Operator generates Argo CD Applications based on CDPipeline CRs
