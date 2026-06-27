# krci-product

KubeRocketCI Product team agents covering the full product lifecycle — product management, ownership, marketing, and project delivery. The agents and skills are platform-agnostic and apply to any product or project.

## Agents

| Agent | Role | Focus |
|-------|------|-------|
| **product-manager** | Senior Product Manager | Strategy, project briefs, PRDs, requirement validation |
| **product-owner** | Senior Product Owner | Epics, user stories, backlog |
| **product-marketing-manager** | Senior Product Marketing Manager | Go-to-market, marketing and sales materials |
| **project-manager** | Senior Project Manager | Charter, scope, plan, risk, status (PMBoK 7th Ed.) |

## Skills

### Product Management

- **create-prd** — Create or update a Product Requirements Document
- **project-brief** — Create (standard or advanced), enhance, refine, and finalize a project brief; gather project context
- **validate-product-requirements** — Validate problem statement, target users, success metrics, and business value
- **product-frameworks** — Shared product frameworks (business and prioritization)

### Product Ownership

- **manage-epic** — Create or update an Epic
- **manage-story** — Create, update, or review a user Story

### Product Marketing

- **create-marketing-brief** — Go-to-market strategy foundation
- **create-pitch-deck** — Pitch deck using Pain-Gains-Reveals / PAS / BAB / SCRAP
- **create-launch-materials** — Complete launch campaign
- **create-sales-enablement** — Sales resources with STAR proof points
- **create-demo-script** — Product demonstration script
- **create-visual-identity** — Brand guidelines and visual assets

### Project Management

- **project-charter** — Create or update a Project Charter
- **scope-of-work** — Create or update a Scope of Work
- **project-plan** — Create or update a Project Plan
- **risk-register** — Create or update a Risk Register
- **status-report** — Create or update a Status Report
- **project-management-methodology** — Shared PMBoK 7th Edition methodology reference

## SDLC Context

These agents cover the upstream SDLC flow: **Project Brief → PRD → Epic → Story**, plus go-to-market and project delivery. Requirements analysis inputs come from the business-analyst agent (krci-ba); implementation and architecture belong to the development plugins.

## Installation

Install from the KubeRocketCI marketplace:

```bash
claude plugin install krci-product
```

Or install locally:

```bash
claude plugin install --local /path/to/krci-product
```

## Usage

```
/krci-product:create-prd payment-service
/krci-product:manage-story checkout flow
/krci-product:create-pitch-deck Series A investor deck
/krci-product:risk-register migration project
```

Or ask an agent directly: "create a PRD for…", "write a user story for…", "build a pitch deck for…", "create a project charter for…".

## Requirements

- Claude Code CLI

## Contributing

Part of the KubeRocketCI plugin marketplace. For issues and contributions, see the [repository](https://github.com/KubeRocketCI/claude-plugins).

## License

Apache-2.0
