# Task Catalog

Complete catalog of all 88 Tekton Tasks in the EDP-Tekton repository, organized by category.

All tasks follow:

- **API Version**: `tekton.dev/v1`
- **Naming Convention**: kebab-case
- **Location**: `charts/pipelines-library/templates/tasks/`
- **Helm Templated**: Conditional deployment via feature flags

---

## Category 1: Language-Specific Tasks

Tasks for compiling, building, and testing applications in specific programming languages.

### maven

**Description**: Maven build task for Java projects
**Key Parameters**:

- `GOALS` - Maven goals to execute (default: `[clean, package]`)
- `MAVEN_CONFIG_MAP` - Maven settings ConfigMap name
**Workspaces**:
- `source` - Project source code
- `maven-settings` - Maven configuration
**Common Usage**: Compile, test, package Java applications

### gradle

**Description**: Gradle build task for Java/Kotlin projects
**Key Parameters**:

- `TASKS` - Gradle tasks to execute (default: `[build]`)
- `GRADLE_CONFIG_MAP` - Gradle settings ConfigMap name
**Workspaces**:
- `source` - Project source code
**Common Usage**: Compile, test, build Java/Kotlin applications

### npm

**Description**: npm build task for JavaScript/TypeScript projects
**Key Parameters**:

- `SCRIPTS` - npm scripts to run (default: `[install, build, test]`)
- `NPM_CONFIG_MAP` - npm configuration ConfigMap name
**Workspaces**:
- `source` - Project source code
**Common Usage**: Install dependencies, build, test Node.js applications

### pnpm

**Description**: pnpm build task for JavaScript/TypeScript projects (faster alternative to npm)
**Key Parameters**:

- `SCRIPTS` - pnpm scripts to run
- `NPM_CONFIG_MAP` - npm/pnpm configuration ConfigMap name
**Workspaces**:
- `source` - Project source code
**Common Usage**: Install dependencies, build, test Node.js applications with pnpm

### python

**Description**: Python build and test task
**Key Parameters**:

- `COMMANDS` - Python commands to execute
- `PYTHON_CONFIG_MAP` - Python/pip configuration ConfigMap name
**Workspaces**:
- `source` - Project source code
**Common Usage**: Install dependencies (pip), run tests (pytest), build packages

### golang (go)

**Description**: Go build and test task
**Key Parameters**:

- `GOOS` - Target operating system
- `GOARCH` - Target architecture
- `COMMANDS` - Go commands to execute
**Workspaces**:
- `source` - Project source code
**Common Usage**: Build Go binaries, run tests (go test)

### dotnet

**Description**: .NET build and test task
**Key Parameters**:

- `COMMANDS` - .NET CLI commands
- `NUGET_CONFIG_MAP` - NuGet configuration ConfigMap name
**Workspaces**:
- `source` - Project source code
**Common Usage**: Restore packages, build, test .NET applications

### c

**Description**: C/C++ compilation task
**Key Parameters**:

- `BUILD_TOOL` - cmake or make
- `COMPILE_COMMANDS` - Compilation commands
**Workspaces**:
- `source` - Project source code
**Common Usage**: Compile C/C++ projects

### groovy (codenarc)

**Description**: Groovy build with CodeNarc analysis
**Key Parameters**:

- `CODENARC_CONFIG_MAP` - CodeNarc rules ConfigMap name
**Workspaces**:
- `source` - Project source code
**Common Usage**: Build Groovy projects with static analysis

---

## Category 2: Quality & Analysis Tasks

Tasks for code quality analysis, linting, and security scanning.

### sonar

**Description**: SonarQube code quality analysis task
**Key Parameters**:

- `SONAR_HOST_URL` - SonarQube server URL
- `SONAR_PROJECT_KEY` - Project key in SonarQube
**Workspaces**:
- `source` - Project source code with test results
**Common Usage**: SAST, code coverage, code smells, technical debt analysis

### codenarc

**Description**: CodeNarc static analysis for Groovy
**Key Parameters**:

