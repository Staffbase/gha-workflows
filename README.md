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
    uses: Staffbase/gha-workflows/.github/workflows/template_*.yml@<version>
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
    uses: Staffbase/gha-workflows/.github/workflows/template_autodev.yml@<version>
    secrets:
      token: ${{ <your-token> }}
```

| Property | Required | Type | Default |
|---|---|---|---|
| base | false | string | `main` |
| branch | false | string | `dev` |
| comments | false | boolean | `false` |
| email | false | string | `bot@example.com` |
| label | false | string | `dev` |
| user | false | string | `AutoDev Action` |

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
    uses: Staffbase/gha-workflows/.github/workflows/template_jira_tagging.yml@<version>
    with:
      name: 'component name'
    secrets:
      jira_url: ${{ <your-url> }}
      jira_token: ${{ <your-token> }}
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
    uses: Staffbase/gha-workflows/.github/workflows/template_gitops.yml@<version>
    secrets:
      gitops_token: ${{ <your-gitops-token> }}
      docker_username: ${{ <your-docker-username> }}
      docker_password: ${{ <your-docker-password> }}
```
</details>

### Release Drafter

<details>
<summary>The action can be used to draft automatically a new release.</summary>

```yml
name: Release Drafter

on:
  push:
    branches:
      - main

jobs:
  update_release_draft:
    uses: Staffbase/gha-workflows/.github/workflows/template_release_drafter.yml@<version>
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
