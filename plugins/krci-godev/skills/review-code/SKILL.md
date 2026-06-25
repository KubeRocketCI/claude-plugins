---
name: KRCI Go Code Review
description: This skill should be used when the user asks to "review Go code", "check Go best practices", "review operator code", "check CRD implementation", "review controller", or "check error handling". Applies Effective Go, Google Style Guide, and Kubernetes operator patterns.
argument-hint: <file, folder, or scope>
allowed-tools: [Bash]
disable-model-invocation: true
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
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

## Comment Hygiene

Flag comments that add nothing beyond what the code already states — Go code should be self-documenting through clear naming and structure. Recommend deleting redundant comments rather than letting them pass as harmless noise.

Permit a comment only when it earns its place:

- Explains *why*, not *what* — non-obvious rationale, trade-offs, workarounds, or a link to an issue/spec/ticket.
- Clarifies genuinely complex or non-obvious logic — intricate algorithms, tricky regex, bit manipulation, concurrency invariants, or surprising edge cases.
- Is a godoc comment on an exported identifier (`// FuncName ...`) — required by Go convention.
- Carries a required notice or actionable marker — license header, security caveat, or `TODO`/`FIXME` with concrete context.

Recommend removing comments that:

- Restate adjacent code (e.g., `// increment counter` above `counter++`, `// return error`).
- Echo a function, variable, or type name already obvious from the signature.
- Are decorative banners, section dividers, or filler.
- Are commented-out code — version control already preserves history.

A comment that demonstrably only restates adjacent code is a verifiable finding — score it ≥ 80 and suggest deleting it. When genuinely uncertain whether a comment helps, leave it.

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
