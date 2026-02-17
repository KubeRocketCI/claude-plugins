---
description: Scaffold a new GitLab CI/CD component library for KubeRocketCI
argument-hint: <language>
allowed-tools: [Read, Grep, Glob, Bash, Skill, Task, AskUserQuestion]
---

# Task: Scaffold GitLab CI/CD Component Library

**CRITICAL: Follow this workflow to scaffold the component library:**

1. **Load required skill using Skill tool:**
   - Load krci-devops:gitlab-ci-component-standards skill (ALWAYS)

2. **Ask user about requirements using AskUserQuestion:**
   - Question 1: "Which technology stack?"
     - Options: "Go" / "Java 17 Gradle" / "Java 17 Maven" / "Node.js npm" / "Python uv" / "Custom"
     - Use `$ARGUMENTS` if provided (e.g., `golang`, `java17-gradle`, `java17-mvn`, `nodejs-npm`, `python-uv`)
     - If Custom: ask for container image, test command, build command, lint command, cache key file

   - Question 2: "Include Helm chart (deploy-templates/)?"
     - Options: "Yes, include Helm chart (Recommended)" / "No, skip Helm chart"

3. **Use devops agent to scaffold the component library:**

   Use the devops agent to scaffold a complete GitLab CI/CD component library. The gitlab-ci-component-standards skill has been loaded and contains all required patterns, templates, and language profiles.

   **Arguments Parsing**:
   - Parse `$ARGUMENTS` as: `<language>` (e.g., `golang`, `java17-mvn`, `python-uv`)
   - Derive repository name: `ci-<language>` (e.g., `ci-golang`, `ci-java17-mvn`)

   **Scaffolding Workflow**:
   1. Create the project directory `ci-<language>/`
   2. Generate `templates/common.yml`:
      - Include all hidden job templates from the skill reference
      - Implement tech-specific extension points (`.test-job`, `.build-job`, `.lint-job`, `.dependency-cache`)
      - Use the language profile from `references/language-profiles.md`
   3. Generate `templates/review.yml`:
      - MR pipeline with 4 stages: `[prepare, test, build, verify]`
      - 10 jobs with mandatory dependency chain
      - PR-mode SonarQube analysis (`-Dsonar.pullrequest.*`)
      - `dockerbuild-verify` with `push=false`
   4. Generate `templates/build.yml`:
      - Main branch pipeline with 5 stages: `[prepare, test, build, package, publish]`
      - 12 jobs with mandatory dependency chain
      - Branch-mode SonarQube analysis (`-Dsonar.branch.name`)
      - `buildkit-build` with `push=true`
      - `git-tag` for version tagging
      - Optional `package-publish` for artifact registries
   5. Generate `.gitlab-ci.yml`:
      - Workflow rules (MR events, protected branches, semver tags)
      - Conditional component inclusion (review for MR, build for protected)
      - Global variables (CODEBASE_NAME, CONTAINER_IMAGE, IMAGE_REGISTRY, SONAR_ORG, CHART_DIR)
      - `create-release` job for CI/CD Catalog publishing
   6. Generate `README.md`:
      - Overview, quick start, components documentation
      - Inputs table with all spec inputs
      - Implementation guide for the tech stack
      - Consumer usage examples
   7. Generate `Dockerfile`:
      - Packaging-only pattern (no build steps)
      - Language-appropriate runtime base image
   8. Generate `sonar-project.properties`:
      - Language-specific source paths, exclusions, coverage report paths
   9. Generate supporting files:
      - `.gitignore` (IDE, build artifacts, dependencies, cache, .env)
      - `.prettierrc` (YAML formatting config)
      - `LICENSE.md` (MIT License, Copyright KubeRocketCI)
   10. If Helm chart requested: Generate `deploy-templates/`:
       - `Chart.yaml` (apiVersion v2, type application, version 0.1.0)
       - `values.yaml` (comprehensive Kubernetes deployment config)
       - `README.md` + `README.md.gotmpl` (helm-docs)
       - `templates/.gitkeep`
   11. Validate all generated files:
       - All three template files exist in `templates/`
       - `spec:` sections have typed inputs with defaults
       - `$[[ inputs.name ]]` interpolation used correctly
       - 7-stage architecture followed
       - Mandatory dependency chain preserved
       - `create-release` job present
   12. Report created file paths and validation status

   The agent should deliver a complete, publishable component library ready for CI/CD Catalog registration.

