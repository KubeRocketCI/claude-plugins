# Language Profiles

Per-language configurations for KubeRocketCI GitLab CI component libraries. Each profile defines the container image, test/build/lint commands, cache configuration, version extraction, SonarQube settings, and Dockerfile.

**Note**: These profiles are recommended patterns based on the `ci-template` golden reference extension points and standard toolchain conventions. They may differ from the actual published component repositories at gitlab.com/kuberocketci. Always verify against the latest published component when customizing for production use.

## Profile Summary

| Aspect | Go | Java/Gradle | Java/Maven | Node.js/npm | Python/uv |
|--------|-------|-------------|------------|-------------|-----------|
| Image | `golang:1.24-bookworm` | `gradle:8-jdk17` | `maven:3.9-temurin-17` | `node:20-alpine` | `python:3.13-slim` |
| Test | `make test` | `gradle test` | `mvn verify` | `npm test` | `uv run pytest` |
| Build | `make build` | `gradle build` | `mvn package -DskipTests` | `npm run build` | `uv build` |
| Lint | `golangci-lint run` | `gradle checkstyleMain` | `mvn checkstyle:check` | `npm run lint` | `ruff check .` |
| Cache key | `go.sum` | `build.gradle` | `pom.xml` | `package-lock.json` | `uv.lock` |
| Cache paths | `${GOPATH}/pkg/mod` | `~/.gradle/caches` | `~/.m2/repository` | `node_modules/` | `.venv/` |

## Go Profile

**Repository**: `ci-golang`

### common.yml Customizations

```yaml
.dependency-cache:
  variables:
    GOPATH: "${CI_PROJECT_DIR}/.go"
    GOCACHE: "${CI_PROJECT_DIR}/.go-cache"
    CACHE_DIR: "${CI_PROJECT_DIR}/.go"
  cache:
    key:
      files:
        - go.sum
    paths:
      - ${GOPATH}/pkg/mod
      - ${GOCACHE}

.test-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_test ]]
  script:
    - make test
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
    paths:
      - coverage/
    expire_in: 1 week
    when: always

.build-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_build ]]
  script:
    - make build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

.lint-job:
  extends: .dependency-cache
  image: golangci/golangci-lint:v2.1-alpine
  stage: $[[ inputs.stage_test ]]
  script:
    - golangci-lint run ./...
```

### build.yml init-values (version extraction)

```yaml
# Go version from git describe
BUILD_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "0.1.0")
VCS_TAG="${BUILD_VERSION}-${BUILD_NUMBER}"
IMAGE_TAG="${VCS_TAG}"
```

### sonar-project.properties

```properties
sonar.projectKey=kuberocketci_ci-golang
sonar.projectName=ci-golang
sonar.organization=kuberocketci
sonar.sources=.
sonar.exclusions=**/*_test.go,**/vendor/**,**/mocks/**
sonar.tests=.
sonar.test.inclusions=**/*_test.go
sonar.go.coverage.reportPaths=coverage.out
sonar.go.tests.reportPaths=report.json
```

### Dockerfile

```dockerfile
FROM alpine:3.22.1
WORKDIR /app
COPY dist/app .
EXPOSE 8080
ENTRYPOINT ["./app"]
```

## Java 17 Gradle Profile

**Repository**: `ci-java17-gradle`

### common.yml Customizations

```yaml
.dependency-cache:
  variables:
    GRADLE_USER_HOME: "${CI_PROJECT_DIR}/.gradle"
    CACHE_DIR: "${CI_PROJECT_DIR}/.gradle"
  cache:
    key:
      files:
        - build.gradle
        - build.gradle.kts
    paths:
      - ${GRADLE_USER_HOME}/caches
      - ${GRADLE_USER_HOME}/wrapper

.test-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_test ]]
  script:
    - gradle test jacocoTestReport
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: build/reports/jacoco/test/jacocoTestReport.xml
    paths:
      - build/reports/
    expire_in: 1 week
    when: always

.build-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_build ]]
  script:
    - gradle build -x test
  artifacts:
    paths:
      - build/libs/
    expire_in: 1 week

.lint-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_test ]]
  script:
    - gradle checkstyleMain checkstyleTest
```

### sonar-project.properties

```properties
sonar.projectKey=kuberocketci_ci-java17-gradle
sonar.projectName=ci-java17-gradle
sonar.organization=kuberocketci
sonar.sources=src/main
sonar.tests=src/test
sonar.java.binaries=build/classes
sonar.coverage.jacoco.xmlReportPaths=build/reports/jacoco/test/jacocoTestReport.xml
```

### Dockerfile

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Java 17 Maven Profile

**Repository**: `ci-java17-mvn`

### common.yml Customizations

```yaml
.dependency-cache:
  variables:
    MAVEN_OPTS: "-Dmaven.repo.local=${CI_PROJECT_DIR}/.m2/repository"
    CACHE_DIR: "${CI_PROJECT_DIR}/.m2"
  cache:
    key:
      files:
        - pom.xml
    paths:
      - ${CI_PROJECT_DIR}/.m2/repository

.test-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_test ]]
  script:
    - mvn verify
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: target/site/jacoco/jacoco.xml
    paths:
      - target/site/jacoco/
    expire_in: 1 week
    when: always

.build-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_build ]]
  script:
    - mvn package -DskipTests
  artifacts:
    paths:
      - target/*.jar
    expire_in: 1 week

.lint-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_test ]]
  script:
    - mvn checkstyle:check
```

