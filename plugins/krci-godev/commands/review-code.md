---
description: Review Go code for best practices and standards
argument-hint: <file-path>
allowed-tools: [Read, Grep, Glob, Skill, Task]
---

# Task: Review Go code

**CRITICAL: Follow this workflow to perform the code review:**

1. **Load required skills using Skill tool:**
   - Load krci-godev:go-coding-standards skill
   - Load krci-godev:operator-best-practices skill

2. **Use go-dev agent to perform the review:**
   - The go-dev agent will analyze the code at `$ARGUMENTS`
   - Agent will apply all standards from the go-coding-standards skill (Effective Go, Google Style Guide)
   - Agent will apply all patterns from the operator-best-practices skill (CRD design, controller patterns)
   - Agent will provide comprehensive review with specific violations and recommendations

These skills contain ALL the standards, patterns, and best practices the agent will apply during the review.

## Review Output Format

<review_output_format>

### Summary

Brief overall assessment of code quality and adherence to standards.

### Issues and Improvements

For each issue found, provide:

- Category: (e.g., "Go Standards Violation", "Operator Best Practice", "Security", etc.)
- Severity: Critical | High | Medium | Low
- Description: Clear explanation with reference to specific guideline from the documentation
- Location: File and line number references
- Recommendation: Specific fix with code example if helpful

### Strengths

Highlight what the code does well and follows best practices correctly.

### Action Items

Prioritized list of recommended fixes:

1. Critical issues that must be addressed
2. Important improvements
3. Nice-to-have enhancements
</review_output_format>

## Review Principles

<review_principles>

- Be constructive and educational
- Reference the specific guidelines from the documentation
- Provide concrete examples and suggestions
- Balance thoroughness with practicality
</review_principles>
