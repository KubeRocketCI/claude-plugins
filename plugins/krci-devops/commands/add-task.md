---
description: Onboard a new Tekton Task to EDP-Tekton repository
argument-hint: <task-name>
allowed-tools: [Read, Grep, Glob, Bash, Skill, Task]
---

# Task: Onboard New Tekton Task

**CRITICAL: Follow this workflow to onboard the Tekton Task:**

1. **Load required skill using Skill tool:**
   - Load krci-devops:edp-tekton-standards skill

2. **Use devops agent to perform the onboarding:**
   - The devops agent will onboard a new Tekton Task named `$ARGUMENTS`
   - Agent will apply all standards from the edp-tekton-standards skill:
     - Repository structure requirements
     - Task naming conventions (kebab-case)
     - Helm chart templating patterns
     - Validation requirements
   - Agent will execute the onboarding script and verify task creation

This skill contains ALL the standards, naming conventions, and best practices the agent will apply during task onboarding.

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
- Onboarding script: `./charts/pipelines-library/scripts/onboarding-component.sh`

**Validation (mandatory before starting):**

1. Verify current directory is within the EDP-Tekton repository clone.
2. Ensure the directory `./charts/pipelines-library/templates/tasks` exists. If not — inform user and halt command execution.
3. Ensure the onboarding script exists at `./charts/pipelines-library/scripts/onboarding-component.sh`. If missing — inform user of exact path and halt command execution.
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
- executed_command: "./charts/pipelines-library/scripts/onboarding-component.sh --type task -n <task_name>"
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
./charts/pipelines-library/scripts/onboarding-component.sh --type task -n ansible-run
./charts/pipelines-library/scripts/onboarding-component.sh --type task -n maven-build
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

## Post-Implementation Steps

<post_implementation>

- Validate Helm template syntax:

```sh
helm template charts/pipelines-library | yq
```

- Review generated task structure for completeness
- Verify task integration with existing pipelines if applicable
</post_implementation>
