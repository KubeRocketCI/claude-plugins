# Supported Languages & Frameworks

Complete reference for all languages and frameworks supported in the EDP-Tekton repository.

The repository contains **394 pipeline files** organized by language, framework, and VCS provider.

## Language Coverage

### Java

**Supported Versions**: java17, java21, java25

**Build Tools**:

- Maven (primary)
- Gradle (alternative)

**Frameworks**:

- Spring Boot (most common)
- Generic Java applications
- Microservices

**Pipeline Naming Examples**:

- `github-maven-java17-app-build-default.yaml`
- `gitlab-gradle-java21-app-review.yaml`
- `bitbucket-maven-java25-app-build-default.yaml`

**Key Tasks**:

- `maven` - Maven build task (compile, test, package)
- `gradle` - Gradle build task
- `sonar` - SonarQube code quality analysis

---

### JavaScript / TypeScript

**Package Managers**:

- npm (Node Package Manager)
- pnpm (Performant npm)

**Frameworks**:

- **angular** - Angular framework
- **antora** - Antora documentation site generator
- **express** - Express.js web framework
- **next** - Next.js React framework
- **react** - React library
- **vue** - Vue.js framework

**Pipeline Naming Examples**:

- `github-npm-react-app-build-default.yaml`
- `gitlab-pnpm-next-app-review.yaml`
- `bitbucket-npm-angular-app-build-default.yaml`

**Key Tasks**:

- `npm` - npm build and test task
- `pnpm` - pnpm build and test task
- `sonar` - Code quality analysis

---

### Python

**Supported Versions**: python3.8 (and higher)

**Frameworks**:

- **flask** - Flask web framework
- **fastapi** - FastAPI async framework
- **ansible** - Ansible automation (Python-based)

**Pipeline Naming Examples**:

- `github-python-fastapi-app-build-default.yaml`
- `gitlab-python-flask-app-review.yaml`
- `bitbucket-python-ansible-app-build-default.yaml`

**Key Tasks**:

- `python` - Python build and test task
- `sonar` - Code quality analysis

---

### Go (Golang)

**Frameworks**:

- **beego** - Beego web framework
- **gin** - Gin HTTP web framework
- **operatorsdk** - Kubernetes Operator SDK

**Pipeline Naming Examples**:

- `github-go-gin-app-build-default.yaml`
- `gitlab-go-beego-app-review.yaml`
- `bitbucket-go-operatorsdk-app-build-default.yaml`

**Key Tasks**:

- `golang` - Go build and test task
- `sonar` - Code quality analysis

---

### C / C++

**Build Tools**:

- **cmake** - CMake build system
- **make** - GNU Make

**Pipeline Naming Examples**:

- `github-c-cmake-app-build-default.yaml`
- `gitlab-c-make-app-review.yaml`

**Key Tasks**:

- `c` - C/C++ compilation task

---

### C# / .NET

**Supported Versions**:

- dotnet3.1
- dotnet6.0

**Pipeline Naming Examples**:

- `github-dotnet-dotnet6.0-app-build-default.yaml`
- `gitlab-dotnet-dotnet3.1-app-review.yaml`

**Key Tasks**:

- `dotnet` - .NET build and test task
- `sonar` - Code quality analysis

---

### Groovy

**Pipeline Naming Examples**:

- `github-groovy-codenarc-app-build-default.yaml`
- `gitlab-groovy-codenarc-app-review.yaml`

**Key Tasks**:

- `codenarc` - Groovy code analysis

---

### Infrastructure as Code

#### Terraform

**Pipeline Naming Examples**:

- `github-terraform-terraform-app-build-default.yaml`
- `gitlab-terraform-terraform-app-review.yaml`

**Key Tasks**:

- `terraform` - Terraform plan/apply task

#### Ansible

**Pipeline Naming Examples**:

- `github-python-ansible-app-build-default.yaml`
- `gitlab-python-ansible-app-review.yaml`

**Key Tasks**:

- `ansible-run` - Ansible playbook execution task

#### OPA (Open Policy Agent)

**Pipeline Naming Examples**:

- `github-opa-opa-app-build-default.yaml`
- `gitlab-opa-opa-app-review.yaml`

---

### Container & Kubernetes

#### Docker

**Pipeline Type**: Container-only builds

**Pipeline Naming Examples**:

- `github-docker-docker-app-build-default.yaml`
- `gitlab-docker-docker-app-review.yaml`

