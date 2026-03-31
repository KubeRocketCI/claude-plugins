---
name: KRCI Go Code Review
description: This skill should be used when the user asks to "review Go code", "check Go best practices", "review operator code", "check CRD implementation", "review controller", or "check error handling". Applies Effective Go, Google Style Guide, and Kubernetes operator patterns.
argument-hint: <file, folder, or scope>
allowed-tools: [Read, Grep, Glob, Task]
disable-model-invocation: true
---

# Go Code Review

Review Go code against idiomatic standards (Effective Go, Google Style Guide) and Kubernetes operator best practices. When the code involves operators, CRDs, or controllers, apply both Go standards and operator patterns.

## Review Workflow

1. **Read and analyze** the code at `$ARGUMENTS`
2. **Read `references/go-coding-standards.md`** and apply Go coding standards to the code
3. **Determine if the code involves Kubernetes operators/CRDs/controllers** by checking for:
   - Imports from `sigs.k8s.io/controller-runtime`
   - CRD struct definitions with kubebuilder markers
   - Reconcile methods or controller implementations
   - Kubernetes client-go usage
4. **If operator/controller code detected**, read `references/operator-best-practices.md` and apply operator patterns
5. **Produce output** in the structured format below

## Review Output Format

<review_output_format>

### Summary

Brief overall assessment of code quality and adherence to standards.

### Issues and Improvements

For each issue found, provide:

- Category: (e.g., "Go Standards Violation", "Operator Best Practice", "Security", etc.)
- Severity: Critical | High | Medium | Low
- Description: Clear explanation with reference to specific guideline
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
- Reference specific guidelines from the documentation
- Provide concrete examples and suggestions
- Balance thoroughness with practicality
</review_principles>

## Reference Files

- **`references/go-coding-standards.md`** — Complete Go coding standards covering naming, formatting, error handling, architecture, concurrency, testing, security, performance, API design. Read when you need detailed guidance on a specific Go idiom or pattern.
- **`references/operator-best-practices.md`** — Complete Kubernetes operator patterns covering CRD design, controller architecture, RBAC, on-cluster behavior, versioning, cleanup. Read when reviewing operator or controller code.
