# KubeRocketCI Claude Code Plugins

AI assistants for the complete software development lifecycle on [KubeRocketCI](https://kuberocketci.io) - from platform development to application delivery.

## Installation

```bash
# Add marketplace from GitHub
claude plugin marketplace add KubeRocketCI/claude-plugins

# Install all plugins
claude plugin install krci-architect krci-fullstack krci-godev krci-devops krci-general
```

## Plugins

| Plugin             | Domain           | Description                                                            |
|--------------------|------------------|------------------------------------------------------------------------|
| **krci-general**   | Utilities        | Commit message generation, code review                                 |
| **krci-architect** | Architecture     | Cross-repo feature planning, design validation, workspace provisioning |
| **krci-fullstack** | Frontend/Backend | React, TypeScript, Radix UI, Tailwind CSS, tRPC portal development     |
| **krci-godev**     | Go / Operators   | Kubernetes operators, Custom Resources, CRDs, controller-runtime       |
| **krci-devops**    | CI/CD            | Tekton pipeline, task, and trigger automation for EDP-Tekton           |

## Commands

| Command                               | Description                                                      |
|---------------------------------------|------------------------------------------------------------------|
| `/krci-architect:plan-feature`        | Guided workflow for planning multi-repository features           |
| `/krci-architect:bootstrap-workspace` | Clone selected KubeRocketCI repositories into a workspace        |
| `/krci-architect:technical-review`    | Validate designs against KRCI reference architecture             |
| `/krci-fullstack:implement-feature`   | Phased workflow for implementing portal features                 |
| `/krci-fullstack:fix-issue`           | Phased workflow for diagnosing and fixing portal issues          |
| `/krci-godev:implement-new-cr`        | Scaffold and implement a new Kubernetes Custom Resource          |
| `/krci-godev:review-code`             | Review Go code for best practices and standards                  |
| `/krci-devops:add-pipeline`           | Onboard new Tekton Build and Review pipelines                    |
| `/krci-devops:add-task`               | Onboard a new Tekton Task                                        |
| `/krci-devops:add-trigger`            | Create Tekton Triggers for VCS webhook integration               |
| `/krci-general:commit`                | Generate conventional commit message from staged changes         |
| `/krci-general:review`                | Review code for bugs, security issues, and convention violations |

## License

Apache-2.0
