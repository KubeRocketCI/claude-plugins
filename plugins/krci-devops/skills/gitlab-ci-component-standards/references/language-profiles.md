# Language Profiles

Guide for discovering and implementing language-specific customizations in KubeRocketCI GitLab CI component libraries.

## Learning from Published Components

The best way to learn per-language patterns is to study actual published components at `gitlab.com/kuberocketci`. Clone the one closest to your target stack:

```bash
# Clone an existing component as reference
git clone https://gitlab.com/kuberocketci/ci-golang.git /tmp/ci-golang
git clone https://gitlab.com/kuberocketci/ci-java17-mvn.git /tmp/ci-java17-mvn
git clone https://gitlab.com/kuberocketci/ci-nodejs-npm.git /tmp/ci-nodejs-npm
git clone https://gitlab.com/kuberocketci/ci-python-uv.git /tmp/ci-python-uv
git clone https://gitlab.com/kuberocketci/ci-java17-gradle.git /tmp/ci-java17-gradle

# Study the template files
cat /tmp/ci-golang/templates/common.yml
cat /tmp/ci-golang/templates/review.yml
cat /tmp/ci-golang/templates/build.yml
```

Always verify against the actual repo — these are the authoritative source for current patterns.

## The 4 Extension Points

Every language customization boils down to filling these 4 extension points in `templates/common.yml`:

| Extension Point | What to Customize | Example (Go) |
|----------------|-------------------|--------------|
| `.dependency-cache` | Cache key file, cache paths, env vars | `go.sum`, `${GOPATH}/pkg/mod` |
| `.test-job` script | Test command producing coverage | `make test` |
| `.build-job` script | Build command producing artifacts | `make build` |
| `.lint-job` script | Linter command | `golangci-lint run` |

Plus these per-language files:

- **`init-values` in build.yml** — Version extraction logic (from `pom.xml`, `package.json`, `pyproject.toml`, `Cargo.toml`, etc.)
- **`sonar-project.properties`** — Language-specific source paths, exclusions, coverage report format
- **`Dockerfile`** — Packaging-only (runtime base image + pre-built artifacts)

## Customization Checklist

When adding a new language, customize these areas by studying an existing component for a similar stack:

1. **Container image** — Set the `container_image` default in `spec:` inputs
2. **Cache configuration** — Identify the lock file and dependency paths
3. **Test command** — Must produce coverage output (Cobertura XML preferred)
4. **Build command** — Must produce artifacts in a known directory (e.g., `dist/`, `target/`, `build/`)
5. **Lint command** — Language-specific linter
6. **Version extraction** — How to get the version from the project's metadata file
7. **SonarQube properties** — Source paths, test paths, coverage report path, exclusions
8. **Dockerfile** — Runtime base image, copy pre-built artifacts, expose port
