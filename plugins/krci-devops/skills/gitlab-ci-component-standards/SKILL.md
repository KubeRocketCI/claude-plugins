---
name: KRCI GitLab CI Component Standards
description: This skill should be used when the user asks to "create GitLab CI component", "scaffold CI component library", "add GitLab CI pipeline template", "create component for CI/CD Catalog", "build GitLab component", "add language to CI component", "configure SonarQube for GitLab CI", "create Dockerfile for CI component", "7-stage pipeline architecture", "configure CI pipeline dependency chain", or mentions GitLab CI components, CI/CD Catalog publishing, component spec inputs, KubeRocketCI GitLab CI, gitlab-ci.yml structure, review/build pipeline templates, component library scaffolding, or CI component language profiles.
---

# GitLab CI Component Standards for KubeRocketCI

Comprehensive standards for developing, structuring, and publishing GitLab CI/CD component libraries following KubeRocketCI's established patterns. These components are published as CI/CD Catalog resources at gitlab.com/kuberocketci.

## Purpose

Guide implementation of GitLab CI/CD component libraries that follow KubeRocketCI's standardized 7-stage pipeline architecture, mandatory dependency chains, and CI/CD Catalog publishing workflow. Each component library provides reusable review and build pipelines for a specific technology stack.

## Target Organization

**GitLab Group**: <https://gitlab.com/kuberocketci>

**Existing Components**:

- `ci-template` — Technology-agnostic golden reference (base template)
- `ci-golang` — Go applications
- `ci-java17-gradle` — Java 17 with Gradle
- `ci-java17-mvn` — Java 17 with Maven
- `ci-nodejs-npm` — Node.js with npm
- `ci-python-uv` — Python with uv

**CRITICAL**: All new component libraries must follow the `ci-template` golden reference structure. The template is "80% complete, 20% to implement for your stack."

## Component Library Structure

Every component library follows this standardized directory layout:

```text
ci-<language>/
├── templates/              # common.yml, review.yml, build.yml
├── deploy-templates/       # Helm chart (optional)
├── .gitlab-ci.yml          # Root orchestrator + create-release job
├── Dockerfile              # Packaging-only (no build steps)
├── sonar-project.properties
├── README.md
└── LICENSE.md
```

**Naming Convention**: Repository name follows `ci-<language>` or `ci-<language>-<tool>` pattern (e.g., `ci-golang`, `ci-java17-mvn`, `ci-python-uv`).

For complete file anatomy details, see `references/component-structure.md`.

## Mandatory 7-Stage Pipeline Architecture

All component libraries implement a standardized 7-stage flow:

```text
stages: [prepare, test, build, verify, package, publish, release]
```

**Review Pipeline** (MR events) uses stages: `[prepare, test, build, verify]`

**Build Pipeline** (protected branches) uses stages: `[prepare, test, build, package, publish]`

**Release stage** is used by the root `.gitlab-ci.yml` for CI/CD Catalog publishing.

### Mandatory Dependency Chain (DAG)

```text
init-values (prepare)
    │
    ├──→ test (test, needs: [])  ────→ build (build, needs: [test])
    │                                       │
    ├──→ sonar (build, needs: [init-values, test])
    │                                       │
    ├──→ buildkit-build (package, needs: [init-values, build, sonar])
    │
    └──→ git-tag (publish, needs: [buildkit-build, init-values])
```

**Parallel test-stage jobs** (all with `needs: []`): test, lint, type-check, helm-docs, helm-lint, dockerfile-lint.

For detailed stage architecture and job dependencies, see `references/pipeline-stages.md`.

## Template Anatomy

### Three Template Files

**1. `templates/common.yml`** — Shared hidden job templates:

- `.common-variables` — Sets `CODEBASE_NAME` and `CHART_DIR`
- `.dependency-cache` — Generic cache template with `CACHE_DIR`
- `.test-job` — Test execution (extend with tech-specific commands)
- `.build-job` — Build execution (extend with tech-specific commands)
- `.lint-job` — Linting (extend with tech-specific linter)
- `.type-check-job` — Type checking (optional)
- `.sonar-base` — SonarQube scanner base (image: `sonarsource/sonar-scanner-cli:11.4`)
- `.helm-docs-job` — Helm documentation generation
- `.helm-lint-job` — Helm chart validation
- `.dockerfile-lint-job` — Hadolint Dockerfile validation
- `.buildkit-base` — Docker BuildKit base for container builds