- `CODENARC_RULES` - CodeNarc rules configuration
**Workspaces**:
- `source` - Groovy source code
**Common Usage**: Groovy code quality analysis

### helm-lint

**Description**: Helm chart linting task
**Key Parameters**:

- `CHART_PATH` - Path to Helm chart
- `VALUES_FILE` - values.yaml file path
**Workspaces**:
- `source` - Helm chart directory
**Common Usage**: Validate Helm chart syntax and best practices

### docker-lint

**Description**: Dockerfile linting with hadolint
**Key Parameters**:

- `DOCKERFILE_PATH` - Path to Dockerfile
**Workspaces**:
- `source` - Project with Dockerfile
**Common Usage**: Validate Dockerfile best practices

### docker-scan

**Description**: Container image vulnerability scanning
**Key Parameters**:

- `IMAGE` - Container image to scan
- `SCANNER` - Scanning tool (trivy, clair, etc.)
**Workspaces**:
- `source` - Scan reports output
**Common Usage**: CVE scanning, security vulnerability detection

---

## Category 3: VCS & Commit Tasks

Tasks for Git operations and VCS status reporting.

### git-clone

**Description**: Clone Git repository
**Key Parameters**:

- `url` - Git repository URL
- `revision` - Branch, tag, or commit SHA
- `depth` - Clone depth (default: 1 for shallow clone)
**Workspaces**:
- `output` - Cloned repository output
- `ssh-directory` - SSH credentials
**Common Usage**: First task in pipelines to fetch source code

### git-cli

**Description**: Execute arbitrary Git commands
**Key Parameters**:

- `GIT_SCRIPT` - Git commands to execute
**Workspaces**:
- `source` - Git repository
- `ssh-directory` - SSH credentials
**Common Usage**: Git tagging, commit operations, branch management

### github-set-status

**Description**: Set commit status in GitHub
**Key Parameters**:

- `REPO_URL` - GitHub repository URL
- `COMMIT_SHA` - Commit SHA
- `STATE` - Status state (pending, success, failure)
- `CONTEXT` - Status context
- `DESCRIPTION` - Status description
**Common Usage**: Report pipeline status to GitHub PRs

### gitlab-set-status

**Description**: Set merge request status in GitLab
**Key Parameters**:

- `REPO_URL` - GitLab project URL
- `COMMIT_SHA` - Commit SHA
- `STATE` - Status state
**Common Usage**: Report pipeline status to GitLab MRs

### bitbucket-set-status

**Description**: Set pull request status in BitBucket
**Key Parameters**:

- `REPO_URL` - BitBucket repository URL
- `COMMIT_SHA` - Commit SHA
- `STATE` - Build status
**Common Usage**: Report pipeline status to BitBucket PRs

### gerrit-notify

**Description**: Post review comment to Gerrit
**Key Parameters**:

- `GERRIT_HOST` - Gerrit server host
- `CHANGE_NUMBER` - Gerrit change number
- `PATCHSET_NUMBER` - Patchset number
- `MESSAGE` - Review message
**Common Usage**: Report pipeline results to Gerrit reviews

### gerrit-ssh-cmd

**Description**: Execute Gerrit SSH commands
**Key Parameters**:

- `GERRIT_HOST` - Gerrit server host
- `SSH_COMMAND` - SSH command to execute
**Common Usage**: Gerrit review operations via SSH

---

## Category 4: Build & Deployment Tasks

Tasks for building container images and deploying applications.

### container-build

**Description**: Build and push container images using Kaniko
**Key Parameters**:

- `IMAGE` - Target image name with tag
- `DOCKERFILE` - Path to Dockerfile (default: `./Dockerfile`)
- `CONTEXT` - Build context directory (default: `.`)
- `KANIKO_IMAGE` - Kaniko executor image
**Workspaces**:
- `source` - Build context with Dockerfile
- `dockerconfig` - Docker registry credentials
**Common Usage**: Build OCI images without Docker daemon

### helm-push

**Description**: Push Helm chart to registry
**Key Parameters**:

