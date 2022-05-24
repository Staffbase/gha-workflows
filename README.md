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
    uses: Staffbase/gha-workflows/.github/workflows/template_*.yml@v1.3.0
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
    uses: Staffbase/gha-workflows/.github/workflows/template_autodev.yml@v1.3.0
    with:
      # optional: base branch from which the history originates, default: main
      base: master
      # optional: update status comment, default: false
      # if you want to change the message, please adapt 'success_comment' and/or 'failure_comment'
      comments: true
      # optional: update status label, default: false
      # if you want to change the labels, please adapt 'success_label' and/or 'failure_label'
      labels: true
    secrets:
      # token to fetch the pull requests
      token: ${{ <your-token> }}
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
    uses: Staffbase/gha-workflows/.github/workflows/template_jira_tagging.yml@v1.3.0
    with:
      # name of the service to add as label
      name: 'component name'
      # optional: regex to match the tags
      tag_matcher: your regex
    secrets:
      # basic url for jira api
      jira_url: ${{ <your-url> }}
      # api token for usage of jira
      jira_token: ${{ <your-token> }}
      # email of the api token owner
      jira_email: ${{ <your-email> }}
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
    uses: Staffbase/gha-workflows/.github/workflows/template_gitops.yml@v1.3.0
    with:
      # optional: list of build-time variables
      dockerbuildargs: |
        "any important args"
      # optional: set the target stage to build
      dockerbuildtarget: "any target"
      # optional: name of the docker image, default: private/<repository_name>
      dockerimage: ${{ inputs.image }}
      # optional: files which should be updated for dev
      gitopsdev: |-
        your files
      # optional: files which should be updated for stage
      gitopsstage: |-
        your files
      # optional: files which should be updated for prod
      gitopsprod: |-
        your files
    secrets:
      # token to access the repository
      gitops_token: ${{ <your-gitops-token> }}
      # username for the docker registry
      docker_username: ${{ <your-docker-username> }}
      # password for the docker registry
      docker_password: ${{ <your-docker-password> }}
```
</details>

### Release Drafter

<details>
<summary>The action can be used to draft automatically a new release.</summary>

If you want to use the template action please note that you must have the configuration file `.github/release-drafter.yml`.

```yml
name: Release Drafter

on:
  push:
    branches:
      - main

jobs:
  update_release_draft:
    uses: Staffbase/gha-workflows/.github/workflows/template_release_drafter.yml@v1.3.0
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

### Sonarcloud

<details>
<summary>The action can be used to analyze a project with sonarcloud.</summary>

```yml
name: Sonarcloud

on:
  push:
    branches:
      - '**'
    tags-ignore:
      - '**'

jobs:
  sonarcloud:
    uses: Staffbase/gha-workflows/.github/workflows/template_sonarcloud.yml@<version>
    with:
      path: <path-to-cached-coverage-file>
    secrets:
      token: ${{ secrets.GITHUB_TOKEN }}
      sonar_token: ${{ <your_token> }}
```

It is necessary that the coverage file is cached with the following code:

```yml
- name: Cache Coverage Data
  uses: actions/cache@<version>
  with:
    path: <path-to-cached-coverage-file>
    key: ${{ runner.os }}-coverage-data
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
    uses: Staffbase/gha-workflows/.github/workflows/template_stale.yml@<version>
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
    uses: Staffbase/gha-workflows/.github/workflows/template_yaml.yml@<version>
```
</details>

## Release 🔖

To create a new release just use [this page][2] and publish the draft release.

## Contributing 👥

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License 📄

This project is licensed under the Apache-2.0 License - see the [LICENSE.md](LICENSE) file for details.

[1]: https://docs.github.com/en/actions/learn-github-actions/reusing-workflows
[2]: https://github.com/Staffbase/gha-workflows/releases