**Key Tasks**:

- `container-build` - Kaniko-based container build
- `docker-lint` - Dockerfile linting
- `docker-scan` - Container security scanning

#### Helm

**Pipeline Types**:

- `helm-pipeline` - Helm chart pipelines
- `helm-libraries` - Helm library chart pipelines

**Pipeline Naming Examples**:

- `github-helm-helm-app-build-default.yaml`
- `gitlab-helm-helm-libraries-app-review.yaml`

**Key Tasks**:

- `helm-lint` - Helm chart linting
- `helm-docs` - Helm documentation generation
- `helm-push` - Push chart to registry

---

### Specialized Pipelines

#### Infrastructure Pipelines

**Description**: Infrastructure provisioning and management

**Pipeline Naming Examples**:

- `github-infrastructure-terraform-app-build-default.yaml`

#### Autotests

**Description**: Automated testing pipelines

**Pipeline Naming Examples**:

- `github-autotests-gradle-autotest-build-default.yaml`
- `gitlab-autotests-maven-autotest-review.yaml`

**Key Tasks**:

- `run-autotests` - Execute automated test suites

#### CD (Continuous Deployment)

**Description**: Deployment pipelines for applications

**Pipeline Naming Examples**:

- `cd-pipeline.yaml` (VCS-agnostic)

**Key Tasks**:

- `deploy-helm` - Deploy using Helm
- `deploy-kustomize` - Deploy using Kustomize

#### Security

**Description**: Security scanning pipelines

**Pipeline Naming Examples**:

- `security-pipeline.yaml` (VCS-agnostic)

**Key Tasks**:

- `docker-scan` - Container vulnerability scanning
- `sonar` - SAST (Static Application Security Testing)

#### GitOps

**Description**: GitOps workflow pipelines

**Pipeline Naming Examples**:

- `gitops-pipeline.yaml` (VCS-agnostic)

#### RPM

**Description**: RPM package build pipelines

**Pipeline Naming Examples**:

- `github-rpm-rpm-app-build-default.yaml`

---

## VCS Provider Support

All languages support all 4 VCS providers:

- GitHub
- GitLab
- Gerrit
- BitBucket

Exception: Some specialized pipelines (CD, Security, GitOps) are VCS-agnostic.

---

## Pipeline Types

### Build Pipelines

**Suffix**: `-build-default` or `-build-edp`

**Purpose**: Build and deploy applications on merge to main branch

**Contains**:

- Version generation
- Compilation and testing
- Artifact publishing (Maven, npm, PyPI)
- Container image build and push
- Git tagging
- CodebaseBranch updates
- JIRA/VCS status reporting

### Review Pipelines

**Suffix**: `-review`

**Purpose**: Validate code changes in Pull Requests / Merge Requests

**Contains**:

- Compilation and testing
- Code quality checks (Sonar)
- Linting (docker-lint, helm-lint)
- NO artifact publishing
- NO container builds
- VCS status reporting only

---

## Feature Flags

All language pipelines are controlled by `deployableResources` in values.yaml:

```yaml
pipelines:
  deployableResources:
    tasks: true
    java: {java17: true, java21: true, java25: false}
    js:
      npm: {react: true, angular: false, vue: true}
      pnpm: {next: true}
    python: {fastapi: true, flask: false, ansible: true}
    go: {beego: true, gin: true, operatorsdk: true}
    c: {cmake: true, make: false}
    cs: {dotnet3.1: false, dotnet6.0: true}
    # ... more flags
```

To enable/disable a language or framework:

1. Modify `values.yaml`
2. Reinstall the Helm chart: `helm upgrade --install ...`

---

## Adding New Languages

To add support for a new language, you need:

1. **Pipeline YAML files** in `charts/pipelines-library/templates/pipelines/{language}/`
   - Build pipeline: `{vcs}-{language}-{framework}-app-build-default.yaml`
   - Review pipeline: `{vcs}-{language}-{framework}-app-review.yaml`

2. **Task YAML file** (if new task needed) in `charts/pipelines-library/templates/tasks/`
   - Task name: `{language}.yaml`

3. **values.yaml configuration**:
   - Add to `deployableResources.{language}`
   - Add image mapping in `_helpers.tpl`

4. **Common template** (optional) in `charts/pipelines-library/templates/pipelines/`
   - `_common_{language}.yaml` for reusable task patterns

See the CLAUDE.md file in the repository root for detailed instructions.
