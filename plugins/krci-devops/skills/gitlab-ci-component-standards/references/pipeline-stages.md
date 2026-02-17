# Pipeline Stages and Job Dependencies

Detailed reference for the 7-stage pipeline architecture and mandatory dependency chains in KubeRocketCI GitLab CI components.

## 7-Stage Architecture

```yaml
stages: [prepare, test, build, verify, package, publish, release]
```

| Stage | Purpose | Used By |
|-------|---------|---------|
| `prepare` | Initialize values, extract metadata | review, build |
| `test` | Run tests, linting, validation (parallel) | review, build |
| `build` | Compile application, run SonarQube | review, build |
| `verify` | Verify Docker build (no push) | review only |
| `package` | Build + push container image, publish artifacts | build only |
| `publish` | Create + push git tag | build only |
| `release` | CI/CD Catalog release (create-release job) | root .gitlab-ci.yml only |

## Review Pipeline DAG (MR Events)

Stages used: `[prepare, test, build, verify]`

```text
                    ┌─── test ──────────────┐
                    │                       │
                    ├─── lint               │
                    │                       │
                    ├─── type-check         │
init-values ───┬───┤                       ├──→ build ──┐
               │   ├─── helm-docs          │            │
               │   │                       │            │
               │   ├─── helm-lint          │            │
               │   │                       │            │
               │   └─── dockerfile-lint ───│────────────│──┐
               │                           │            │  │
               └───── sonar ◄──────────────┘            │  │
                      (needs: init-values, test)        │  │
                                │                       │  │
                                └───── dockerbuild-verify ◄┘
                                       (needs: init-values, build, sonar, dockerfile-lint)
```

**Key observations**:

- All test-stage jobs run in parallel (`needs: []`)
- `build` waits only for `test` (not lint/type-check)
- `sonar` requires both `init-values` (for metadata) and `test` (for coverage)
- `dockerbuild-verify` is the final gate requiring all critical predecessors

## Build Pipeline DAG (Protected Branches)

Stages used: `[prepare, test, build, package, publish]`

```text
                    ┌─── test ──────────────┐
                    │                       │
                    ├─── lint               │
                    │                       │
                    ├─── type-check         │
init-values ───┬───┤                       ├──→ build ──┐
               │   ├─── helm-docs          │            │
               │   │                       │            │
               │   ├─── helm-lint          │            │
               │   │                       │            │
               │   └─── dockerfile-lint    │            │
               │                           │            │
               └───── sonar ◄──────────────┘            │
                      (needs: init-values, test)        │
                                │                       │
                                ├── buildkit-build ◄────┘
                                │   (needs: init-values, build, sonar)
                                │        │
                                │        └──→ git-tag
                                │             (needs: buildkit-build, init-values)
                                │
                                └── package-publish ◄───┘
                                    (needs: init-values, build)
```

**Key observations**:

- Same parallel test stage as review
- `buildkit-build` pushes to registry (`push=true`)
- `git-tag` is the final job, runs after container is published
- `package-publish` is optional (for npm/PyPI/Maven artifact registries)

## Job Details

### init-values (prepare)

**Image**: `alpine:3.21.4`

**Review output** (`branch.env` dotenv, expire 1 day):

| Variable | Value |
|----------|-------|
| `BRANCH_NAME` | `${CI_COMMIT_REF_NAME}` |
| `PROJECT_NAME` | `${CODEBASE_NAME}` |
| `MR_IID` | `${CI_MERGE_REQUEST_IID}` |
| `SOURCE_BRANCH` | `${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME}` |
| `TARGET_BRANCH` | `${CI_MERGE_REQUEST_TARGET_BRANCH_NAME}` |

**Build output** (`build.env` dotenv, expire 1 day):

