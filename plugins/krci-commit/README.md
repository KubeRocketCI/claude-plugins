# krci-commit

Generate conventional commit messages for KubeRocketCI platform by analyzing staged git changes.

## Overview

This Claude Code plugin helps developers create high-quality, consistent conventional commit messages by automatically analyzing staged changes and generating appropriate commit messages following the conventional commits specification.

## Features

- Analyzes only staged files (`git diff --cached`)
- Generates conventional commit messages with appropriate types (feat, fix, docs, refactor, etc.)
- Focuses on **why** changes were made and **what** they implement/address (not file listings)
- Short subject lines (max 180 characters) with detailed body when needed
- Uses Haiku model for fast, cost-effective generation
- Output in code block format for easy copy-paste

## Installation

Install from the KubeRocketCI marketplace:

```bash
claude plugin install krci-commit
```

Or install locally:

```bash
claude plugin install --local /path/to/krci-commit
```

## Usage

### Generate Commit Message

Stage your changes first, then generate the commit message:

```bash
git add .
```

Then in Claude Code:

```
/krci-commit:generate
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
