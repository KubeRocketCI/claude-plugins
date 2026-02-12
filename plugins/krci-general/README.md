# krci-general

General-purpose KubeRocketCI development utilities for common workflows across the platform.

## Overview

This Claude Code plugin consolidates general-purpose development utilities used across KubeRocketCI projects. It provides tools for commit message generation, code review, and other cross-cutting development tasks.

## Features

### Commit Message Generation

- Analyzes only staged files (`git diff --cached`)
- Generates conventional commit messages with appropriate types (feat, fix, docs, refactor, etc.)
- Focuses on **why** changes were made and **what** they implement/address (not file listings)
- Short subject lines (max 180 characters) with detailed body when needed
- Uses Haiku model for fast, cost-effective generation
- Output in code block format for easy copy-paste

### Code Review

- Launches 3 parallel review agents with different focuses (simplicity, bugs, conventions)
- Confidence-based filtering (only reports issues with confidence >= 80)
- Reviews unstaged changes by default, or specific files/scope
- Produces unified report grouped by severity (Critical vs Important)
- Used standalone via `/krci-general:review` or automatically by lead agent commands (implement-feature, fix-issue, etc.)

## Installation

Install from the KubeRocketCI marketplace:

```bash
claude plugin install krci-general
```

Or install locally:

```bash
claude plugin install --local /path/to/krci-general
```

## Usage

### Generate Commit Message

Stage your changes first, then generate the commit message:

```bash
git add .
```

Then in Claude Code:

```
/krci-general:commit
```

The command will:

1. Check for staged changes
2. Analyze the changes to understand purpose and impact
3. Generate a conventional commit message
4. Display it in a code block for easy copying

### Example Output

```
feat: add user authentication middleware

Implement JWT-based authentication middleware for API endpoints.
Add token validation and user session management.
```

You can then:

- Copy the message and commit manually: `git commit -m "..."`
- Ask Claude to commit for you: "Please commit with this message"

### Code Review

Review your code changes:

```
/krci-general:review
```

Or review a specific file or scope:

```
/krci-general:review src/app.ts
```

The command will:

1. Launch 3 code-reviewer agents in parallel (simplicity, bugs, conventions)
2. Consolidate and deduplicate findings
3. Present a unified report sorted by severity
4. Offer to fix issues if any are found

## Conventional Commit Format

The plugin generates commits following the standard format:

```
<type>: <subject>

<body>
```

**Supported types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

**Subject line:** Max 180 characters, describes **what** changed
**Body:** Explains **why** and provides additional context

## Requirements

- Git repository with staged changes
- Claude Code CLI

## Contributing

Part of the KubeRocketCI plugin marketplace. For issues and contributions, see the [repository](https://github.com/KubeRocketCI/claude-plugins).

## License

Apache-2.0