- `CHART_PATH` - Path to Helm chart
- `REGISTRY_URL` - Helm registry URL
- `CHART_VERSION` - Chart version
**Workspaces**:
- `source` - Helm chart directory
**Common Usage**: Publish Helm charts to ChartMuseum, Harbor, etc.

### helm-docs

**Description**: Generate Helm chart documentation
**Key Parameters**:

- `CHART_PATH` - Path to Helm chart
**Workspaces**:
- `source` - Helm chart directory
**Common Usage**: Auto-generate README.md from chart values and templates

### deploy-helm

**Description**: Deploy application using Helm
**Key Parameters**:

- `RELEASE_NAME` - Helm release name
- `CHART` - Chart name or path
- `NAMESPACE` - Target namespace
- `VALUES` - Helm values overrides
**Common Usage**: Deploy applications to Kubernetes

### deploy-kustomize

**Description**: Deploy application using Kustomize
**Key Parameters**:

- `KUSTOMIZE_PATH` - Path to kustomization.yaml
- `NAMESPACE` - Target namespace
**Common Usage**: Deploy applications with Kustomize overlays

### update-cbis (update-codebasebranch)

**Description**: Update CodebaseBranch resource after successful build
**Key Parameters**:

- `CODEBASEBRANCH_NAME` - CodebaseBranch resource name
- `GIT_TAG` - Git tag created
- `IMAGE_TAG` - Container image tag
**Common Usage**: Update CR with build artifacts (last task in build pipelines)

---

## Category 5: Infrastructure & Utility Tasks

Tasks for infrastructure management, caching, and versioning.

### terraform

**Description**: Execute Terraform commands
**Key Parameters**:

- `COMMAND` - Terraform command (plan, apply, destroy)
- `TERRAFORM_WORKSPACE` - Terraform workspace
- `VARIABLES` - Terraform variables
**Workspaces**:
- `source` - Terraform configuration files
**Common Usage**: Infrastructure provisioning and management

### ansible-run

**Description**: Run Ansible playbooks
**Key Parameters**:

- `PLAYBOOK` - Playbook file path
- `INVENTORY` - Ansible inventory
- `EXTRA_VARS` - Additional variables
**Workspaces**:
- `source` - Ansible playbooks and roles
**Common Usage**: Configuration management, application deployment

### get-version

**Description**: Generate version for application build
**Key Parameters**:

- `BRANCH_NAME` - Git branch name
- `VERSIONING_TYPE` - Version strategy (default, edp, semver)
**Outputs**:
- `VERSION` - Generated version string
**Common Usage**: First task in build pipelines after git-clone

### get-cache

**Description**: Restore artifact cache from storage
**Key Parameters**:

- `CODEBASE_NAME` - Codebase identifier
- `CACHE_NAME` - Cache identifier (maven, npm, go)
**Workspaces**:
- `cache` - Cache directory
**Common Usage**: Restore Maven .m2, npm node_modules, Go modules

### save-cache

**Description**: Save artifact cache to storage
**Key Parameters**:

- `CODEBASE_NAME` - Codebase identifier
- `CACHE_NAME` - Cache identifier
**Workspaces**:
- `cache` - Cache directory to save
**Common Usage**: Cache build artifacts after successful build

### ecr-to-docker

**Description**: Convert AWS ECR credentials to Docker config
**Key Parameters**:

- `ECR_REGISTRY` - AWS ECR registry URL
- `AWS_REGION` - AWS region
**Workspaces**:
- `dockerconfig` - Output Docker config.json
**Common Usage**: AWS ECR authentication for Kaniko builds

### getversion (defaulttype)

**Description**: Get version using default versioning strategy
**Key Parameters**:

- `BRANCH_NAME` - Git branch
**Outputs**:
- `VERSION` - Calculated version
**Common Usage**: Alternative to get-version task

### getversion (edptype)

**Description**: Get version using EDP versioning strategy
**Key Parameters**:

- `BRANCH_NAME` - Git branch
- `CODEBASEBRANCH_NAME` - CodebaseBranch CR name
**Outputs**:
- `VERSION` - Calculated version from CR
**Common Usage**: Version from CodebaseBranch resource

