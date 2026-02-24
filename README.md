# Reusable Workflows from the Enthusiasts 🎉

The repository contains all general workflows which can be used for every workflow in another repository.
If you want to have more information you can take a look at the [GitHub documentation][reusable-workflows].

If you want to use a template workflow you can copy the following template and adapt it to your specific use case.
You can find all possible template workflows in the directory `.github/workflows` with the name `template_*.yml`.

```yml
name: <your name>

on: ...

jobs:
  <action name>:
    uses: Staffbase/gha-workflows/.github/workflows/template_*.yml@v11.1.0
    permissions: ...  # see individual examples below
    with: ...
```

## Example Configurations 🔧

In this section you can find examples of how to use template workflows. For more information, please take a look at the templates.

### Auto-Merge Dependabot

<details>
<summary>The action can be used to auto-merge a dependabot PR with minor and patch updates.</summary>

The action is called by creating a PR. It is necessary that the repository is enabled for auto-merge.
Afterward the PR will be merged with the help of the merge queue if all required conditions of the repository are fulfilled.

⚠️ You can also force a merge of a PR. This means that the PR will immediately be merged.
If you want to enable the force merge, make sure that the app can bypass any protection rules.

```yml
name: Enable Dependabot Auto-Merge

on:
  pull_request:
    types: [opened]

jobs:
  dependabot:
    uses: Staffbase/gha-workflows/.github/workflows/template_automerge_dependabot.yml@v11.1.0
    permissions: {}
    with:
      # optional: ⚠️ only enable the force merge if you want to do the merge just now
      force: true
      # optional: choose strategy when merging (default: squash)
      strategy: rebase, merge
      # optional: choose which types of update you want to allow (default: minor,patch)
      update-types: major,minor,patch
      # optional: choose if you want to allow versions with semver 0.X.X (default: false)
      include-pre-release: true
    secrets:
      # identifier of the GitHub App for authentication
      app_id: ${{ <your-app-id> }}
      # private key of the GitHub App
      private_key: ${{ <your-private-key> }}
```

</details>

### AutoDev

<details>
<summary>The action can be used to merge labeled pull requests into a branch.</summary>

```yml
name: Autodev
on:
  push:
    branches-ignore:
      - dev
  pull_request:
    types: [labeled, unlabeled, closed]

jobs:
  autodev:
    uses: Staffbase/gha-workflows/.github/workflows/template_autodev.yml@v11.1.0
    permissions:
      contents: read
    with:
      # optional: base branch from which the history originates, default: main
      base: master
      # optional: name of the dev branch, default: dev
      branch: your dev branch
      # optional: update status comment, default: false
      # if you want to change the message, please adapt 'success_comment' and/or 'failure_comment'
      comments: true
      # optional: update status label, default: false
      # if you want to change the labels, please adapt 'success_label' and/or 'failure_label'
      labels: true
      # optional: label which should trigger the action, default: dev
      label: deploy
      # optional: name of the user which does the commit, default: AutoDev Action
      user: your name
      # optional: mail of the user which does the commit, default: staffbot@staffbase.com
      email: your mail
      # optional: path relative to the repo root dir in which the GitOps action should be executed, default: .
      working-directory: ./my-service-folder
    secrets:
      # optional: access token to fetch the pull requests
      token: ${{ <your-token> }}
      # optional: identifier of the GitHub App for authentication
      app_id: ${{ <your-app-id> }}
      # optional: private key of the GitHub App
      private_key: ${{ <your-private-key> }}
```

</details>

### Changeset Check

<details>
<summary>The action can be used to check a PR for the existance of <a href="https://github.com/changesets/changesets">changeset</a> files. It will then add/update a comment on the PR.</summary>

```yml
name: Changeset Check
on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  changeset-check:
    uses: Staffbase/gha-workflows/.github/workflows/template_changeset_check.yml@v11.1.0
    permissions:
      contents: read
      pull-requests: write
```

</details>

### Changeset Release

<details>
<summary>The action can be used to create release PR and publish releases for repos using PNPM and <a href="https://github.com/changesets/changesets">changesets</a>.</summary>

⚠️ Make sure you have `@changesets/cli` installed as a dev-dependency in your project!

