---
description: Onboard a new Tekton Task to EDP-Tekton repository
argument-hint: <task-name>
allowed-tools: [Read, Grep, Glob, Bash, Skill, Task, AskUserQuestion]
---

# Task: Onboard New Tekton Task

**CRITICAL: Follow this workflow to onboard the Tekton Task:**

1. **Load required skill using Skill tool:**
   - Load krci-devops:edp-tekton-standards skill (ALWAYS)

2. **Ask user about task category using AskUserQuestion:**
   - Question: "What category does this task belong to?"
     - Options:
       1. "Language-Specific (compile/build/test)" - For language-specific build tasks
       2. "Quality & Analysis (linting/scanning)" - For code quality and security
       3. "VCS & Commit (git operations)" - For Git and VCS status reporting
       4. "Build & Deployment (containers/helm)" - For building images and deploying
       5. "Infrastructure & Utility (cache/version)" - For infrastructure and utilities
       6. "Specialized (init/validation)" - For initialization and validation tasks
   - Based on category, provide guidance on:
     - Common parameters for that category
     - Typical workspace usage
     - Examples of similar tasks

3. **Use devops agent to onboard the task:**

   Use the devops agent to onboard a new Tekton Task named `$ARGUMENTS`. The edp-tekton-standards skill has been loaded and contains all required conventions.

   **Repository Context**:
   - Working in EDP-Tekton repository (<https://github.com/epam/edp-tekton>)
   - 88 existing tasks across 6 categories
   - Task category guidance provided by user in step 2

   **Onboarding Workflow**:
   1. Verify repository structure (./hack/onboarding-component.sh must exist)
   2. Execute onboarding script: `./hack/onboarding-component.sh --type task --name $ARGUMENTS`
   3. The script generates a TEMPLATE file at: `./charts/pipelines-library/templates/tasks/$ARGUMENTS.yaml`
   4. Read the generated template and fill in placeholders:
      - `<LABELS_BLOCK>`: Add labels appropriate for task category
      - `<TASK_DESCRIPTION>`: Write clear description of task functionality
      - `<PROJECT_DIR_DEFAULT>`: Set default project directory (typically '.')
      - `<BASE_IMAGE_SUFFIX>`: Set base container image for task execution
   5. Use task category patterns and similar task examples from skill references to determine values
   6. Validate final file:
      - No remaining `<...>` placeholder tags
      - Valid YAML structure with `apiVersion: tekton.dev/v1` and `kind: Task`
      - `metadata.name` matches task name
   7. Report created file path and summarize the configuration

   The agent should deliver a complete, ready-to-use task file with all placeholders properly filled based on task category and repository patterns.

---

## Task Overview

<task_overview>
Automate the process of adding a new Tekton **Task** to the `edp-tekton` repository.
The agent uses the onboarding script to generate a Helm-templated Task file under
`./charts/pipelines-library/templates/tasks`, follows repository conventions, and
prepares the file for review.
</task_overview>

---

## Reference Assets (Prerequisites)

<prerequisites>
**CRITICAL REQUIREMENT**: This command must be executed from within the **EDP-Tekton repository**: https://github.com/epam/edp-tekton

If the user is not in the EDP-Tekton repository, inform them:

- Clone the repository: `git clone https://github.com/epam/edp-tekton.git`
- Navigate into it: `cd edp-tekton`
- Then run this command

Dependencies:

- Tekton overview: [tekton-overview](https://docs.kuberocketci.io/docs/operator-guide/ci/tekton-overview)
- User guide: [tekton-pipelines](https://docs.kuberocketci.io/docs/user-guide/tekton-pipelines)
- Custom pipelines flow: [custom-pipelines-flow](https://docs.kuberocketci.io/docs/use-cases/custom-pipelines-flow)

**Repository structure & constants:**

- Target repository: <https://github.com/epam/edp-tekton>
- Directory for new tasks: `./charts/pipelines-library/templates/tasks`
- Onboarding script: `./hack/onboarding-component.sh`

**Validation (mandatory before starting):**

1. Verify current directory is within the EDP-Tekton repository clone.
2. Ensure the directory `./charts/pipelines-library/templates/tasks` exists. If not — inform user and halt command execution.
3. Ensure the onboarding script exists at `./hack/onboarding-component.sh`. If missing — inform user of exact path and halt command execution.
4. Verify online documentation URLs are reachable. If not, continue with a warning.
</prerequisites>

---

## Instructions

<instructions>
1. Review the reference documentation (links above).
2. Collect the task name from the user (kebab-case format).
   - Use `$ARGUMENTS` if provided
   - Otherwise ask: "Please provide the name of the new Tekton Task (kebab-case), for example: `ansible-run`"
3. Run the onboarding script with `--type task -n <task_name>`.
4. Verify the new file is created under `./charts/pipelines-library/templates/tasks/`.
5. Report back the file path and confirm creation.
</instructions>

---

## Output Format

<output_format>

- created_file: "./charts/pipelines-library/templates/tasks/<task_name>.yaml"
- executed_command: "./hack/onboarding-component.sh --type task -n <task_name>"
- validation:
  - file_exists: true
  - contains_apiVersion_and_kind: ["apiVersion: tekton.dev/v1", "kind: Task"]
</output_format>

---

## Execution Checklist

<execution_checklist>

1. Collect `task_name` from user (use $ARGUMENTS or ask).
2. Validate task name follows kebab-case convention.
3. Run onboarding script with `--type task -n <task_name>`.
4. Verify created file under `./charts/pipelines-library/templates/tasks/`.
5. Confirm `metadata.name` equals the task name.
6. Report created file path and executed command.
</execution_checklist>

---

## Required Inputs

<user_inputs>
**Mandatory:**

- `task_name` — task name (kebab-case), used in the `-n` flag and the generated file.

**Example question for the user (if $ARGUMENTS not provided):**
_"Please provide the name of the new Tekton Task (kebab-case), for example: `ansible-run`."_
</user_inputs>

---

## Usage Examples

<usage_examples>

```sh
./hack/onboarding-component.sh --type task -n ansible-run
./hack/onboarding-component.sh --type task -n maven-build
```

</usage_examples>

---

## Acceptance Criteria

<success_criteria>

- [ ] The onboarding script is executed with `--type task` parameter
- [ ] Task name follows kebab-case convention
- [ ] New Task file exists under './charts/pipelines-library/templates/tasks/'
- [ ] Task file contains proper Helm template wrapping
- [ ] Task file contains `apiVersion: tekton.dev/v1`, `kind: Task`
- [ ] Task file has proper metadata, labels and descriptions
- [ ] The agent reports back the created file path
</success_criteria>

---

## Task Category Guidance

<task_categories>

Based on the task category, provide the following guidance:

### 1. Language-Specific Tasks

**Common Parameters**:

- `IMAGE` - Runtime image (maven:3.9, node:18, python:3.11, etc.)
- `GOALS` / `TASKS` / `SCRIPTS` - Build commands
- `CONFIG_MAP` - Language-specific configuration

**Workspaces**:

- `source` - Source code (workspace: shared-workspace, subPath: source)
- `cache` - Artifact cache (optional)

**Examples**: maven, gradle, npm, pnpm, python, golang, dotnet, c

### 2. Quality & Analysis Tasks

**Common Parameters**:

- `SONAR_HOST_URL` - Analysis server
- `PROJECT_KEY` - Project identifier
- `SEVERITY_THRESHOLD` - Quality gate threshold

**Workspaces**:

- `source` - Code to analyze

**Examples**: sonar, codenarc, helm-lint, docker-lint, docker-scan

### 3. VCS & Commit Tasks

**Common Parameters**:

- `REPO_URL` - Repository URL
- `COMMIT_SHA` - Commit identifier
- `STATE` - Status (pending/success/failure)

**Workspaces**:

- `source` - Git repository (optional)
- `ssh-directory` - SSH credentials

**Examples**: git-clone, git-cli, github-set-status, gitlab-set-status, gerrit-notify

### 4. Build & Deployment Tasks

**Common Parameters**:

- `IMAGE` - Container image name
- `DOCKERFILE` - Dockerfile path
- `CHART_PATH` - Helm chart path
- `NAMESPACE` - Target namespace

**Workspaces**:

- `source` - Build context
- `dockerconfig` - Registry credentials

**Examples**: container-build, helm-push, deploy-helm, update-cbis

### 5. Infrastructure & Utility Tasks

**Common Parameters**:

- `CODEBASE_NAME` - Codebase identifier
- `CACHE_NAME` - Cache identifier
- `VERSIONING_TYPE` - Version strategy

**Workspaces**:

- `cache` - Cache storage
- `source` - Terraform/Ansible files

**Examples**: terraform, ansible-run, get-version, get-cache, save-cache

### 6. Specialized Tasks

**Common Parameters**:

- `CODEBASE_NAME` - Codebase resource
- `CODEBASEBRANCH_NAME` - CodebaseBranch resource

**Outputs**:

- Various initialized parameters

**Examples**: init-values, check-helm-chart-name, run-autotests

</task_categories>

## Post-Implementation Steps

<post_implementation>

- Validate Helm template syntax:

```sh
helm template charts/pipelines-library | yq
```

- Review generated task structure for completeness
- Verify task integration with existing pipelines if applicable
- Reference the task catalog: `skills/edp-tekton-standards/references/tasks.md` for similar tasks
</post_implementation>