---

## Category 6: Specialized Tasks

Tasks for initialization, validation, and specialized workflows.

### init-values

**Description**: Initialize pipeline values and parameters
**Key Parameters**:

- `CODEBASE_NAME` - Codebase resource name
- `CODEBASEBRANCH_NAME` - CodebaseBranch resource name
**Outputs**:
- Various initialized parameters for pipeline
**Common Usage**: First task in pipelines to set up environment

### check-helm-chart-name

**Description**: Validate Helm chart name matches conventions
**Key Parameters**:

- `CHART_PATH` - Path to Helm chart
- `EXPECTED_NAME` - Expected chart name pattern
**Workspaces**:
- `source` - Helm chart directory
**Common Usage**: Validate chart naming before deployment

### run-autotests

**Description**: Execute automated test suites
**Key Parameters**:

- `TEST_TYPE` - Type of tests (integration, e2e, performance)
- `TEST_COMMAND` - Command to run tests
**Workspaces**:
- `source` - Test code and configuration
**Common Usage**: Run integration or end-to-end tests

---

## Task Usage Patterns

### Build Pipeline Task Sequence

```
1. init-values         - Initialize pipeline environment
2. get-version         - Generate build version
3. get-cache           - Restore artifact cache
4. [Language Task]     - Compile, test, package
5. sonar               - Code quality analysis
6. push-artifact       - Publish to artifact repository
7. container-build     - Build and push container image
8. save-cache          - Save artifact cache
9. git-cli             - Create git tag
10. update-cbis        - Update CodebaseBranch resource
Finally:
11. github-set-status  - Report status to VCS
```

### Review Pipeline Task Sequence

```
1. init-values         - Initialize pipeline environment
2. get-cache           - Restore artifact cache
3. [Language Task]     - Compile, test
4. sonar               - Code quality analysis
5. docker-lint         - Lint Dockerfile
6. helm-lint           - Lint Helm chart
7. save-cache          - Save artifact cache
Finally:
8. github-set-status   - Report status to VCS
```

---

## Common Parameters Across Tasks

### Standard Parameters

- `IMAGE` - Container image for task execution
- `EXTRA_COMMANDS` - Additional commands to execute
- `VERBOSE` - Enable verbose logging

### Workspace Parameters

- `source` - Source code workspace (subPath: source/)
- `cache` - Cache workspace (subPath: cache/)
- `ssh-directory` - SSH credentials workspace

### Configuration Parameters

- `MAVEN_CONFIG_MAP` - Maven settings (default: `custom-maven-settings`)
- `GRADLE_CONFIG_MAP` - Gradle settings (default: `custom-gradle-settings`)
- `NPM_CONFIG_MAP` - npm settings (default: `custom-npm-settings`)
- `PYTHON_CONFIG_MAP` - Python/pip settings (default: `custom-python-settings`)

---

## Task Feature Flags

Tasks are controlled by the `deployableResources.tasks` flag in values.yaml:

```yaml
pipelines:
  deployableResources:
    tasks: true  # Enable/disable all tasks
```

Individual tasks cannot be disabled separately - they're either all enabled or all disabled.

---

## Creating Custom Tasks

To add a new task:

1. Use onboarding script:

   ```bash
   ./hack/onboarding-component.sh --type task -n my-task
   ```

2. Edit generated file: `charts/pipelines-library/templates/tasks/my-task.yaml`

3. Define:
   - Parameters (`spec.params`)
   - Steps (`spec.steps`) with container images and commands
   - Workspaces (`spec.workspaces`)
   - Results (`spec.results`) if task outputs values

4. Validate:

   ```bash
   helm template charts/pipelines-library | yq
   yamllint charts/pipelines-library/templates/tasks/my-task.yaml
   ```

5. Test in pipeline by referencing task:

   ```yaml
   tasks:
     - name: my-custom-task
       taskRef:
         name: my-task
       params:
         - name: PARAM1
           value: "value"
   ```
