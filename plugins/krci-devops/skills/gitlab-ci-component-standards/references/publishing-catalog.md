# CI/CD Catalog Publishing

Reference for publishing KubeRocketCI GitLab CI components to the CI/CD Catalog.

## Prerequisites

Before publishing, ensure:

1. **Maintainer role** — You must have at least Maintainer role on the project
2. **Project description** — Set in Settings > General (required by GitLab)
3. **README.md** — Must exist at project root at the tagged commit SHA
4. **Component templates** — At least one component in `templates/` directory
5. **CI/CD Catalog toggle** — Enabled in Settings > General > Visibility, project features, permissions (requires Owner role)
6. **Semantic version tag** — Release tag must follow semver (e.g., `1.0.0`, `2.3.4`)

## Release Job

The `create-release` job in `.gitlab-ci.yml` creates a GitLab release when a semver tag is pushed:

```yaml
create-release:
  stage: release
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  script: echo "Creating release $CI_COMMIT_TAG"
  rules:
    - if: $CI_COMMIT_TAG =~ /^\d+\.\d+\.\d+$/
  release:
    tag_name: $CI_COMMIT_TAG
    description: "Release $CI_COMMIT_TAG of components repository $CI_PROJECT_PATH"
```

**Critical**: The release MUST be created using the `release:` keyword in CI/CD, not the Releases API.

## Publishing Workflow

1. Ensure all tests pass on main branch
2. Create a semantic version tag:

   ```bash
   git tag 1.0.0
   git push origin 1.0.0
   ```

3. The tag triggers the pipeline with `create-release` job
4. After the release job completes, GitLab automatically publishes to CI/CD Catalog
5. Verify the new version appears in the CI/CD Catalog

## Versioning Strategy

| Reference | Description | Use Case |
|-----------|-------------|----------|
| `@1.0.0` | Exact semantic version | Production pipelines |
| `@1.0` | Major.minor (latest patch) | Receive patch updates |
| `@1` | Major only (latest minor+patch) | Receive minor updates |
| `@~latest` | Latest release | Development only |
| `@main` | Branch reference | Testing only |
| `@<sha>` | Commit SHA | Pinned for security |

**Best practice**: Pin to exact version (`@1.0.0`) or commit SHA in production.

## Consumer Usage

After publishing, consumers reference components by address:

```yaml
include:
  - component: gitlab.com/kuberocketci/ci-golang/review@1.0.0
    inputs:
      codebase_name: my-go-app
      container_image: golang:1.24-bookworm
```

## Local Testing Before Publishing

Use `@$CI_COMMIT_SHA` to test components within the same repository before tagging:

```yaml
include:
  - component: $CI_SERVER_FQDN/$CI_PROJECT_PATH/review@$CI_COMMIT_SHA
    inputs:
      codebase_name: $CODEBASE_NAME
```

This references the component at the current commit, allowing validation before creating a release.

## Removing from Catalog

Turn off the **CI/CD Catalog resource** toggle in project settings. This permanently removes all catalog metadata and published versions.