| Variable | Value |
|----------|-------|
| `BRANCH_NAME` | `${CI_MERGE_REQUEST_TARGET_BRANCH_NAME:-${CI_COMMIT_REF_NAME}}` |
| `PROJECT_NAME` | `${CODEBASE_NAME}` |
| `BUILD_VERSION` | `${CI_COMMIT_SHORT_SHA}` (default; override for tech-specific extraction) |
| `BUILD_NUMBER` | `${CI_PIPELINE_ID}` |
| `BUILD_DATE` | `$(date -u +%Y-%m-%dT%H:%M:%SZ)` (UTC, ISO 8601) |
| `VCS_TAG` | `${CI_COMMIT_TAG:-v0.1.0-${CI_COMMIT_SHORT_SHA}}` |
| `IMAGE_TAG` | `${CI_COMMIT_TAG:-${CI_COMMIT_SHORT_SHA}}` |

### sonar (build stage)

**Image**: `sonarsource/sonar-scanner-cli:11.4` (with `entrypoint: [""]`)

**Needs**: `[init-values, test]` — requires metadata AND coverage artifacts

**Review mode** (PR analysis — uses CI predefined variables directly):

```bash
sonar-scanner \
  -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
  -Dsonar.projectName=${CODEBASE_NAME} \
  -Dsonar.host.url=${SONAR_HOST_URL} \
  -Dsonar.token=${SONAR_TOKEN} \
  -Dsonar.pullrequest.key=${CI_MERGE_REQUEST_IID} \
  -Dsonar.pullrequest.branch=${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME} \
  -Dsonar.pullrequest.base=${CI_MERGE_REQUEST_TARGET_BRANCH_NAME}
```

**Build mode** (branch analysis — uses CI predefined variable directly):

```bash
sonar-scanner \
  -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
  -Dsonar.projectName=${CODEBASE_NAME} \
  -Dsonar.host.url=${SONAR_HOST_URL} \
  -Dsonar.token=${SONAR_TOKEN} \
  -Dsonar.branch.name=${CI_COMMIT_REF_NAME}
```

### buildkit-build / dockerbuild-verify

**Image**: `moby/buildkit:rootless` (with `entrypoint: [""]`)

**Review** (`dockerbuild-verify`):

- `push=false` — validates the build works, does not push
- Stage: verify
- Needs: `[init-values, build, sonar, dockerfile-lint]`

**Build** (`buildkit-build`):

- `push=true` — builds and pushes to `$IMAGE_REGISTRY/$CODEBASE_NAME:$IMAGE_TAG`
- Stage: package
- Needs: `[init-values, build, sonar]`

### git-tag (publish)

**Image**: `alpine/git:2.49.1` (with `entrypoint: [""]`)

**Variables**: `GIT_STRATEGY: clone`

**Script**: Sets git identity, configures remote with `GITLAB_ACCESS_TOKEN`, creates annotated tag `${VCS_TAG}`, pushes tag.

**Needs**: `[buildkit-build, init-values]`

## needs vs dependencies Rules

| Job | `needs:` (execution order) | `dependencies:` (artifacts) | Reason |
|-----|---------------------------|----------------------------|--------|
| `test` | `[]` | `[]` | Runs immediately, no prerequisites |
| `build` | `[test]` | `[]` | Depends on test success, not artifacts |
| `sonar` | `[init-values, test]` | `[init-values, test]` | Needs metadata AND coverage files |
| `dockerbuild-verify` | `[init-values, build, sonar, dockerfile-lint]` | `[build]` | Needs build artifacts for Docker |
| `buildkit-build` | `[init-values, build, sonar]` | `[init-values, build]` | Needs metadata and build artifacts |
| `git-tag` | `[buildkit-build, init-values]` | `[init-values]` | Needs version metadata only |

## Artifact Flow

| Producer | Artifact | Consumer |
|----------|----------|----------|
| `init-values` | `branch.env` / `build.env` (dotenv) | sonar, buildkit-build, git-tag |
| `test` | `coverage/`, `coverage.xml` | sonar (coverage analysis) |
| `build` | `dist/` (application artifacts) | dockerbuild-verify, buildkit-build |
