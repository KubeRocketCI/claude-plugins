# DevSecOps Principles in KRCI

Security practices and DevSecOps implementation details for KubeRocketCI.

## Core Principle: Security as Mandatory Quality Gate

**Critical**: Security is not optional in KRCI. Every pipeline MUST include security checks as mandatory quality gates. Deployments failing security scans MUST NOT proceed to production.

## Security Quality Gates

### SAST (Static Application Security Testing)

**Purpose**: Identify vulnerabilities in source code before deployment.

**Tools**:

- **SonarQube**: Code quality and security analysis
- **Checkmarx**: Enterprise SAST scanning
- **Snyk Code**: Developer-friendly security scanning
- **Semgrep**: Custom security rules

**Pipeline Integration**:

```yaml
# Tekton Task
apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: security-scan
spec:
  params:
    - name: threshold
      default: "HIGH"
  steps:
    - name: sast-scan
      image: sonar-scanner:latest
      script: |
        sonar-scanner \
          -Dsonar.qualitygate.wait=true \
          -Dsonar.qualitygate.timeout=300

    - name: check-results
      image: sonar-cli:latest
      script: |
        # Fail if quality gate fails
        if ! sonar-cli check-gate; then
          echo "Security quality gate FAILED"
          exit 1
        fi
```

**Quality Gate Configuration**:

- **Blocker**: Critical vulnerabilities (CWE Top 25)
- **Critical**: High severity vulnerabilities
- **Major**: Medium severity with easy exploitation
- **Fail Criteria**: Any blocker or >5 critical issues

### Dependency Scanning

**Purpose**: Identify known vulnerabilities in dependencies.

**Tools**:

- **OWASP Dependency-Check**: Multi-language dependency scanning
- **Snyk**: Dependency and container scanning
- **Trivy**: Container and dependency scanning

**Pipeline Integration**:

```yaml
- name: dependency-scan
  image: owasp/dependency-check:latest
  script: |
    dependency-check \
      --scan /workspace/source \
      --format JSON \
      --out /workspace/reports \
      --failOnCVSS 7
```

**Policy**:

- Block HIGH and CRITICAL CVEs without approved exceptions
- Require mitigation plan for MEDIUM CVEs
- Track all dependencies in SBOM (Software Bill of Materials)

### Container Image Scanning

**Purpose**: Scan container images for vulnerabilities and misconfigurations.

**Tools**:

- **Trivy**: Comprehensive image scanning
- **Clair**: Static analysis of vulnerabilities
- **Anchore**: Policy-based image analysis

**Pipeline Integration**:

```yaml
- name: image-scan
  image: aquasec/trivy:latest
  script: |
    trivy image \
      --severity HIGH,CRITICAL \
      --exit-code 1 \
      --no-progress \
      $(params.image-name):$(params.image-tag)
```

**Checks**:

- Known CVEs in base image and layers
- Secrets in image layers
- Exposed ports and services
- User permissions (no root unless justified)

### License Compliance

**Purpose**: Ensure dependencies use acceptable licenses.

**Tools**:

- **FOSSA**: License compliance automation
- **Black Duck**: Open source risk management
- **License Finder**: Dependency license detection

**Approved Licenses**:

- **Permissive**: MIT, Apache 2.0, BSD
- **Weak Copyleft**: LGPL, MPL
- **Prohibited**: GPL (without approval), proprietary licenses

## Secret Management

### Secrets in Code

**Never Allow**:

- Hardcoded credentials in source code
- API keys in configuration files
- Passwords in environment variables (in code)
- Tokens in Git history

**Detection**:

- **git-secrets**: Pre-commit hook scanning
- **TruffleHog**: Git history scanning
- **Gitleaks**: Secrets detection in commits

**Pipeline Check**:

```yaml
- name: secret-scan
  image: zricethezav/gitleaks:latest
  script: |
    gitleaks detect \
      --source /workspace/source \
      --verbose \
      --exit-code 1
```

### Secret Storage

**Development/Test**:

- Kubernetes Secrets (base64 encoded)
- Sealed Secrets for GitOps
- Never commit to Git

**Production**:

- **AWS**: Parameter Store or Secrets Manager
- **Azure**: Key Vault
- **HashiCorp Vault**: Universal secret management
- **External Secrets Operator**: Sync external secrets to K8s

**Example with External Secrets**:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
spec:
  secretStoreRef:
    name: aws-parameter-store
  target:
    name: app-secrets
  data:
    - secretKey: db-password
      remoteRef:
        key: /prod/app/db-password
```

## Authentication and Authorization

### OIDC Integration

**All Platform Components** authenticate via Keycloak OIDC:

- KubeRocketCI Portal
- SonarQube
- Nexus
- Grafana
- Kubernetes API

**Configuration**:

```yaml
# Keycloak Client for tool
apiVersion: v1.edp.epam.com/v1alpha1
kind: KeycloakClient
metadata:
  name: my-tool
spec:
  clientId: my-tool
  public: false
  secret: my-tool-client-secret
  realmRef:
    name: main
  webUrl: https://my-tool.example.com
  standardFlowEnabled: true
  directAccessGrantsEnabled: false
