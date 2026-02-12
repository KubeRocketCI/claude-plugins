---
description: Generate conventional commit message from staged changes
allowed-tools: [Read, Grep, Bash]
model: haiku
---

Check for staged changes by running `!git diff --cached`.

If there are NO staged files (empty output):

- Inform the user that no files are staged
- Suggest running `git add <files>` to stage changes first
- Do not proceed with commit message generation

If there ARE staged files:

1. Analyze the staged changes to understand:
   - What functionality was added, modified, or removed
   - Why the changes were made (purpose and intent)
   - What problem the changes solve or what they implement
   - The overall scope and impact of the changes

2. Generate a conventional commit message following this format:

```
<type>: <subject>

<body>
```

**Conventional commit types** (choose the most appropriate):

- `feat` - New feature or functionality
- `fix` - Bug fix
- `docs` - Documentation changes only
- `style` - Code style/formatting changes (no logic change)
- `refactor` - Code refactoring (no behavior change)
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependency updates
- `perf` - Performance improvements
- `build` - Build system or external dependency changes
- `ci` - CI/CD configuration changes
- `revert` - Revert a previous commit

**Subject line requirements:**

- Maximum 180 characters
- Describe WHAT changed (concise and specific)
- Do NOT list file names
- Use imperative mood (e.g., "add feature" not "added feature")
- No period at the end

**Body requirements:**

- Maximum 200 characters
- Explain WHY the change was made
- Explain WHAT it implements or addresses
- Focus on the reason and impact, not the files changed
- Use bullet points or paragraphs as appropriate
- Be concise but informative

1. Present the generated commit message in a markdown code block for easy copying

2. After the code block, inform the user they can:
   - Copy and use it manually: `git commit -m "..."`
   - Ask you to commit it for them

**Important:**

- Do NOT include file names in the commit message
- Do NOT include "Co-Authored-By: Claude" or any co-author attribution
- Focus on the semantic meaning of the changes
- Keep it short and specific
- The message should be production-ready
