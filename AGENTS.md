# AGENTS.md

## Overview

Collection of reusable GitHub Actions workflows (`on: workflow_call`) consumed by other Staffbase repos. No application code, no build system, no tests -- just YAML workflow definitions.

## Dev commands

```bash
# Lint all workflow YAML (the only CI check)
yamllint .github/workflows/
```

No build, test, or typecheck steps exist.

## Critical conventions

### Action pinning (most common mistake)

All third-party actions MUST be pinned to **full commit SHA** with a version comment:

```yaml
# Correct
uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2

# Wrong -- never use tag refs
uses: actions/checkout@v4
```

### Template naming

Reusable workflow files are prefixed `template_` (e.g., `template_gitops.yml`). Internal-only workflows (yamllint, release-drafter, CLA, versions) have no prefix.

### Self-referencing

Internal workflows reference this repo's own templates via `@main`, not pinned SHA:

```yaml
uses: Staffbase/gha-workflows/.github/workflows/template_yaml.yml@main
```

### GitHub App auth pattern

Many templates support dual auth -- a plain `token` secret or GitHub App credentials (`app_id` + `private_key`). The pattern uses:

```yaml
env:
  USING_APP_CREDENTIALS: ${{ secrets.app-id != '' && secrets.private-key != '' }}
```

### Runner images

- `ubuntu-slim` for lightweight jobs (default)
- `ubuntu-24.04` when specific OS tools are needed

### Permissions

Every workflow declares a minimal `permissions` block. Never use broad permissions.

## YAML style (`.yamllint`)

- 2-space indentation, `indent-sequences: true`
- No line-length limit
- `document-start: disable` (yq compatibility)
- Truthy values: only `true`, `false`, `on` allowed

## Releases

- PR labels `patch` / `minor` / `major` control version bumps (default: `patch`)
- On release publish, `versions.yml` auto-updates all SHA+version refs in `README.md` and opens a PR -- do not update those manually
- Owned by `@Staffbase/workflow-enthusiasts`
