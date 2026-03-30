# Language Support and Onboarding

## Discovering Supported Languages

Rather than maintaining a static language list, explore the repository directly:

```bash
# See all supported languages and frameworks from values.yaml
grep -A3 "deployableResources:" charts/pipelines-library/values.yaml

# See the full language hierarchy in values.yaml
# Look for the `deployableResources` section — it has a clear tree structure:
#   java: {java17: true, java21: true, ...}
#   go: {beego: true, gin: true, ...}
#   js: {npm: {react: true, ...}, pnpm: {...}}

# See pipeline directories per language
ls charts/pipelines-library/templates/pipelines/

# See frameworks for a specific language
ls charts/pipelines-library/templates/pipelines/java/
```

## Feature Flags

All language pipelines are controlled by `deployableResources` in `charts/pipelines-library/values.yaml`. To enable/disable a language or framework:

1. Modify the relevant flag in `values.yaml` under `pipelines.deployableResources`
2. Reinstall the Helm chart: `helm upgrade --install ...`

## Adding New Languages

To add support for a new language:

1. **Pipeline YAML files** in `charts/pipelines-library/templates/pipelines/`
   - Create a directory: `pipelines/{language}/{framework}/`
   - Build pipeline: `{vcs}-build-default.yaml` (for each VCS provider)
   - Review pipeline: `{vcs}-review.yaml` (for each VCS provider)
   - Common template: `_common_{language}.yaml` at `pipelines/` root (optional, for reusable task patterns)

2. **Task YAML file** (if no existing task fits) in `charts/pipelines-library/templates/tasks/`
   - File: `{language}.yaml`
   - Follow the structure of existing tasks (e.g., read `maven.yaml` or `go.yaml` as reference)

3. **values.yaml configuration**:
   - Add to `pipelines.deployableResources.{language}`
   - Add image mapping in `charts/pipelines-library/templates/_helpers.tpl` if needed

4. **Use the onboarding script** to generate pipeline files (see main SKILL.md for commands)

5. **Study an existing language** before creating new files — read a complete set for a similar language to understand the patterns:

   ```bash
   # Example: study Go pipelines as reference
   ls charts/pipelines-library/templates/pipelines/go/
   cat charts/pipelines-library/templates/pipelines/go/gin/github-build-default.yaml
   ```