4. **Quality review via parallel code-reviewer agents:**

   After files are scaffolded, launch **3 code-reviewer agents in parallel** using the Task tool:

   - Agent 1 (subagent_type: `krci-general:code-reviewer`): "Review the recent changes for simplicity, DRY violations, and code elegance. Focus on readability and maintainability."
   - Agent 2 (subagent_type: `krci-general:code-reviewer`): "Review the recent changes for bugs, logic errors, security vulnerabilities, race conditions, and functional correctness."
   - Agent 3 (subagent_type: `krci-general:code-reviewer`): "Review the recent changes for project convention violations (check CLAUDE.md), architectural consistency, naming patterns, and import organization."

   After all 3 agents complete:

   1. Consolidate findings — merge and deduplicate issues, sort by severity
   2. Filter to only issues with confidence >= 80
   3. Present unified review report to the user
   4. Ask the user how to proceed: "Fix all issues now" / "Fix critical only" / "Proceed as-is"
   5. Address issues based on user decision

---

## Task Overview

<task_overview>
Automate the creation of a new GitLab CI/CD component library following KubeRocketCI's standardized patterns. The component library provides reusable review and build pipeline templates for a specific technology stack, publishable to the GitLab CI/CD Catalog at gitlab.com/kuberocketci.

The user provides:

- *language* — Technology stack identifier (e.g., `golang`, `java17-mvn`, `python-uv`, `nodejs-npm`)

The agent generates a complete component library with:

- 3 pipeline template files (common.yml, review.yml, build.yml)
- Root orchestrator (.gitlab-ci.yml) with CI/CD Catalog release job
- Documentation (README.md), Dockerfile, SonarQube config

All generated files must follow the `ci-template` golden reference patterns:

- Mandatory 7-stage pipeline: `[prepare, test, build, verify, package, publish, release]`
- Mandatory dependency chain: `init-values → test → build → sonar → buildkit-build → git-tag`
- Spec inputs with `$[[ inputs.name ]]` interpolation
- `needs:` for execution order, `dependencies:` for artifact download
- Packaging-only Dockerfile (no build steps inside Docker)
</task_overview>

---

## Reference Assets (Prerequisites)

<prerequisites>
**Golden Reference**: The `ci-template` repository at gitlab.com/kuberocketci/ci-template serves as the base template. All new component libraries must match its structure and patterns.

**Skill Reference**: The `gitlab-ci-component-standards` skill contains:

- Component structure and file anatomy
- 7-stage pipeline architecture with job dependencies
- Per-language profiles with complete YAML examples
- CI/CD Catalog publishing workflow

**Existing Component Libraries** (at gitlab.com/kuberocketci):

- ci-template — Base template (technology-agnostic)
- ci-golang — Go
- ci-java17-gradle — Java 17 + Gradle
- ci-java17-mvn — Java 17 + Maven
- ci-nodejs-npm — Node.js + npm
- ci-python-uv — Python + uv

**Validation**: Verify user's chosen language has a profile in the skill reference. For custom stacks, gather all required configuration from the user.
</prerequisites>

---

## Instructions

<instructions>
1. Load the `gitlab-ci-component-standards` skill for patterns and language profiles.
2. Collect the technology stack from `$ARGUMENTS` or ask the user.
3. Derive repository name: `ci-<language>` (e.g., `ci-golang`).
4. Look up the language profile from the skill reference.
5. Scaffold all files following the golden reference structure:
   - `templates/common.yml` — Shared hidden job templates with tech-specific implementations
   - `templates/review.yml` — MR pipeline (4 stages, 10 jobs)
   - `templates/build.yml` — Main branch pipeline (5 stages, 12 jobs)
   - `.gitlab-ci.yml` — Root orchestrator with conditional includes + create-release
   - `README.md` — Documentation with inputs table and usage examples
   - `Dockerfile` — Packaging-only pattern
   - `sonar-project.properties` — Language-specific SonarQube config
   - `.gitignore`, `.prettierrc`, `LICENSE.md` — Supporting files
   - `deploy-templates/` — Helm chart (if requested)
6. Validate the generated structure matches the golden reference.
7. Report all created files with validation status.
</instructions>

---

## Output Format

<output_format>

- repository_name: "ci-<language>"
- created_files:
  - "ci-<language>/templates/common.yml"
  - "ci-<language>/templates/review.yml"
  - "ci-<language>/templates/build.yml"
  - "ci-<language>/.gitlab-ci.yml"
  - "ci-<language>/README.md"
  - "ci-<language>/Dockerfile"
  - "ci-<language>/sonar-project.properties"
  - "ci-<language>/.gitignore"
  - "ci-<language>/.prettierrc"
  - "ci-<language>/LICENSE.md"
  - "ci-<language>/deploy-templates/ (if requested)"
- validation:
  - templates_exist: true
  - spec_inputs_defined: true
  - interpolation_syntax_correct: true
  - seven_stage_architecture: true
  - dependency_chain_valid: true
  - create_release_job_present: true