```yml
name: Release Changesets

on:
  push:
    branches:
      - main

jobs:
  changeset-release:
    uses: Staffbase/gha-workflows/.github/workflows/template_changeset_release.yml@v11.1.0
    permissions:
      contents: read
    with:
      # optional: The file containing the Node.js version to use, defaults to .nvmrc
      node-version-file: '.node-version'
      # optional: The script to run on publish. Defaults to `pnpm release`
      publish-script: 'pnpm publish'
      # optional: The script to run for bumping the package versions. Defaults to `pnpm changeset version`
      version-script: 'pnpm version'
      # optional: The registry to use for Node.js packages.
      node-registry: 'https://npm.pkg.github.com/'
      # optional: The scope to use for Node.js packages.
      node-registry-scope: '@staffbase'
    secrets:
      # identifier of the GitHub App for authentication
      app-id: ${{ <your-app-id> }}
      # private key of the GitHub App
      private-key: ${{ <your-private-key> }}
      # needs write:packages rights
      npm-token ${{ <your-npm-token> }}
```

</details>

### Find Flaky Tests

<details>
<summary>The action can be used to find flaky tests.</summary>

```yml
name: Find flaky tests

on:
  # At 05:00 on Monday.
  schedule:
    - cron: '0 5 * * 1'

jobs:
  flaky-tests:
    uses: Staffbase/gha-workflows/.github/workflows/template_flaky_tests.yml@v11.1.0
    permissions: {}
    with:
      # identifier for the slack channel
      slack-channel-id: 45678787976
      # name of the slack channel
      slack-channel-name: '#flaky-tests'
      # optional: name of the repository where it should check, default: current repository
      repository: 'Staffbase/test-flaky'
      # optional: name of the branch where it should check, default: main
      branch: 'master'
      # optional: file path suffixes (comma seperated) to filter the test files
      path-suffixes: '.spec.ts,.spec.tsx,.test.ts,.test.tsx'
      # prefix of the test run which should be filtered out
      prefix: 'test-'
    secrets:
      # URL of the Slack incoming webhooks
      slack-incoming-webhooks-url: ${{ secrets.SLACK_INCOMING_WEBHOOKS_URL }}
      # GitHub token
      token: ${{ secrets.GITHUB_TOKEN }}
```

</details>

### GitOps

<details>
<summary>The action can be used to build and publish a docker image.</summary>

```yml
name: GitOps
on: [push]

jobs:
  gitops:
    uses: Staffbase/gha-workflows/.github/workflows/template_gitops.yml@v11.1.0
    permissions:
      contents: read
    with:
      # optional: host of the docker registry, default: "registry.staffbase.com"
      docker-registry: '<your-registry>'
      # optional: list of build-time variables
      docker-build-args: |
        "any important args"
      # optional: set the target stage to build
      docker-build-target: 'any target'
      # optional: custom output destinations for docker build (e.g., type=registry,push=true,compression=gzip,force-compression=true). Required for DHI images.
      docker-build-outputs: '<your-output-settings>'
      # optional: set the target platforms for build (e.g., linux/arm64), default: "linux/amd64"
      docker-build-platform: "linux/arm64"
      # optional: set the provenance level of the docker build, default: "false"
      docker-build-provenance: '<your-provenance-level>'
      # optional: should the last stage image be retagged for the release image, default: false
      docker-disable-retagging: true
      # optional: path to the Dockerfile, default: ./Dockerfile
      docker-file: <path-to-Dockerfile>
      # optional: name of the docker image, default: private/<repository_name>
      docker-image: <your-image>
      # optional: custom tag for the productive docker image which is preferred over the tag generated by the workflow
      docker-custom-tag: <your-tag>
      # optional: organization of the gitops repository, default: github.repository_owner
      gitops-organization: <your-organization>
      # optional: repository where to update the files, default: mops
      gitops-repository: '<your-repository>'
      # optional: user which does the commit, default: "staffbase-actions"
      gitops-user: '<your-user>'
      # optional: email of the user which does the commit, default: "staffbase-actions[bot]@users.noreply.github.com"
      gitops-email: '<your-email>'
      # optional: files which should be updated for dev
      gitops-dev: |-
        your files
      # optional: files which should be updated for stage
      gitops-stage: |-
        your files
      # optional: files which should be updated for prod
      gitops-prod: |-
        your files
      # optional: defines the github runner for the gitops step if (e.g. ubuntu-24.04-arm for arm builds), default: ubuntu-24.04
      runs-on: ubuntu-24.04-arm
      # optional: Upwind.io client ID
      upwind-client-id: ${{ vars.UPWIND_CLIENT_ID }}
      # optional: Upwind.io organization ID
      upwind-organization-id: ${{ vars.UPWIND_ORGANIZATION_ID }}
    secrets:
      # optional: username for the docker registry
      docker-username: ${{ <your-docker-username> }}
      # optional: password for the docker registry
      docker-password: ${{ <your-docker-password> }}
      # optional: list of secrets to expose to the build (e.g., key=string, GIT_AUTH_TOKEN=mytoken)
      docker-build-secrets: |
        "${{ <your-secrets> }}"
      # optional: list of secret files to expose to the build (e.g., key=filename, MY_SECRET=./secret.txt)
      docker-build-secret-files: |
        "${{ <your-secret-files> }}"
      # optional: token to access the repository
      gitops-token: ${{ <your-gitops-token> }}
      # optional: gonosumdb environment variable
      gonosumdb: ${{ <your-gonosumdb> }}
      # optional: identifier of the GitHub App for authentication
      app-id: ${{ <your-app-id> }}
      # optional: private key of the GitHub App
      private-key: ${{ <your-private-key> }}
      # optional: Upwind client secret
      upwind-client-secret: ${{ secrets.UPWIND_CLIENT_SECRET }}
```