**2. `templates/review.yml`** — MR pipeline (10 jobs):

- `init-values` → produces `branch.env` dotenv (BRANCH_NAME, PROJECT_NAME, MR_IID, SOURCE_BRANCH, TARGET_BRANCH)
- `test`, `build`, `lint`, `type-check` — Extend common templates
- `helm-docs`, `helm-lint`, `dockerfile-lint` — Validation jobs
- `sonar` — PR analysis with `-Dsonar.pullrequest.*` parameters
- `dockerbuild-verify` — BuildKit build with `push=false`

**3. `templates/build.yml`** — Main branch pipeline (12 jobs):

- `init-values` → produces `build.env` dotenv (BUILD_VERSION, BUILD_NUMBER, BUILD_DATE, VCS_TAG, IMAGE_TAG)
- Same test/build/lint/sonar jobs as review
- `buildkit-build` — Container build with `push=true` to registry
- `package-publish` — Optional artifact publishing (npm, PyPI, Maven)
- `git-tag` — Creates annotated git tag and pushes

## Spec Inputs and Interpolation

Components use `spec:` header with typed inputs, separated from CI/CD body by `---`:

```yaml
spec:
  inputs:
    stage_test:
      default: "test"
      description: "Test stage name"
    container_image:
      default: "alpine:latest"
      description: "Container image for build/test jobs"
    codebase_name:
      default: "my-application"
      description: "Project name for CI/CD operations"
---
# CI/CD configuration using $[[ inputs.name ]] interpolation
```

**Interpolation syntax**: `$[[ inputs.name ]]` (NOT `${{ }}` or `$( )`)

**Common inputs across all templates**:

| Input             | Default                             | Used In               |
| ----------------- | ----------------------------------- | --------------------- |
| `stage_prepare`   | `'prepare'`                         | common, review, build |
| `stage_test`      | `'test'`                            | common, review, build |
| `stage_build`     | `'build'`                           | common, review, build |
| `stage_verify`    | `'verify'`                          | review only           |
| `stage_package`   | `'package'`                         | build only            |
| `stage_publish`   | `'publish'`                         | build only            |
| `codebase_name`   | `'my-application'`                  | common, review, build |
| `container_image` | `'alpine:latest'`                   | common, review, build |
| `chart_dir`       | `'deploy-templates'`                | common, review, build |
| `image_registry`  | `'docker.io/${DOCKERHUB_USERNAME}'` | build only            |

**Input passthrough**: review.yml and build.yml include common.yml via `local: 'templates/common.yml'` and pass inputs through:

```yaml
include:
  - local: "templates/common.yml"
    inputs:
      stage_test: $[[ inputs.stage_test ]]
      container_image: $[[ inputs.container_image ]]
```

## Root Orchestrator (.gitlab-ci.yml)

The root `.gitlab-ci.yml` conditionally includes review or build components:

```yaml
include:
  - component: $CI_SERVER_FQDN/$CI_PROJECT_PATH/review@$CI_COMMIT_SHA
    rules:
      - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    inputs:
      codebase_name: $CODEBASE_NAME
      container_image: $CONTAINER_IMAGE

  - component: $CI_SERVER_FQDN/$CI_PROJECT_PATH/build@$CI_COMMIT_SHA
    rules:
      - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH || $CI_COMMIT_REF_PROTECTED == "true"
    inputs: { codebase_name: ..., container_image: ..., image_registry: ... }

stages: [prepare, test, build, verify, package, publish, release]

create-release:
  stage: release
  # Triggers on semver tags, creates GitLab release for CI/CD Catalog publishing
```

The `workflow:` block uses rules to activate on MR events, protected branches, and semver tags. For the complete file, see `references/component-structure.md`.

## Technology Stack Customization

Each language requires implementing `# IMPLEMENT:` extension points in the template files. The key customization areas are:

