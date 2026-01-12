# KubeRocketCI Claude Code Plugins

AI assistants for the complete software development lifecycle on KubeRocketCI - from platform development to application delivery.

## Installation

```bash
# Add marketplace from local path
claude plugin marketplace add /path/to/claude-plugins
# or from GitHub
claude plugin marketplace add KubeRocketCI/claude-plugins

# Install plugins
claude plugin install krci-godev
claude plugin install krci-fullstack
claude plugin install krci-devops
claude plugin install krci-commit
```

## Available Plugins

### krci-godev

Go developer agent for Kubernetes operators and Custom Resources.

**Commands:** `/krci-godev:review-code`, `/krci-godev:implement-new-cr`

### krci-fullstack

Fullstack developer agent for React, TypeScript, Radix UI, Tailwind CSS, and tRPC portal development.

**Commands:** `/krci-fullstack:implement-feature`

### krci-devops

DevOps agent for EDP-Tekton repository (<https://github.com/epam/edp-tekton>) pipeline and task automation.

**Commands:** `/krci-devops:add-task`, `/krci-devops:add-pipeline`

**Important:** Must be run from within a clone of the EDP-Tekton repository.

### krci-commit

Generate conventional commit messages from staged changes.

**Commands:** `/krci-commit:generate`

## License

Apache-2.0