</output_format>

---

## Execution Checklist

<execution_checklist>

1. Load `gitlab-ci-component-standards` skill.
2. Parse `$ARGUMENTS` as `<language>` or ask user for technology stack.
3. Derive repository name: `ci-<language>`.
4. Create project directory structure.
5. Generate `templates/common.yml` with tech-specific job implementations.
6. Generate `templates/review.yml` with MR pipeline (4 stages, 10 jobs).
7. Generate `templates/build.yml` with main branch pipeline (5 stages, 12 jobs).
8. Generate `.gitlab-ci.yml` with conditional includes and create-release job.
9. Generate `README.md` with documentation and inputs table.
10. Generate `Dockerfile` with packaging-only pattern.
11. Generate `sonar-project.properties` for the language.
12. Generate `.gitignore`, `.prettierrc`, `LICENSE.md`.
13. Generate `deploy-templates/` Helm chart (if requested).
14. Validate all files against golden reference patterns.
15. Report created files and validation status.
16. Launch 3 parallel code-reviewer agents for quality review.

</execution_checklist>

---

## Required Inputs

<user_inputs>
**Mandatory:**

- *language* — Technology stack identifier (e.g., `golang`, `java17-mvn`, `python-uv`, `nodejs-npm`)

**Optional (asked via AskUserQuestion):**

- *include_helm* — Include Helm chart in deploy-templates/ (default: yes)
- *include_ai_config* — Include AI agent configuration files (default: no)
- *custom stack details* — Only if "Custom" selected: container image, test/build/lint commands, cache config

**Example usage:**

```text
/krci-devops:add-gitlab-component golang
/krci-devops:add-gitlab-component java17-mvn
/krci-devops:add-gitlab-component python-uv
/krci-devops:add-gitlab-component nodejs-npm
```

</user_inputs>

---

## Usage Examples

<usage_examples>

### Example 1: Go Component Library

```text
/krci-devops:add-gitlab-component golang
```

Creates `ci-golang/` with Go-specific implementations:

- Container image: `golang:1.24-bookworm`
- Test: `make test`, Build: `make build`, Lint: `golangci-lint run`
- Cache: `go.sum` key, `${GOPATH}/pkg/mod` paths

### Example 2: Java Maven Component Library

```text
/krci-devops:add-gitlab-component java17-mvn
```

Creates `ci-java17-mvn/` with Maven-specific implementations:

- Container image: `maven:3.9-temurin-17`
- Test: `mvn verify`, Build: `mvn package -DskipTests`, Lint: `mvn checkstyle:check`
- Cache: `pom.xml` key, `.m2/repository` paths

### Example 3: Python Component Library

```text
/krci-devops:add-gitlab-component python-uv
```

Creates `ci-python-uv/` with Python uv-specific implementations:

- Container image: `python:3.13-slim`
- Test: `uv run pytest`, Build: `uv build`, Lint: `ruff check .`
- Cache: `uv.lock` key, `.uv-cache` paths

</usage_examples>

---

## Acceptance Criteria

<success_criteria>

- Repository name follows `ci-<language>` pattern
- All three template files exist in `templates/` (common.yml, review.yml, build.yml)
- Each template has `spec:` section with typed inputs and defaults
- `$[[ inputs.name ]]` interpolation used (NOT `${{ }}`)
- Review pipeline: 4 stages, 10 jobs, mandatory dependency chain
- Build pipeline: 5 stages, 12 jobs, mandatory dependency chain
- `needs:` and `dependencies:` used correctly per job
- Root `.gitlab-ci.yml` has conditional component inclusion
- `create-release` job present with semver tag trigger
- Dockerfile follows packaging-only pattern
- `sonar-project.properties` configured for the language
- README.md documents all inputs with usage examples
- Generated structure matches ci-template golden reference
</success_criteria>

---

## Post-Implementation Steps

<post_implementation>

- Validate YAML syntax:

```bash
yamllint templates/
```

- Initialize git repository:

```bash
cd ci-<language>
git init
git add .
git commit -m "feat: initial component library for <language>"
```

- Push to GitLab:

```bash
git remote add origin git@gitlab.com:kuberocketci/ci-<language>.git
git push -u origin main
```

- Enable CI/CD Catalog:
  1. Set project description in Settings > General
  2. Enable CI/CD Catalog toggle in Settings > General > Visibility
  3. Create first release tag:

     ```bash
     git tag 0.1.0
     git push origin 0.1.0
     ```

  4. Verify release pipeline runs and version appears in CI/CD Catalog
</post_implementation>

## Quality Review

<quality_review>
See Step 4 above for the quality review workflow using 3 parallel code-reviewer agents.
</quality_review>
