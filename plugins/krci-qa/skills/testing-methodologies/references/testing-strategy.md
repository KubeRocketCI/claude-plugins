# Testing Strategy

Practical guidance for choosing what to test, how, and at which level. Use this to orient a test plan or test-case effort before selecting detailed techniques from `test-methodologies.md`.

## Test Automation Pyramid

Balance test types by cost and speed — many fast low-level tests, fewer slow high-level tests.

- **Unit (base, ~70%)**: individual functions and classes in isolation. Fast, deterministic, run on every commit.
- **Integration (middle, ~20%)**: interactions between components, services, and external dependencies (databases, APIs, queues).
- **End-to-end / UI (top, ~10%)**: full user workflows through the running system. Slowest and most brittle — reserve for critical paths.

Avoid the "ice-cream cone" anti-pattern (mostly manual/E2E tests with few unit tests): it is slow, flaky, and expensive to maintain.

## Risk-Based Prioritization

Allocate test depth by risk = likelihood × impact. Map risk tiers to coverage expectations:

| Risk tier | Examples | Test focus |
|-----------|----------|------------|
| Critical | Payments, authentication, data integrity, security | Full positive + negative + boundary + non-functional; automated regression; exploratory |
| High | Core user workflows, key integrations | Positive + negative + boundary; automated where stable |
| Medium | Secondary features, admin tools | Positive + key negative paths |
| Low | Cosmetic, rarely used options | Smoke checks; spot exploratory |

## Choosing a Test Approach

- **BDD (Gherkin/`.feature`)**: when acceptance criteria are behavior-oriented and shared with non-technical stakeholders; drives automation traceable to Stories. Use the generate-auto-test-cases skill.
- **TDD**: when designing new units — write the failing test first to shape the implementation. Owned by developers.
- **Exploratory**: when requirements are ambiguous, for new/changed areas, and to find issues scripted tests miss. Time-box sessions with a charter.
- **Scripted manual**: when automation is not yet justified (one-off, unstable UI, compliance evidence). Use the generate-test-cases skill.

## Coverage Guidance

- Cover every acceptance criterion with at least one test; trace each test back to its criterion.
- Prioritize critical paths and high-risk areas over raw coverage percentage.
- Always include negative, boundary, and error-condition tests, not only the happy path.
- Test behavior and observable outcomes, not implementation details, so tests survive refactoring.

## Test Levels and Types Quick Reference

- **Functional**: unit, integration, system, acceptance, regression, smoke/sanity.
- **Non-functional**: performance/load, security, usability, accessibility, compatibility, reliability.

Select the specific design techniques (equivalence partitioning, boundary value analysis, decision tables, state transition, pairwise) from `test-methodologies.md`.