</details>

### Jira Ticket Tagging

<details>
<summary>
The action can be used to collect all jira issues between the last two tags created.
Then the jira issues will be updated with a release date and the labels will be tagged with the current tag name.
</summary>

```yml
name: Annotate Jira Issues
on:
  push:
    tags: ['**']

jobs:
  jira_annotate:
    uses: Staffbase/gha-workflows/.github/workflows/template_jira_tagging.yml@v11.1.0
    permissions:
      contents: read
    with:
      # optional: name of the service to add as label, default: name of the repository
      name: 'component name'
      # optional: regex to match the tags
      tag-matcher: your regex
    secrets:
      # basic url for jira api
      jira-url: ${{ <your-url> }}
      # api token for jira usage
      jira-token: ${{ <your-token> }}
      # email of the api token owner
      jira-email: ${{ <your-email> }}
```

</details>

### LaunchDarkly Code References

<details>
<summary>
The action can be used to collect and push code references for LaunchDarkly feature flags.
</summary>

```yml
name: Find LaunchDarkly flag code references
on:
  push:
    branches:
      - main

jobs:
  ld_code_references:
    uses: Staffbase/gha-workflows/.github/workflows/template_launchdarkly_code_references.yml@v11.1.0
    permissions:
      contents: read
    with:
      # optional: key of the LD project, default: default
      project-key: 'my-project'
    secrets:
      # LD access token with correct access rights
      access-token: ${{ <your-access-token> }}
```

</details>

### Merge Block

<details>
<summary>The action can be used to block the merge if a do not merge label is set.</summary>

```yml
name: Merge Block

on:
  pull_request:
    types: [opened, labeled, unlabeled]

jobs:
  block:
    uses: Staffbase/gha-workflows/.github/workflows/template_merge_block.yml@v11.1.0
    permissions:
      pull-requests: write
    with:
      # optional: name of the label if the PR should not be merged, default: do not merge
      label: merge block
      # optional: comment when the PR is blocked, default: true
      comment: false
```

</details>

### Release Drafter

<details>
<summary>The action can be used to draft automatically a new release.</summary>

