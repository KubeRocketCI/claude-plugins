---
description: Onboard new Tekton Pipelines (Build and Review) to EDP-Tekton repository
argument-hint: <vcs> <language> <framework>
allowed-tools: [Read, Grep, Glob, Bash, Skill, Task, AskUserQuestion]
---

# Task: Onboard New Tekton Pipelines (Build & Review)

**CRITICAL: Follow this workflow to onboard the Tekton Pipelines:**

1. **Load required skill using Skill tool:**
   - Load krci-devops:edp-tekton-standards skill (ALWAYS)

2. **Ask user about additional requirements using AskUserQuestion:**
   - Question 1: "Do you want to create triggers for these pipelines?"
     - Options: "Yes, create triggers" / "No, pipelines only"
     - If YES: Note that trigger creation is planned for Phase 2 (future)

   - Question 2: "Does your language/framework need to be enabled in values.yaml?"
     - Options: "Yes, check feature flags" / "No, already enabled" / "Not sure"
     - If YES or NOT SURE: Guide user on checking and modifying deployableResources

3. **Use devops agent to onboard the pipelines:**

   Use the devops agent to onboard TWO Tekton Pipelines (build and review) using `$ARGUMENTS`. The edp-tekton-standards skill has been loaded and contains all required conventions.

   **Repository Context**:
   - Working in EDP-Tekton repository (<https://github.com/epam/edp-tekton>)
   - 394 existing pipelines across 10+ languages and frameworks
   - User preferences for triggers and feature flags from step 2

   **Arguments Parsing**:
   - Parse `$ARGUMENTS` as: `<vcs> <language> <framework>`
   - Examples: `github java springboot`, `gitlab python fastapi`

   **Onboarding Workflow**:
   1. Verify repository structure (./hack/onboarding-component.sh must exist)
   2. Generate pipeline names following naming conventions:
      - Build: `{vcs}-{language}-{framework}-app-build-default`
      - Review: `{vcs}-{language}-{framework}-app-review`
   3. Execute onboarding script TWICE:
      - `./hack/onboarding-component.sh --type build --vcs {vcs} --name {build-pipeline-name}`
      - `./hack/onboarding-component.sh --type review --vcs {vcs} --name {review-pipeline-name}`
   4. The script generates COMPLETE, functional pipeline files (no placeholders):
      - Build: `./charts/pipelines-library/templates/pipelines/{build-pipeline-name}.yaml`
      - Review: `./charts/pipelines-library/templates/pipelines/{review-pipeline-name}.yaml`
   5. Validate both generated files:
      - Proper YAML structure with `apiVersion: tekton.dev/v1` and `kind: Pipeline`
      - `metadata.name` matches filename (without .yaml)
      - VCS-specific parameters and tasks are correct
      - Feature flag wrapping: `{{ if .Values.pipelines.deployableResources.{pipeline-name} }}`
   6. Check feature flag status in values.yaml:
      - Look for `pipelines.deployableResources.{language}.{framework}`
      - Inform user if flag needs to be enabled
   7. Report both created file paths and feature flag status

   The agent should deliver two complete, functional pipelines ready for deployment (after feature flag enablement if needed).

---

## Task Overview

<task_overview>
Automate the process of adding new Tekton **Build** and **Review** Pipelines to the *edp-tekton* repository.
The agent must use the onboarding script to generate **two pipelines** (build and review) under
'./charts/pipelines-library/templates/pipelines', follow repository conventions, and apply the enforced naming pattern.

The user provides:

- *vcs* — VCS type (e.g., github, gitlab, bitbucket)
- *language* — programming language (e.g., python, java, javascript)
- *framework* — framework/tool (e.g., fastapi, springboot, npm)

The agent then generates **two pipelines** using the onboarding script:

- one with type `build-pipeline`
- one with type `review-pipeline`

There are two types of versioning suffixes used in the naming convention: `edp` and `default`. This suffix is placed at the end of the build pipeline name. Currently, only the `default` suffix is actively used, but both exist as part of the standard naming scheme. The agent must not confuse these suffixes and must strictly follow the naming rule as specified.

Both must follow the enforced naming patterns:

- Build:

  ```text
  <vcs>-<language>-<framework>-app-build-default
  ```

- Review:

  ```text
  <vcs>-<language>-<framework>-app-review
  ```

After generation, the agent validates file existence and reports results.
The **file name** and the **metadata.name** inside the pipeline YAML must match the same pattern.
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

- Tekton overview: <https://docs.kuberocketci.io/docs/operator-guide/ci/tekton-overview>
- User guide: <https://docs.kuberocketci.io/docs/user-guide/tekton-pipelines>
- Custom pipelines flow: <https://docs.kuberocketci.io/docs/use-cases/custom-pipelines-flow>

**Repository structure & constants:**

- Target repository: <https://github.com/epam/edp-tekton>
- Directory for new pipelines: './charts/pipelines-library/templates/pipelines'
- Onboarding script: './hack/onboarding-component.sh'

**Validation (mandatory before starting):**

1. Verify current directory is within the EDP-Tekton repository clone.
2. Ensure the directory './charts/pipelines-library/templates/pipelines' exists. If not — inform user and halt command execution.
3. Ensure the onboarding script exists at './hack/onboarding-component.sh'. If missing — inform user of exact path and halt command execution.
4. Verify online documentation URLs are reachable. If not, continue with a warning.
</prerequisites>

---

## Instructions

<instructions>
1. Review the reference documentation (links above).
2. Collect input values from the user (see *Required Inputs*).
   - Use `$ARGUMENTS` if provided (expect: `<vcs> <language> <framework>`)
   - Otherwise ask user for each value individually using AskUserQuestion
3. Derive final pipeline names based on the patterns above.
   - Example: `gitlab-python-fastapi-app-build-default`, `gitlab-python-fastapi-app-review`.
4. Run the onboarding script twice:

```sh
./hack/onboarding-component.sh --type build-pipeline -n <vcs>-<language>-<framework>-app-build-default --vcs <vcs>
./hack/onboarding-component.sh --type review-pipeline -n <vcs>-<language>-<framework>-app-review --vcs <vcs>
```

1. Verify that both files are created under './charts/pipelines-library/templates/pipelines/'.
2. Verify that the `metadata.name` inside each pipeline matches the file name.
3. **Important rule**:
   - Do **not** remove configurations created by the onboarding script.
   - Allowed changes:
     - Update parameter descriptions
     - Update default values
     - Update metadata (labels, annotations, descriptions)
     - Add new parameters, steps, or sections if required
   - Forbidden changes:
     - Removing parameters
     - Removing steps
     - Removing or restructuring core sections of the pipelines
   - Make changes incrementally, based on existing pipelines.
4. Report back the file paths and confirm creation/update.
</instructions>

---

## Output Format

<output_format>

- created_files:
  - "./charts/pipelines-library/templates/pipelines/<vcs>-<language>-<framework>-app-build-default.yaml"
  - "./charts/pipelines-library/templates/pipelines/<vcs>-<language>-<framework>-app-review.yaml"
- executed_commands:
  - "./hack/onboarding-component.sh --type build-pipeline -n <name> --vcs <vcs>"
  - "./hack/onboarding-component.sh --type review-pipeline -n <name> --vcs <vcs>"
- validation:
  - metadata_name_matches_filename: true
  - contains_apiVersion_and_kind: ["apiVersion: tekton.dev/v1", "kind: Pipeline"]
</output_format>

---

## Execution Checklist

<execution_checklist>

1. Collect inputs: `vcs`, `language`, `framework` (from $ARGUMENTS or ask user).
2. Derive pipeline names following patterns.
3. Run onboarding script for build pipeline (see `executed_commands`).
4. Run onboarding script for review pipeline (see `executed_commands`).
5. Verify both files exist under `./charts/pipelines-library/templates/pipelines/`.
6. Open both files and confirm `metadata.name` equals filename (without .yaml).
7. Confirm both manifests include `apiVersion: tekton.dev/v1` and `kind: Pipeline`.
8. Report executed commands and created file paths.
</execution_checklist>

---

## Required Inputs

<user_inputs>
**Mandatory:**

- *vcs* — VCS provider, e.g., github, gitlab, bitbucket
- *language* — programming language, e.g., python, java, javascript
- *framework* — framework/tool, e.g., fastapi, springboot, npm

**Example questions to the user (if $ARGUMENTS not provided):**

Use AskUserQuestion tool to ask:

- *Which VCS provider are you targeting (github, gitlab, bitbucket)?*
- *What is the programming language (python, java, javascript)?*
- *What framework or build tool is used (fastapi, springboot, npm)?*
</user_inputs>

---

## Usage Examples

<usage_examples>

### Example 1: GitLab Python FastAPI

```sh
./hack/onboarding-component.sh --type build-pipeline -n gitlab-python-fastapi-app-build-default --vcs gitlab
./hack/onboarding-component.sh --type review-pipeline -n gitlab-python-fastapi-app-review --vcs gitlab
```

### Example 2: GitHub Java SpringBoot

```sh
./hack/onboarding-component.sh --type build-pipeline -n github-java-springboot-app-build-default --vcs github
./hack/onboarding-component.sh --type review-pipeline -n github-java-springboot-app-review --vcs github
```

</usage_examples>

---

## Acceptance Criteria

<success_criteria>

- [ ] The onboarding script is executed twice: once with `--type build-pipeline`, once with `--type review-pipeline`.
- [ ] Pipeline names strictly follow the patterns:
  - `<vcs>-<language>-<framework>-app-build-default`
  - `<vcs>-<language>-<framework>-app-review`
- [ ] File names match the patterns exactly.
- [ ] `metadata.name` inside each pipeline YAML matches its file name.
- [ ] Two new Pipeline files exist under './charts/pipelines-library/templates/pipelines/'.
- [ ] Both files contain `apiVersion: tekton.dev/v1`, `kind: Pipeline`.
- [ ] Existing structures generated by the script remain intact.
- [ ] Only non-destructive updates are applied (metadata, descriptions, default values).
- [ ] The agent reports back executed commands and created/updated file path(s).
</success_criteria>

---

## Feature Flag Verification

<feature_flags>

After creating pipelines, verify they will be deployed by checking values.yaml:

```yaml
pipelines:
  deployableResources:
    {language}:
      {framework}: true   # Must be true to deploy
```

**Example for Python FastAPI**:

```yaml
pipelines:
  deployableResources:
    python:
      fastapi: true       # Enables gitlab-python-fastapi pipelines
      flask: false        # Disables flask pipelines
```

**If framework is set to `false`**:

1. Edit `charts/pipelines-library/values.yaml`
2. Set the framework flag to `true`
3. Reinstall chart: `helm upgrade --install edp-tekton charts/pipelines-library`

**Supported languages** (from skill context):

- Java: java17, java21, java25
- JavaScript: npm.{react, angular, vue, next, express}, pnpm.{next}
- Python: fastapi, flask, ansible
- Go: beego, gin, operatorsdk
- C: cmake, make
- C#: dotnet3.1, dotnet6.0
- Others: groovy, opa, terraform, docker, helm, rpm

</feature_flags>

## Post-Implementation Steps

<post_implementation>

- Render & lint:

```sh
helm template charts/pipelines-library | yq
yamllint .
```

- Verify pipelines will be deployed:
  1. Check values.yaml feature flag for your language/framework
  2. Ensure framework is enabled: `{language}.{framework}: true`

- (Optional) Create or update PipelineRuns for testing.
- (Optional) Integrate the pipelines into your application flow or App of Apps.
- (Optional) Run validation: `/krci-devops:validate` (when available)
</post_implementation>

## Quality Review

<quality_review>
After pipelines are created and validated, launch **3 code-reviewer agents in parallel** using the Task tool to review the generated pipeline YAML:

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
