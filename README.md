# Reusable Workflows from the Enthusiasts 🎉

The repository contains all general workflows which can be used for every workflow in another repository.
If you want to have more information you can take a look at the [GitHub documentation][reusable-workflows].

If you want to use a template workflow you can copy the following template and adapt it to your specific use case.
You can find all possible template workflows in the directory `.github/workflows` with the name `template_*.yml`.

```yml
name: <your name>

on:
  ...

jobs:
  <action name>:
    uses: Staffbase/gha-workflows/.github/workflows/template_*.yml@v2.6.0
    with:
      ...
```

## Example Configurations 🔧

In this section you can find examples of how to use template workflows. For more information, please take a look at the templates.

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
    uses: Staffbase/gha-workflows/.github/workflows/template_autodev.yml@v2.6.0
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
    secrets:
      # optional: access token to fetch the pull requests
      token: ${{ <your-token> }}
      # optional: identifier of the GitHub App for authentication
      app_id: ${{ <your-app-id> }}
      # optional: private key of the GitHub App 
      private_key: ${{ <your-private-key> }}
```
</details>

### GitOps

<details>
<summary>The action can be used to build and publish a docker image.</summary>

```yml
name: GitOps
on: [ push ]

jobs:
  gitops:
    uses: Staffbase/gha-workflows/.github/workflows/template_gitops.yml@v2.6.0
    with:
      # optional: list of build-time variables
      docker-build-args: |
        "any important args"
      # optional: generate provenance attestation for the build, default: false
      docker-build-provenance: "mode=min,inline-only=true"
      # optional: set the target stage to build
      docker-build-target: "any target"
      # optional: path to the Dockerfile, default: ./Dockerfile
      docker-file: <path-to-Dockerfile>
      # optional: name of the docker image, default: private/<repository_name>
      docker-image: <your-image>
      # optional: files which should be updated for dev
      gitops-dev: |-
        your files
      # optional: files which should be updated for stage
      gitops-stage: |-
        your files
      # optional: files which should be updated for prod
      gitops-prod: |-
        your files
    secrets:
      # optional: token to access the repository
      gitops-token: ${{ <your-gitops-token> }}
      # optional: username for the docker registry
      docker-username: ${{ <your-docker-username> }}
      # optional: password for the docker registry
      docker-password: ${{ <your-docker-password> }}
      # optional: token to pull private npm packages
      npm-token: ${{ <your-npm-token> }}
      # optional: goproxy environment variable
      goproxy: ${{ <your-goproxy> }}
      # optional: gonosumdb environment variable
      gonosumdb: ${{ <your-gonosumdb> }}
      # optional: list of secrets to expose to the build (e.g., key=string, GIT_AUTH_TOKEN=mytoken)
      docker-build-secrets: |
        "${{ <your-secrets> }}"
      # optional: list of secret files to expose to the build (e.g., key=filename, MY_SECRET=./secret.txt)
      docker-build-secret-files: |
        "${{ <your-secret-files> }}"
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
    uses: Staffbase/gha-workflows/.github/workflows/template_jira_tagging.yml@v2.6.0
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
    uses: Staffbase/gha-workflows/.github/workflows/template_launchdarkly_code_references.yml@v2.6.0
    with:
      # optional: key of the LD project, default: default
      project-key: 'my-project'
    secrets:
      # LD access token with correct access rights
      access-token: ${{ <your-access-token> }}
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
    uses: Staffbase/gha-workflows/.github/workflows/template_release_drafter.yml@v2.6.0
    with: 
      # optional: name of the release
      name: Version X.Y.Z
      # optional: should the release be published, default: false
      publish: true
      # optional: tag name of the release
      tag: vX.Y.Z
      # optional: version to be associated with the release
      version: X.Y.Z
```
</details>

### Release Version Detector

<details>
<summary>The action can be used to get the next version for a service.</summary>

The new version is in the format `YEAR.WEEK.COUNTER`. You will get the version as output with the key `new_version` and the new tag with the key `new_tag`.

```yml
name: Release Version Detector

on:
  push:
    branches:
      - main

jobs:
  new_version:
    uses: Staffbase/gha-workflows/.github/workflows/template_release_version.yml@v2.6.0
```

You could use the action in combination with the reusable release drafter.
Make sure to add the following lines to update the week number correctly for a draft release.

```yml
on:
  schedule:
    # run every Monday at midnight to ensure the draft release have the correct week number
    - cron: '0 0 * * 1'
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
    uses: Staffbase/gha-workflows/.github/workflows/template_secret_scan.yml@v2.6.0
```
</details>

### Stale

<details>
<summary>The action can be used to close old pull requests or issues automatically after a few days.</summary>

```yml
name: Stale PRs

on:
  schedule:
    - cron: "0 0 * * 1-5"

jobs:
  stale:
    uses: Staffbase/gha-workflows/.github/workflows/template_stale.yml@v2.6.0
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
      - "docs/**"
      - "mkdocs.yml"
      - ".github/workflows/techdocs.yaml"

jobs:
  techdocs:
    uses: Staffbase/gha-workflows/.github/workflows/template_techdocs.yml@v2.6.0
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
      azure-account-name: ${{ secrets.TECHDOCS_AZURE_ACCOUNT_NAME }}
      # optional: specifies the access key associated with the storage account
      azure-account-key: ${{ secrets.TECHDOCS_AZURE_ACCESS_KEY }}
```
</details>

### TestIO

<details>

<summary>This GitHub Action can be used to trigger a test on the external crowd-testing platform TestIO from a pull request.</summary>

```yml
name: TestIO - Trigger test from PR
on:
  issue_comment:
    types: [created, edited]

jobs:
  trigger-testio-test:
    uses: Staffbase/gha-workflows/.github/workflows/template_testio_trigger_test.yml@v2.6.0
    with:
      # optional: the slug you received from TestIO, defaults to 'staffbase'
      testio-slug: your TestIO slug
      # ID of the product on the TestIO platform to which the triggered test should be assigned to
      testio-product-id: your product ID
    secrets:
      # GitHub token to be used for commenting in a PR
      github-token: ${{ secrets.GITHUB_TOKEN }}
      # TestIO token of a user for which the triggered test is created 
      testio-token: ${{ secrets.TESTIO_TOKEN }}
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
    uses: Staffbase/gha-workflows/.github/workflows/template_yaml.yml@v2.6.0
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