If you want to use the template action please note that you must have the configuration file `.github/release-drafter.yml`.
More information on how to configure this file can be found [here](https://github.com/marketplace/actions/release-drafter#configuration).

```yml
name: Release Drafter

on:
  push:
    branches:
      - main

jobs:
  update_release_draft:
    uses: Staffbase/gha-workflows/.github/workflows/template_release_drafter.yml@v11.1.0
    permissions:
      contents: write
      pull-requests: read
    with:
      # optional: name of the release drafter configuration file, default: release-drafter.yml
      config-name: release-drafter-test.yml
      # optional: name of the release
      name: Version X.Y.Z
      # optional: should the release be published, default: false
      publish: true
      # optional: tag name of the release
      tag: vX.Y.Z
      # optional: version to be associated with the release
      version: X.Y.Z
      # optional: prerelease status of the release, default: false
      prerelease: true
      # optional: prerelease identifier of the release
      prerelease-identifier: alpha
    secrets:
      # optional: access token for the release drafter
      token: ${{ <your-token> }}
      # optional: identifier of the GitHub App for authentication
      app_id: ${{ <your-app-id> }}
      # optional: private key of the GitHub App
      private_key: ${{ <your-private-key> }}
```

</details>

### Release Version Detector

<details>
<summary>The action can be used to get the next version for a service.</summary>

The new version is in the format `YEAR.WEEK.COUNTER`. You will get the version as output with the key `new_version` and the new tag with the key `new_tag`.
You can remove all other version resolver from your configuration.

```yml
name: Release Version Detector

on:
  push:
    branches:
      - main

jobs:
  new_version:
    uses: Staffbase/gha-workflows/.github/workflows/template_release_version.yml@v11.1.0
    permissions:
      contents: read
    with:
      # optional: prefix of the tag in order to find the last release; this is useful for multi artifact/service repositories, default: 'v'
      tag-prefix: 'app-v'
      # optional: suffix of the tag in order to find the last release; this is useful for multi artifact/service repositories, default: '' (empty string)
      tag-suffix: '-native'
      # optional: format of the version, default: weekly
      format: 'quarterly'
```

You could use the action in combination with the reusable release drafter.
Make sure to add the following lines to update the week number correctly for a draft release.

```yml
on:
  schedule:
    # run every Monday at midnight and every new year to ensure the draft release have the correct week number
    - cron: '0 0 * * 1'
    - cron: '0 0 1 1 *'
```

</details>

### Secret Scanning

<details>
<summary>This workflow should be called by a PR and will scan it's commits for leaked credentials. The workflow will fail if any results are found.</summary>

```yml
name: Secret Scan

on: [pull_request]

jobs:
  trufflehog:
    uses: Staffbase/gha-workflows/.github/workflows/template_secret_scan.yml@v11.1.0
    permissions:
      contents: read
```

</details>

### Stale

<details>
<summary>The action can be used to close old pull requests or issues automatically after a few days.</summary>

```yml
name: Stale PRs

on:
  schedule:
    - cron: '0 0 * * 1-5'

jobs:
  stale:
    uses: Staffbase/gha-workflows/.github/workflows/template_stale.yml@v11.1.0
    permissions:
      contents: write
      pull-requests: write
      issues: write
    with:
      # optional: comment on the stale pull request while closed, default: This stale PR was closed because there was no activity.
      close-pr-message: your message
      # optional: idle number of days before marking pull requests stale, default: 60
      days-before-pr-stale: 30
      # optional: delete branch after closing the pull request, default: true
      delete-branch: false
      # optional: labels on pull requests exempted from stale
      exempt-pr-labels: your labels
      # optional: label to apply on staled pull requests, default: stale
      stale-pr-label: staling
      # optional: comment on the staled pull request, default: This PR has been automatically marked as stale because there has been no recent activity in the last 60 days. It will be closed in 7 days if no further activity occurs such as removing the label.
      stale-pr-message: your message
```

</details>

### TechDocs Monorepo (Azure)

<details>
<summary>This GitHub Action can be used for generating and publishing Backstage TechDocs for a monorepo. It is limited to an Azure Storage account.</summary>

```yml
name: TechDocs

on:
  push:
    branches:
      - 'main'
    paths:
      - 'docs/**'
      - 'mkdocs.yml'
      - '.github/workflows/techdocs.yaml'

jobs:
  techdocs:
    uses: Staffbase/gha-workflows/.github/workflows/template_techdocs_monorepo.yml@v11.1.0
    permissions:
      contents: read
    secrets:
      # required: specifies an Azure Storage account name
      azure-account-name: ${{ vars.TECHDOCS_AZURE_ACCOUNT_NAME }}
      # required: specifies the access key associated with the storage account
      azure-account-key: ${{ secrets.TECHDOCS_AZURE_ACCESS_KEY }}
```

</details>

### TechDocs

<details>
<summary>This GitHub Action can be used for generating and publishing Backstage TechDocs.</summary>

```yml
name: TechDocs

on:
  push:
    branches:
      - 'main'
    paths:
      - 'docs/**'
      - 'mkdocs.yml'
      - '.github/workflows/techdocs.yaml'

jobs:
  techdocs:
    uses: Staffbase/gha-workflows/.github/workflows/template_techdocs.yml@v11.1.0
    permissions:
      contents: read
    with:
      # optional: kind of the Backstage entity, default: Component
      # ref: https://backstage.io/docs/features/software-catalog/descriptor-format#contents
      entity-kind: Component
      # optional: name of the Backstage entity, default: repository name
      entity-name: custom-entity-name
      # optional: list of space separated additional python plugins to install
      additional-plugins: 'mkdocs-minify-plugin\>=0.3'
    secrets:
      # optional: specifies an Azure Storage account name
      azure-account-name: ${{ vars.TECHDOCS_AZURE_ACCOUNT_NAME }}
      # optional: specifies the access key associated with the storage account
      azure-account-key: ${{ secrets.TECHDOCS_AZURE_ACCESS_KEY }}
```

</details>

### Terraform Format

<details>
<summary>This GitHub Action checks the formatting of Terraform files and commit fixes if necessary.</summary>

```yml
name: Terraform

on: [pull_request]

jobs:
  terraform:
    uses: Staffbase/gha-workflows/.github/workflows/template_terraform_format.yml@v11.1.0
    permissions:
      contents: read
      pull-requests: write
    with:
      # optional: Terraform version, default: latest
      terraform-version: latest
      # optional: Committer name, default: staffbase-actions[bot]
      committer-name: staffbase-actions[bot]
      # optional: Committer email, default: staffbase-actions[bot]@users.noreply.github.com
      committer-email: staffbase-actions[bot]@users.noreply.github.com
    secrets:
      # GitHub App is required because GITHUB_TOKEN will not trigger new actions
      app-id: ${{ <your-app-id> }}
      private-key: ${{ <your-private-key> }}
```

</details>

### Yamllint

<details>
<summary>The action can be used to check yaml files for formatting.</summary>

```yml
name: YAMLlint

on:
  push:
    branches:
      - '**'
    tags-ignore:
      - '**'

jobs:
  yamllint:
    uses: Staffbase/gha-workflows/.github/workflows/template_yaml.yml@v11.1.0
    permissions:
      contents: read
      checks: write
    with:
      # optional: name of the running action, default: yamllint / yamllint
      action-name: your name
      # optional: path which files should be checked recursively, default: .
      target-path: your path
```

</details>

## Limitations 🚧

With the current implementation of the reusable workflows from GitHub, we have some usage limitations.

- It isn't possible to [access environment variables][reusable-workflow-env] and [secrets][reusable-workflow-secrets], so it's necessary to pass them to the workflow. But we don't want to do it for all secrets.

- Reusable workflows can only restrict `GITHUB_TOKEN` permissions, not escalate them. The calling workflow must grant at least the permissions required by the reusable workflow. All examples above include the minimum required `permissions` for each workflow. For more details, see the [GitHub documentation][reusable-workflow-permissions].

There are also some [further limitations][further-limitations] if you want to use the `GITHUB_TOKEN`.

## Release 🔖

To create a new release just use [this page][release-new] and publish the draft release.

## Contributing 👥

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License 📄

This project is licensed under the Apache-2.0 License - see the [LICENSE.md](LICENSE) file for details.

<table>
  <tr>
    <td>
      <img src="docs/assets/images/staffbase.png" alt="Staffbase GmbH" width="96" />
    </td>
    <td>
      <b>Staffbase GmbH</b>
      <br />Staffbase is an internal communications platform built to revolutionize the way you work and unite your company. Staffbase is hiring: <a href="https://staffbase.com/jobs/" target="_blank" rel="noreferrer">staffbase.com/jobs</a>
      <br /><a href="https://github.com/Staffbase" target="_blank" rel="noreferrer">GitHub</a> | <a href="https://staffbase.com/" target="_blank" rel="noreferrer">Website</a> | <a href="https://staffbase.com/jobs/" target="_blank" rel="noreferrer">Jobs</a>
    </td>
  </tr>
</table>

[reusable-workflows]: https://docs.github.com/en/actions/learn-github-actions/reusing-workflows
[release-new]: https://github.com/Staffbase/gha-workflows/releases
[reusable-workflow-secrets]: https://github.com/orgs/community/discussions/17554
[reusable-workflow-env]: https://github.com/orgs/community/discussions/26671
[reusable-workflow-permissions]: https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations#access-and-permissions-for-nested-workflows
[further-limitations]: https://docs.github.com/en/actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow
