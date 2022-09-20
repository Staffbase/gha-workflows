# Reusable Workflows from the Enthusiasts 🎉

The repository contains all general workflows which can be used for every workflow in another repository.
If you want to have more information you can take a look at the [GitHub documentation][1].

If you want to use a template workflow you can copy the following template and adapt it to your specific use case.
You can find all possible template workflows in the directory `.github/workflows` with the name `template_*.yml`.

```yml
name: <your name>

on:
  ...

jobs:
  <action name>:
    uses: Staffbase/gha-workflows/.github/workflows/template_*.yml@v1.7.0
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
    types: [labeled, unlabeled, opened, closed]

jobs:
  autodev:
    uses: Staffbase/gha-workflows/.github/workflows/template_autodev.yml@v1.7.0
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
      # token to fetch the pull requests
      token: ${{ <your-token> }}
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
    uses: Staffbase/gha-workflows/.github/workflows/template_gitops.yml@v1.7.0
    with:
      # optional: list of build-time variables
      docker-build-args: |
        "any important args"
      # optional: set the target stage to build
      docker-build-target: "any target"
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
    uses: Staffbase/gha-workflows/.github/workflows/template_jira_tagging.yml@v1.7.0
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
    uses: Staffbase/gha-workflows/.github/workflows/template_release_drafter.yml@v1.7.0
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
  
  ### Secret Scanning
  
<details>
<summary>This workflow should be called by a PR and will scan it's commits for leaked credentials. The workflow will fail if any results are found.</summary>

```yml
name: Secret Scan

on: [pull_request]

jobs:
  trufflehog:
    uses: Staffbase/gha-workflows/.github/workflows/template_secret_scan.yml@v1.7.0
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
    uses: Staffbase/gha-workflows/.github/workflows/template_stale.yml@v1.7.0
    with:
      # optional: comment on the stale pull request while closed, default: This stale PR was closed because there was no activity.
      close-pr-message: your message
      # optional: idle number of days before marking pull requests stale, default: 60
      days-before-stale: 30
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

jobs:
  techdocs:
    uses: Staffbase/gha-workflows/.github/workflows/template_techdocs.yml@v1.7.0
    with:
      # optional: Kind of the Backstage entity, default: Component
      # ref: https://backstage.io/docs/features/software-catalog/descriptor-format#contents
      entity-kind: Component
      # optional: Name of the Backstage entity, default: repository name
      entity-name: custom-entity-name
    secrets:
      aws-access-key-id: ${{ secrets.TECHDOCS_AWS_ACCESS_KEY_ID }}
      aws-secret-access-key: ${{ secrets.TECHDOCS_AWS_SECRET_ACCESS_KEY }}
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
    uses: Staffbase/gha-workflows/.github/workflows/template_yaml.yml@v1.7.0
    with:
      # optional: name of the running action, default: yamllint / yamllint
      action-name: your name
      # optional: path which files should be checked recursively, default: .
      target-path: your path
```
</details>

## Release 🔖

To create a new release just use [this page][2] and publish the draft release.

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

[1]: https://docs.github.com/en/actions/learn-github-actions/reusing-workflows
[2]: https://github.com/Staffbase/gha-workflows/releases
