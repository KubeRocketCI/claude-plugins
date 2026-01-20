---
description: Validate architectural design against KRCI reference architecture and DevSecOps principles
argument-hint: [design-document-path]
allowed-tools: Read, Grep, WebSearch, TodoWrite, Skill
---

Validate a technical design document against KubeRocketCI reference architecture, DevSecOps principles, and best practices.

## Design Document

Document to review: @$1

## Review Instructions

Execute this structured validation process:

### Setup

1. Load the krci-architecture skill using the Skill tool
2. Create todo list for review phases using TodoWrite:
   - Read and understand design
   - Validate KRCI architecture alignment
   - Check DevSecOps compliance
   - Review best practices
   - Generate recommendations
3. Mark first phase as in_progress

### Phase 1: Understand Design

1. Read the design document thoroughly
2. Identify key architectural decisions:
   - Components involved
   - Integration approach
   - Data flow
   - Technology choices
3. Document understanding of proposed solution
4. Mark phase as completed, move to next

### Phase 2: KRCI Architecture Alignment

1. Reference KRCI architecture from loaded krci-architecture skill:
   - Review `references/reference-architecture.md` for architecture principles
   - Check `references/components.md` for component responsibilities
   - See `references/deployment-patterns.md` for deployment patterns
2. Validate design against KRCI principles:
   - **Managed Infrastructure**: Uses Kubernetes/OpenShift appropriately
   - **Security**: Proper authentication, authorization, SSO integration
   - **Development Toolset**: Leverages KRCI development and testing tools
   - **Engineering Process**: Follows KRCI CI/CD and analytics patterns
   - **Cloud-Agnostic**: Works on any Kubernetes cluster
3. Check component interactions:
   - Does it properly integrate with Tekton?
   - Does it align with Argo CD deployment patterns?
   - Does it use SonarQube for code quality?
   - Does it integrate with artifact storage correctly?
4. Validate deployment patterns:
   - Environment separation (dev/test/UAT/staging/prod)
   - Production workload isolation
   - GitOps alignment
5. Document alignment findings:
   - ✅ Aspects that align well
   - ⚠️ Areas of concern or risk
   - ❌ Critical issues requiring changes
6. Mark phase as completed, move to next

### Phase 3: DevSecOps Compliance

1. Validate security considerations:
   - **Security as Quality Gate**: Is security a mandatory quality gate?
   - **Authentication/Authorization**: Proper OIDC integration?
   - **SAST Integration**: Static security analysis included?
   - **Secrets Management**: Proper handling of sensitive data?
   - **Network Security**: Proper network policies and isolation?
2. Check quality gates:
   - Automated testing strategy
   - Code quality analysis (SonarQube)
   - Security scanning (SAST tools)
   - Artifact verification
3. Validate observability:
   - Logging strategy (OpenSearch integration?)
   - Metrics collection (Prometheus stack?)
   - Tracing (OpenTelemetry support?)
4. Document security findings:
   - Security strengths
   - Security risks or gaps
   - Required security improvements
5. Mark phase as completed, move to next

### Phase 4: Best Practices Review

1. Check Kubernetes/operator best practices (if applicable):
   - CRD design follows Kubernetes conventions?
   - Controller patterns are correct?
   - Reconciliation loops properly implemented?
   - Finalizers and RBAC configured?
2. Check Tekton best practices (if applicable):
   - Pipeline/task naming conventions followed?
   - Workspace patterns correct?
   - Parameter passing appropriate?
   - Trigger configuration proper?
3. Check portal/React best practices (if applicable):
   - Component patterns align with existing portal?
   - tRPC API design follows conventions?
   - State management appropriate?
   - UI/UX consistency?
4. General best practices:
   - Error handling comprehensive?
   - Performance implications considered?
   - Backward compatibility addressed?
   - Testing strategy adequate?
   - Documentation planned?
5. Document best practices findings
6. Mark phase as completed, move to next

### Phase 5: Generate Recommendations

1. Compile all findings into validation report
2. Provide overall assessment:
   - **Approved**: Design is solid, proceed with implementation
   - **Approved with Changes**: Design is good but needs specific improvements
   - **Not Approved**: Critical issues require redesign
3. List specific recommendations:
   - What should be changed and why
   - What should be added
   - What risks should be mitigated
   - What alternatives to consider
4. Provide next steps:
   - Actions needed before implementation
   - Areas requiring further investigation
   - Stakeholders to consult
5. Mark all phases as completed

## Validation Report Format

Provide a structured validation report:

### Summary

**Assessment**: [Approved | Approved with Changes | Not Approved]

**Key Findings**: [Brief summary of main findings]

### KRCI Architecture Alignment

**Strengths:**

- ✅ [Aligned aspect with explanation]
- ✅ [Aligned aspect with explanation]

**Concerns:**

- ⚠️ [Concern with rationale and potential impact]

**Critical Issues:**

- ❌ [Issue requiring change with explanation]

### DevSecOps Compliance

**Security Posture:**

- [Assessment of security considerations]
- [Quality gate integration]
- [Observability approach]

**Security Recommendations:**

1. [Specific security improvement with rationale]
2. [Specific security improvement with rationale]

### Best Practices Assessment

**Component-Specific:**

- [Kubernetes/Tekton/Portal specific findings]

**General:**

- Error handling: [Assessment]
- Performance: [Assessment]
- Testing: [Assessment]
- Documentation: [Assessment]

### Recommendations

**Must Fix (Blockers):**

1. [Critical change required with clear explanation]

**Should Fix (Important):**

1. [Recommended improvement with rationale]

**Consider (Nice to Have):**

1. [Suggestion for future enhancement]

### Next Steps

1. [Specific action to take]
2. [Specific action to take]
3. [Stakeholders to consult or areas to investigate further]

### References

- KRCI Reference Architecture: [Specific principles that apply]
- Similar Implementations: [File references to similar code]
- Best Practices: [Relevant documentation or patterns]

## Validation Criteria

- **Architecture Alignment**: Design follows KRCI reference architecture principles
- **Security First**: DevSecOps principles applied (security as mandatory quality gate)
- **Component Integration**: Proper integration with Tekton, Argo CD, operators, portal
- **Best Practices**: Follows Kubernetes, Tekton, React/TypeScript conventions
- **Quality**: Comprehensive error handling, testing, observability
- **Compatibility**: Backward compatibility or migration path provided
- **Documentation**: Clear technical design with rationale for decisions

## Critical Reminders

- Validate against KRCI reference architecture, not generic Kubernetes patterns
- Security is a mandatory quality gate in KRCI (DevSecOps excellence)
- Consider multi-cluster deployment (dev/test/staging/prod isolation)
- Check GitOps alignment for deployment
- Ensure cloud-agnostic design (works on any Kubernetes cluster)
- Be specific in recommendations (file names, component names, exact changes)
- Provide clear next steps, not just identification of issues
