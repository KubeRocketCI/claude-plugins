---
name: Testing Methodologies
description: This skill should be used when the user asks about test design techniques (e.g. "equivalence partitioning", "boundary value analysis", "pairwise testing"), "explain QA best practices", "what testing standards to follow", or "which testing approach to use". It is the shared knowledge base the other QA skills consult; it explains principles and techniques but produces no deliverable. To create an actual plan, cases, execution report, or defect report, use create-test-plan, generate-test-cases, execute-testing, or report-defects.
allowed-tools: [Read]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Testing Methodologies

Core principles, design techniques, and quality standards that underpin every quality assurance deliverable — test planning, test case generation, test execution, and defect reporting. Apply these principles when executing any of the other skills in this plugin.

## How to Use

Apply the references throughout QA work:

- Select the techniques appropriate to the deliverable and scope rather than applying all of them mechanically.
- Lead with risk assessment and business impact — always prioritize testing effort toward the highest-risk areas.
- Maintain traceability from Story acceptance criteria to test cases at all times.
- Base quality assessments on measurable data and evidence, validating findings against defined quality gates.

## Principle Summary

- **Risk-based**: identify and prioritize testing effort toward the highest-risk and highest-impact functionality.
- **Comprehensive coverage**: cover functional, non-functional, integration, positive, negative, and edge cases.
- **Early and continuous**: integrate testing throughout the development lifecycle, not just at the end.
- **Automation-balanced**: automate repetitive and regression-prone cases; focus manual effort on exploratory and usability scenarios.
- **Quality-first**: shift quality left to prevent defects rather than only detecting them.
- **Evidence-based**: support quality assessments with measurable metrics and documented evidence.
- **Continuous improvement**: learn from defects and retrospectives to improve testing processes.
- **User-centric**: design tests from the end user's perspective, including accessibility and usability.
- **Clear communication**: provide transparent, actionable results and defect reports to all stakeholders.
- **Collaborative**: partner with developers, product managers, and stakeholders throughout the quality process.

## Reference Files

- **`references/test-methodologies.md`** — Full description of testing methodologies (Agile, Risk-Based, BDD, TDD), test design techniques (black box, white box, gray box), test levels (unit, integration, system, acceptance), the test automation framework, and performance and security testing approaches. Read this when deciding which techniques to apply to a given testing task.
- **`references/testing-standards.md`** — Core testing principles with detailed practices: risk-based testing, comprehensive coverage, early and continuous testing, automation strategy, quality-first mindset, evidence-based assessment, continuous improvement, user-centric testing, clear communication, and collaborative approach. Read this when establishing quality standards for a test plan or execution cycle.
- **`references/testing-strategy.md`** — Concise testing strategy reference covering test types (unit, integration, end-to-end), test guidelines (test behavior not implementation, descriptive names, focused tests), and coverage strategy (critical paths, error conditions). Read this for a quick strategy orientation at the start of a planning task.
