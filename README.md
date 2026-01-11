# KubeRocketCI Claude Code Assistants

Claude Code plugins for KubeRocketCI platform development and delivery workflows.

## Overview

AI assistants for the complete software development lifecycle on KubeRocketCI - from platform development to application delivery.

## Installation

```bash
# Add marketplace
claude plugin marketplace add /path/to/claude-plugins

# Install plugins
claude plugin install krci-godev
claude plugin install krci-commit
```

## Available Assistants

### krci-godev
**Platform Development** - Go developer agent specializing in Kubernetes operators and Custom Resources for KubeRocketCI platform development.

**Commands:**
- `/krci-godev:review-code` - Review Go code for best practices
- `/krci-godev:implement-new-cr` - Implement Kubernetes Custom Resource

### krci-commit
**Delivery Automation** - Generate conventional commit messages from staged changes for consistent version control.

**Commands:**
- `/krci-commit:generate` - Generate conventional commit message

## License

Apache-2.0 - See [LICENSE](LICENSE) for details.