| Aspect                     | What to Customize                                    |
| -------------------------- | ---------------------------------------------------- |
| `container_image`          | Language-specific Docker image                       |
| `.test-job` script         | Test command (e.g., `go test`, `mvn test`)           |
| `.build-job` script        | Build command (e.g., `go build`, `mvn package`)      |
| `.lint-job` script         | Linter command (e.g., `golangci-lint`, `ruff check`) |
| `.dependency-cache`        | Cache key file and paths                             |
| `init-values` (build)      | Version extraction logic                             |
| `sonar` parameters         | Language-specific SonarQube properties               |
| `Dockerfile`               | Runtime packaging for the language                   |
| `sonar-project.properties` | Source paths, exclusions, coverage                   |

For complete per-language configurations with YAML examples, see `references/language-profiles.md`.

## `needs` vs `dependencies` Distinction

- **`needs:`** — Controls job execution order (DAG scheduling)
- **`dependencies:`** — Controls artifact download (which job's artifacts are available)

Example: `sonar` has `needs: [init-values, test]` AND `dependencies: [init-values, test]` because it requires both metadata and coverage artifacts. `build` has `needs: [test]` but `dependencies: []` because it depends on test success but does not need test artifacts.

## Dockerfile Pattern

Dockerfiles follow a **packaging-only** philosophy — no build steps inside Docker:

```dockerfile
FROM <runtime-image>
WORKDIR /app
COPY <build-artifacts> .
EXPOSE 8080
```

The application is built in CI jobs; the Dockerfile only packages the pre-built artifact into a container image.

## CI/CD Catalog Publishing

Components are published to GitLab CI/CD Catalog via semantic version tags:

1. Push a semver tag (e.g., `1.0.0`)
2. `create-release` job creates a GitLab release
3. GitLab automatically publishes to CI/CD Catalog

**Prerequisites**: Project description set, README.md exists, CI/CD Catalog toggle enabled in project settings.

For detailed publishing workflow and versioning, see `references/publishing-catalog.md`.

## Key Architectural Patterns

1. **Separated test and build jobs**: NEVER combine in a single job. `.test-job` produces coverage, `.build-job` produces application artifacts.
2. **Review vs Build SonarQube**: Review uses `-Dsonar.pullrequest.*` (PR analysis). Build uses `-Dsonar.branch.name` (branch analysis).
3. **Docker build verification vs publishing**: Review uses `push=false` (verify only). Build uses `push=true` (publish to registry).
4. **init-values produces dotenv**: Review produces `branch.env`. Build produces `build.env` with version metadata.
5. **Component composition via local include**: Templates compose via `include: - local:` with input passthrough.
6. **`# IMPLEMENT:` comments**: Mark tech-specific extension points in template files.
7. **Conditional component inclusion**: Root `.gitlab-ci.yml` uses `rules:` on `include:` blocks for MR vs branch selection.

## Validation Requirements

### Pre-Creation Checklist

- Repository name follows `ci-<language>` or `ci-<language>-<tool>` pattern
- All three template files exist (common.yml, review.yml, build.yml)
- `spec:` section present with typed inputs in each template
- `$[[ inputs.name ]]` interpolation used correctly (not `${{ }}`)

### Post-Creation Checklist

- 7-stage architecture followed
- Mandatory dependency chain preserved (init-values → test → build → sonar → buildkit-build → git-tag)
- `needs:` vs `dependencies:` used correctly
- `create-release` job present in root `.gitlab-ci.yml`
- README.md documents all inputs
- Dockerfile uses packaging-only pattern
- `sonar-project.properties` configured for language

## Quick Reference

**Component Address Format**:

```text
gitlab.com/kuberocketci/ci-<language>/<component>@<version>
```

**Consumer Usage Example**:

```yaml
include:
  - component: gitlab.com/kuberocketci/ci-golang/review@1.0.0
    inputs:
      codebase_name: my-go-app
      container_image: golang:1.24-bookworm

  - component: gitlab.com/kuberocketci/ci-golang/build@1.0.0
    inputs:
      codebase_name: my-go-app
      container_image: golang:1.24-bookworm
      image_registry: docker.io/myorg
```

## Additional Resources

- Component file anatomy: `references/component-structure.md`
- Pipeline stages and dependencies: `references/pipeline-stages.md`
- Per-language profiles with YAML examples: `references/language-profiles.md`
- CI/CD Catalog publishing workflow: `references/publishing-catalog.md`
