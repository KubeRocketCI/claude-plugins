---
description: Implement a new Kubernetes Custom Resource in Go
argument-hint: <cr-name>
allowed-tools: [Read, Write, Edit, Grep, Bash, Skill, Task]
---

# Task: Implement a new Kubernetes Custom Resource

**CRITICAL: Follow this workflow to implement the Custom Resource:**

1. **Load required skill using Skill tool:**
   - Load krci-godev:operator-best-practices skill

2. **Use go-dev agent to implement the Custom Resource:**
   - The go-dev agent will implement a new Kubernetes Custom Resource named `$ARGUMENTS`
   - Agent will apply all patterns from the operator-best-practices skill:
     - Kubernetes operator-specific patterns
     - Architectural principles (UNIX principle, CRD ownership, etc.)
     - CRD design guidelines and controller patterns
     - Operational practices (RBAC, metrics, cleanup, versioning)
     - Chain of responsibility pattern for reconciliation logic
   - Agent will follow the [Operator SDK Tutorial](https://sdk.operatorframework.io/docs/building-operators/golang/tutorial/) as foundation

This skill contains ALL the Kubernetes operator patterns, CRD design guidelines, and operational practices the agent will follow.

## Instructions

<instructions>
CRITICAL FIRST STEP: You MUST run the `make operator-sdk create api` command first to scaffold the proper structure before manually creating any files. See Step 1 below for detailed instructions.
</instructions>

### 1 Scaffold API and Controller

<scaffold_api_controller>
Before implementing the controller, ask the user for the CustomResource details:

1. Group: The API group (typically use `v1` for this project)
2. Version: The API version (typically `v1alpha1`)
3. Kind: The CustomResource kind name (e.g., `KeycloakClient`, `KeycloakUser`, etc.)

Once you have these details, use the Operator SDK to scaffold the basic API and controller structure:

```bash
make operator-sdk create api --group <group> --version <version> --kind <kind> --resource --controller
```

Example: If the user wants to create a `KeycloakClient` CustomResource:

```bash
make operator-sdk create api --group v1 --version v1alpha1 --kind KeycloakClient --resource --controller
```

This command will create:

- API types in `api/v1alpha1/`
- Controller skeleton in `internal/controller/`
- Basic RBAC markers

After scaffolding, you'll need to customize the generated code to follow the project's specific patterns described in the sections below.
</scaffold_api_controller>

### 2 Implement the API Types

<implement_api_types>
Implement your Custom Resource Definition (CRD) spec and status, based on user requirements, in `api/v1alpha1/`:

Note: The following examples use `YourResource` as a placeholder. Replace this with the actual resource name you specified during scaffolding.

```go
// +kubebuilder:object:root=true
// +kubebuilder:subresource:status

// YourResource is the Schema for the yourresources API
type YourResource struct {
    metav1.TypeMeta   `json:",inline"`
    metav1.ObjectMeta `json:"metadata,omitempty"`

    Spec   YourResourceSpec   `json:"spec,omitempty"`
    Status YourResourceStatus `json:"status,omitempty"`
}

// YourResourceSpec defines the desired state of YourResource
type YourResourceSpec struct {
    // Add your spec fields here
}

// YourResourceStatus defines the observed state of YourResource
type YourResourceStatus struct {
    // Add your status fields here
}
```

</implement_api_types>

### 3 Generate Code and Manifests

<generate_code_manifests>
Run the following commands to generate the necessary code:

```bash
make generate
make manifests
```

</generate_code_manifests>

### 4 Implement the Controller

<implement_controller>
Implement your controller in `internal/controller/yourresource/` following the existing pattern:

Note: Replace `YourResource` and `yourresource` with the actual resource name you specified during scaffolding.

```go
package yourresource

import (
    "context"
    "fmt"
    "time"

    "k8s.io/apimachinery/pkg/api/equality"
    k8sErrors "k8s.io/apimachinery/pkg/api/errors"
    ctrl "sigs.k8s.io/controller-runtime"
    "sigs.k8s.io/controller-runtime/pkg/client"
    "sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
    "sigs.k8s.io/controller-runtime/pkg/reconcile"

    yourresourceApi "github.com/your-org/your-operator/api/v1" // Replace with your actual module path
)

const (
    defaultRequeueTime = time.Second * 30
    successRequeueTime = time.Minute * 10
    finalizerName      = "yourresource.operator.finalizer.name"
)

// NewReconcileYourResource creates a new ReconcileYourResource with all necessary dependencies.
func NewReconcileYourResource(
    client client.Client,
) *ReconcileYourResource {
    return &ReconcileYourResource{
        client:            client,
    }
}

type ReconcileYourResource struct {
    client client.Client
}

func (r *ReconcileYourResource) SetupWithManager(mgr ctrl.Manager) error {
    return ctrl.NewControllerManagedBy(mgr).
        For(&yourresourceApi.YourResource{}).
        Complete(r)
}

// +kubebuilder:rbac:groups=yourgroup,namespace=placeholder,resources=yourresources,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=yourgroup,namespace=placeholder,resources=yourresources/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=yourgroup,namespace=placeholder,resources=yourresources/finalizers,verbs=update
// +kubebuilder:rbac:groups="",namespace=placeholder,resources=secrets,verbs=get;list;watch

func (r *ReconcileYourResource) Reconcile(ctx context.Context, request reconcile.Request) (reconcile.Result, error) {
    log := ctrl.LoggerFrom(ctx)
    log.Info("Reconciling YourResource")

    yourResource := &yourresourceApi.YourResource{}
    if err := r.client.Get(ctx, request.NamespacedName, yourResource); err != nil {
        if k8sErrors.IsNotFound(err) {
            return reconcile.Result{}, nil
        }
        return reconcile.Result{}, err
    }


    if yourResource.GetDeletionTimestamp() != nil {
        if controllerutil.ContainsFinalizer(yourResource, finalizerName) {
            if err = chain.NewRemoveResource().ServeRequest(ctx, yourResource); err != nil {
                return ctrl.Result{}, err
            }

            controllerutil.RemoveFinalizer(yourResource, finalizerName)

            if err = r.client.Update(ctx, yourResource); err != nil {
                return ctrl.Result{}, err
            }
        }

        return ctrl.Result{}, nil
    }

    if controllerutil.AddFinalizer(yourResource, finalizerName) {
        err = r.client.Update(ctx, yourResource)
        if err != nil {
            return ctrl.Result{}, err
        }

  // Get yourResource again to get the updated object
  if err = r.client.Get(ctx, request.NamespacedName, yourResource); err != nil {
   return reconcile.Result{}, err
  }
    }

    oldStatus := yourResource.Status.DeepCopy()

    if err = chain.MakeChain(r.client).ServeRequest(ctx, yourResource); err != nil {
        log.Error(err, "An error has occurred while handling YourResource")

        yourResource.Status.SetError(err.Error())

        if statusErr := r.updateYourResourceStatus(ctx, yourResource, oldStatus); statusErr != nil {
            return reconcile.Result{}, statusErr
        }

        return reconcile.Result{}, err
    }

    yourResource.Status.SetOK()

    if err = r.updateYourResourceStatus(ctx, yourResource, oldStatus); err != nil {
        return reconcile.Result{}, err
    }

    log.Info("Reconciling YourResource is finished")

    return reconcile.Result{
        RequeueAfter: successRequeueTime,
    }, nil
}

func (r *ReconcileYourResource) updateYourResourceStatus(
 ctx context.Context,
 yourResource *yourresourceApi.YourResource,
 oldStatus yourresourceApi.YourResourceStatus,
) error {
    if equality.Semantic.DeepEqual(&yourResource.Status, oldStatus) {
        return nil
    }

    if err := r.client.Status().Update(ctx, yourResource); err != nil {
        return fmt.Errorf("failed to update YourResource status: %w", err)
    }

    return nil
}
```

</implement_controller>

### 5 Implement the Chain of Responsibility

<implement_chain>
Create a chain package in `internal/controller/yourresource/chain/` with the following structure:

1. `chain.go` - Main chain implementation
2. `factory.go` - Chain factory
3. Individual handler files for each step in the chain

Note: Replace `yourresource` and `YourResource` with the actual resource name you specified during scaffolding.

Example `chain.go`:

```go
package chain

import (
    "context"
    "sigs.k8s.io/controller-runtime/pkg/client"

    yourApi "github.com/your-org/your-operator/api/v1"
)

type Chain interface {
    ServeRequest(ctx context.Context, yourResource *yourApi.YourResource) error
}

type chain struct {
    handlers []Handler
}

func (c *chain) ServeRequest(ctx context.Context, yourResource *yourApi.YourResource) error {
    for _, handler := range c.handlers {
        if err := handler.ServeRequest(ctx, yourResource); err != nil {
            return err
        }
    }
    return nil
}

type Handler interface {
    ServeRequest(ctx context.Context, yourResource *yourApi.YourResource) error
}

func MakeChain(k8sClient client.Client) Chain {
    return &chain{
        handlers: []Handler{
            // Add your handlers here
        },
    }
}
```

Example handler implementations should follow the pattern of existing handlers in your chain.
</implement_chain>

### 6 Register the Controller

<register_controller>
Add your controller to `cmd/main.go`:

```go
import (
    yourresourcecontroller "github.com/your-org/your-operator/controllers/yourresource"
)

// In the main function, add:
if err = yourresourcecontroller.NewReconcileYourResource(mgr.GetClient()).SetupWithManager(mgr); err != nil {
    setupLog.Error(err, "unable to create controller", "controller", "YourResource")
    os.Exit(1)
}
```

Note: Replace `YourResource` with the actual resource name you specified during scaffolding.
</register_controller>

### 7 Quality Review

<quality_review>
After implementation is complete, launch **3 code-reviewer agents in parallel** using the Task tool to validate the implementation:

- Agent 1 (subagent_type: `krci-general:code-reviewer`): "Review the recent changes for simplicity, DRY violations, and code elegance. Focus on readability and maintainability."
- Agent 2 (subagent_type: `krci-general:code-reviewer`): "Review the recent changes for bugs, logic errors, security vulnerabilities, race conditions, and functional correctness."
- Agent 3 (subagent_type: `krci-general:code-reviewer`): "Review the recent changes for project convention violations (check CLAUDE.md), architectural consistency, naming patterns, and import organization."

After all 3 agents complete:

1. Consolidate findings — merge and deduplicate issues, sort by severity
2. Filter to only issues with confidence >= 80
3. Present unified review report to the user
4. Ask the user how to proceed: "Fix all issues now" / "Fix critical only" / "Proceed as-is"
5. Address issues based on user decision
</quality_review>