### build.yml init-values (version extraction)

```yaml
# Maven version from pom.xml
BUILD_VERSION=$(mvn help:evaluate -Dexpression=project.version -q -DforceStdout 2>/dev/null | sed 's/-SNAPSHOT//')
VCS_TAG="${BUILD_VERSION}-${BUILD_NUMBER}"
IMAGE_TAG="${VCS_TAG}"
```

### sonar-project.properties

```properties
sonar.projectKey=kuberocketci_ci-java17-mvn
sonar.projectName=ci-java17-mvn
sonar.organization=kuberocketci
sonar.sources=src/main
sonar.tests=src/test
sonar.java.binaries=target/classes
sonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml
```

### Dockerfile

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Node.js npm Profile

**Repository**: `ci-nodejs-npm`

### common.yml Customizations

```yaml
.dependency-cache:
  variables:
    NPM_CONFIG_CACHE: "${CI_PROJECT_DIR}/.npm-cache"
    CACHE_DIR: "${CI_PROJECT_DIR}/.npm-cache"
  before_script:
    - npm ci --cache ${NPM_CONFIG_CACHE}
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - ${NPM_CONFIG_CACHE}
      - node_modules/

.test-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_test ]]
  script:
    - npm test -- --coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage/
    expire_in: 1 week
    when: always

.build-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_build ]]
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

.lint-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_test ]]
  script:
    - npm run lint

.type-check-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_test ]]
  script:
    - npm run type-check
```

### build.yml init-values (version extraction)

```yaml
# Node.js version from package.json
BUILD_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.1.0")
VCS_TAG="${BUILD_VERSION}-${BUILD_NUMBER}"
IMAGE_TAG="${VCS_TAG}"
```

### build.yml package-publish (npm registry)

```yaml
package-publish:
  stage: $[[ inputs.stage_package ]]
  image: $[[ inputs.container_image ]]
  extends: .dependency-cache
  script:
    - echo "//${NPM_REGISTRY}/:_authToken=${NPM_TOKEN}" > .npmrc
    - npm publish --access public
  needs: [init-values, build]
  dependencies: [init-values, build]
```

### sonar-project.properties

```properties
sonar.projectKey=kuberocketci_ci-nodejs-npm
sonar.projectName=ci-nodejs-npm
sonar.organization=kuberocketci
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Dockerfile

```dockerfile
FROM nginx:1.27-alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 8080
```

## Python uv Profile

**Repository**: `ci-python-uv`

### common.yml Customizations

```yaml
.dependency-cache:
  variables:
    UV_CACHE_DIR: "${CI_PROJECT_DIR}/.uv-cache"
    VIRTUAL_ENV: "${CI_PROJECT_DIR}/.venv"
    CACHE_DIR: "${CI_PROJECT_DIR}/.uv-cache"
  before_script:
    - pip install uv
    - uv sync
  cache:
    key:
      files:
        - uv.lock
    paths:
      - ${UV_CACHE_DIR}
      - ${VIRTUAL_ENV}

.test-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_test ]]
  script:
    - uv run pytest --cov --cov-report=xml:coverage.xml --cov-report=html:coverage/
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
    paths:
      - coverage/
    expire_in: 1 week
    when: always

.build-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_build ]]
  script:
    - uv build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

.lint-job:
  extends: .dependency-cache
  image: $[[ inputs.container_image ]]
  stage: $[[ inputs.stage_test ]]
  script:
    - uv run ruff check .
    - uv run ruff format --check .
```

### build.yml init-values (version extraction)

```yaml
# Python version from pyproject.toml
BUILD_VERSION=$(python -c "import tomllib; print(tomllib.load(open('pyproject.toml','rb'))['project']['version'])" 2>/dev/null || echo "0.1.0")
VCS_TAG="${BUILD_VERSION}-${BUILD_NUMBER}"
IMAGE_TAG="${VCS_TAG}"
```

### build.yml package-publish (PyPI)

```yaml
package-publish:
  stage: $[[ inputs.stage_package ]]
  image: $[[ inputs.container_image ]]
  extends: .dependency-cache
  script:
    - uv publish --token ${PYPI_TOKEN}
  needs: [init-values, build]
  dependencies: [init-values, build]
```

### sonar-project.properties

```properties
sonar.projectKey=kuberocketci_ci-python-uv
sonar.projectName=ci-python-uv
sonar.organization=kuberocketci
sonar.sources=src
sonar.tests=tests
sonar.exclusions=**/migrations/**,**/__pycache__/**,**/venv/**,.venv/**
sonar.python.coverage.reportPaths=coverage.xml
sonar.python.version=3.13
```

### Dockerfile

```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY dist/*.whl .
RUN pip install --no-cache-dir *.whl && rm *.whl
EXPOSE 8080
ENTRYPOINT ["python", "-m", "app"]
```

## Custom Stack Guidelines

For technology stacks not listed above, follow this template:

1. Choose an appropriate base Docker image
2. Implement the 4 extension points in common.yml:
   - `.dependency-cache` — lock file and cache paths
   - `.test-job` script — test command with coverage output
   - `.build-job` script — build command producing artifacts
   - `.lint-job` script — linter command
3. Configure version extraction in build.yml `init-values`
4. Set language-specific SonarQube properties
5. Create a packaging-only Dockerfile
6. Update README.md with stack-specific examples
