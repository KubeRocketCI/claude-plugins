# KubeRocketCI Claude Code Plugin Marketplace

Official plugin marketplace for KubeRocketCI AI agents and tools.

## Overview

This marketplace provides AI agents adapted from the [KubeRocketAI](https://github.com/KubeRocketCI/kuberocketai) framework for use with Claude Code. These agents help teams with software development lifecycle (SDLC) tasks through specialized AI personas.

**Current Status**: Proof-of-concept with single agent (go-dev) to validate structure and context loading.

## Installation

### Add the Marketplace

```bash
# From Claude Code
/plugin marketplace add KubeRocketCI/claude-plugins

# Or use local path for development
/plugin marketplace add ./path/to/claude-plugins
```

### Install Plugin

```bash
# Install go-dev agent
/plugin install krci@kuberocketci-plugins
```

## Available Plugins

### krci (Go Development Agent)
**Version**: 0.1.0
**Agent**: go-dev

Specialized Go development agent for Go code implementation, debugging, and Kubernetes Custom Resource development.

**Command**:
- `/krci:go-dev` - Go Developer agent

**Sub-commands available within the agent**:
- `implement-new-cr` - Implement Kubernetes Custom Resource
- `review-code` - Review Go code for best practices
- `chat` - General Go development consultation
- `help` - Show agent capabilities
- `exit` - Exit agent persona

## Usage Example

```bash
# Activate Go Developer agent
/krci:go-dev

# The agent will greet you and wait for instructions. Examples:
> implement-new-cr
> review-code
> How should I structure my controller package?
```

## Roadmap

**Phase 1 (Current)**: Single agent proof-of-concept
- ✅ Marketplace structure
- ✅ Plugin scaffolding
- ✅ go-dev agent migration
- 🔄 Validate context loading mechanics

**Phase 2**: Expand to core agents
- [ ] Add dev, architect agents
- [ ] Add qa, devops agents

**Phase 3**: Full agent suite
- [ ] Add PM suite (pm, po, ba, pmm, prm)
- [ ] Add specialized agents (tw, advisor, aqa)

**Phase 4**: Enhanced capabilities
- [ ] Task workflows with progressive disclosure
- [ ] Templates and data files
- [ ] Skills for auto-invocation

## Development

This is a minimal scaffolding to understand:
- How Claude loads context from slash commands
- Plugin marketplace structure
- Agent migration patterns from KubeRocketAI

See project documentation for expansion plans.

## License

Apache-2.0 - See [LICENSE](LICENSE) for details.