```

**Benefits**:

- Single sign-on across platform
- Centralized user management
- Role-based access control
- Audit trail of access

### Kubernetes RBAC

**Principle of Least Privilege**: Grant minimum permissions required.

**Role Structure**:

```yaml
# Viewer role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: edp-viewer
rules:
  - apiGroups: ["v2.edp.epam.com"]
    resources: ["codebases", "cdpipelines"]
    verbs: ["get", "list", "watch"]

# Developer role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: edp-developer
rules:
  - apiGroups: ["v2.edp.epam.com"]
    resources: ["codebases"]
    verbs: ["get", "list", "watch", "create", "update"]
  - apiGroups: ["tekton.dev"]
    resources: ["pipelineruns"]
    verbs: ["get", "list", "watch"]

# Admin role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: edp-admin
rules:
  - apiGroups: ["v2.edp.epam.com", "tekton.dev"]
    resources: ["*"]
    verbs: ["*"]
```

**Portal Integration**: Portal enforces RBAC based on Kubernetes permissions.

## Network Security

### Network Policies

**Isolate Namespaces**:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

**Allow Specific Traffic**:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-portal-to-k8s-api
spec:
  podSelector:
    matchLabels:
      app: edp-headlamp
  egress:
    - to:
        - podSelector:
            matchLabels:
              component: kube-apiserver
      ports:
        - protocol: TCP
          port: 443
```

### Service Mesh

**Optional but Recommended for Production**:

- **Istio** or **Linkerd** for mTLS between services
- Automatic encryption of service-to-service traffic
- Fine-grained traffic policies
- Observability and tracing

## Artifact Security

### Image Signing

**Sign Container Images**:

```bash
# Using cosign
cosign sign --key cosign.key \
  registry.example.com/app:v1.2.3
```

**Verify Before Deployment**:

```yaml
# Admission controller policy
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-images
spec:
  validationFailureAction: enforce
  rules:
    - name: verify-signature
      match:
        resources:
          kinds:
            - Pod
      verifyImages:
        - imageReferences:
            - "registry.example.com/*"
          attestors:
            - entries:
                - keys:
                    publicKeys: |-
                      -----BEGIN PUBLIC KEY-----
                      ...
                      -----END PUBLIC KEY-----
```

### Artifact Integrity

**Store Checksums**:

```yaml
# In pipeline
- name: generate-checksum
  script: |
    sha256sum artifact.tar.gz > artifact.tar.gz.sha256

- name: upload-artifacts
  script: |
    upload artifact.tar.gz
    upload artifact.tar.gz.sha256
```

**Verify on Download**:

```yaml
- name: verify-artifact
  script: |
    sha256sum -c artifact.tar.gz.sha256 || exit 1
```

## Compliance and Auditing

### Audit Logging

**Kubernetes Audit**:

```yaml
# Audit policy
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  - level: RequestResponse
    resources:
      - group: "v2.edp.epam.com"
        resources: ["codebases", "cdpipelines"]
  - level: Metadata
    resources:
      - group: "tekton.dev"
        resources: ["pipelineruns"]
```

**Application Logs**:

- Structured JSON logging
- Include user ID, timestamp, action, resource
- Ship to OpenSearch for analysis

### Compliance Scanning

**CIS Benchmarks**:

```bash
# Scan cluster against CIS Kubernetes Benchmark
kube-bench run --targets master,node
```

**Policy Enforcement**:

- **Kyverno** or **OPA Gatekeeper** for policy as code
- Enforce pod security standards
- Require resource limits
- Block privileged containers

## Security Best Practices

### Container Security

**Best Practices**:

- Use minimal base images (distroless, alpine)
- Run as non-root user
- Use read-only root filesystem where possible
- Drop unnecessary Linux capabilities
- Set resource limits

**Example**:

```yaml
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 10000
    fsGroup: 10000
  containers:
    - name: app
      image: app:latest
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
      resources:
        limits:
          memory: "512Mi"
          cpu: "500m"
```

### Pipeline Security

**Best Practices**:

- Limit pipeline permissions (service accounts)
- Use separate service accounts per pipeline
- Store credentials in secrets, not pipelines
- Use admission controllers to validate pipeline security
- Audit pipeline runs regularly

### Incident Response

**Process**:

1. **Detect**: Monitoring alerts on security events
2. **Analyze**: Investigate scope and impact
3. **Contain**: Isolate affected systems
4. **Remediate**: Patch vulnerabilities, rotate credentials
5. **Recover**: Restore normal operations
6. **Post-Mortem**: Document and improve

**Tools**:

- **Falco**: Runtime security monitoring
- **Prometheus Alerts**: Security metric thresholds
- **OpenSearch**: Log analysis for anomalies

## Continuous Security

### Regular Scanning

**Schedule**:

- **Daily**: Dependency and image scans
- **Weekly**: Cluster CIS benchmark scans
- **Monthly**: Penetration testing (production)
- **Quarterly**: Security audit and compliance review

### Security Updates

**Process**:

1. Monitor security advisories (GitHub, CVE databases)
2. Assess impact to KRCI platform
3. Test patches in non-production
4. Schedule maintenance window for production
5. Apply updates and verify
6. Document changes

### Security Training

**Team Requirements**:

- Secure coding practices
- OWASP Top 10 awareness
- Kubernetes security best practices
- Incident response procedures
