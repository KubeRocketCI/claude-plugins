# krci-qa

KubeRocketCI QA agents covering manual and automation quality assurance. The agents and skills are platform-agnostic and apply to any product.

## Agents

| Agent | Role | Focus |
|-------|------|-------|
| **qa-engineer** | Senior QA Engineer | Test planning, test cases, execution, defect reporting |
| **automation-qa-engineer** | Senior Automation QA Engineer | Gherkin test automation, suite setup and onboarding |

## Skills

### Quality Assurance

- **create-test-plan** — Create a comprehensive test plan and strategy
- **generate-test-cases** — Generate detailed manual test cases and scenarios
- **execute-testing** — Execute testing procedures and produce a test report
- **report-defects** — Create defect reports and quality assessments
- **testing-methodologies** — Shared testing methodologies, standards, and strategy reference

### Test Automation

- **generate-auto-test-cases** — Generate Gherkin scenarios from stories by searching the existing suite (Glob/Grep)
- **setup-testing** — Initialize a testing workspace (features directory structure and testing README)
- **onboard-testing** — Onboard an existing Gherkin suite and generate its README
- **edit-testing-settings** — Edit testing settings interactively

## Discovery

The automation skills find existing Gherkin coverage by searching the `.feature` suite with `Glob` and `Grep`. The features directory is auto-detected (e.g. `src/main/resources/features/`, `features/`, or `tests/features/`); the testing README at its root governs structure, tags, and conventions.

## Installation

Install from the KubeRocketCI marketplace:

```bash
claude plugin install krci-qa
```

Or install locally:

```bash
claude plugin install --local /path/to/krci-qa
```

## Usage

```
/krci-qa:create-test-plan checkout service
/krci-qa:generate-test-cases login flow
/krci-qa:report-defects regression run
/krci-qa:generate-auto-test-cases user can reset password
```

Or ask an agent directly: "create a test plan for…", "write test cases for…", "generate Gherkin scenarios for…".

## Requirements

- Claude Code CLI

## Contributing

Part of the KubeRocketCI plugin marketplace. For issues and contributions, see the [repository](https://github.com/KubeRocketCI/claude-plugins).

## License

Apache-2.0
