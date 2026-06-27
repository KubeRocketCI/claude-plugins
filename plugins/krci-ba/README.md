# krci-ba

KubeRocketCI Business Analyst agent for requirements, process analysis, business rules, and user journey mapping.

## Overview

This Claude Code plugin provides a Senior Business Analyst agent that bridges business needs and technical implementation. It produces BR/NFR requirements, process analyses, business rules, and user journey maps with traceability that enables Epic and Story creation.

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| **business-analyst** | Agent | Business analysis consultation; routes to the deliverable skills |
| **gather-requirements** | Skill | Elicit and document BR/NFR requirements with acceptance criteria |
| **analyze-processes** | Skill | Map current-state processes and design optimized future state |
| **document-business-rules** | Skill | Capture business rules with conditions, actions, and exceptions |
| **map-user-journeys** | Skill | Build user journey maps with touchpoints, emotions, and pain points |
| **business-analysis-methodologies** | Skill | Core BA principles applied across all deliverables |

## SDLC Context

Business analysis artifacts enhance the Product Requirements Document (PRD, conventionally `/docs/prd/prd.md`) and feed the downstream flow: **PRD → Epic → Story**. Product strategy and Epic/Story authoring belong to the PM/PO agents; this plugin produces the analysis inputs that feed them.

## Installation

Install from the KubeRocketCI marketplace:

```bash
claude plugin install krci-ba
```

Or install locally:

```bash
claude plugin install --local /path/to/krci-ba
```

## Usage

```
/krci-ba:gather-requirements self-service onboarding feature
/krci-ba:analyze-processes deployment approval process
/krci-ba:document-business-rules discount eligibility
/krci-ba:map-user-journeys first-time developer onboarding
```

Or ask the agent directly: "gather the requirements for…", "analyze our … process", "document the business rules for…", "map the user journey for…".

## Requirements

- Claude Code CLI

## Contributing

Part of the KubeRocketCI plugin marketplace. For issues and contributions, see the [repository](https://github.com/KubeRocketCI/claude-plugins).

## License

Apache-2.0
